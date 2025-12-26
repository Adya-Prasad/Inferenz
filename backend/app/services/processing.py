"""Background processing for datasources: OCR, chunking, embeddings, and storing DataChunks.

This module tries to use Hugging Face models when available (TrOCR for handwritten OCR,
and SentenceTransformers for embeddings), with sensible fallbacks to `pytesseract` for OCR.
Model loading is done lazily and CPU/GPU usage depends on installed backends (torch).
"""
import io
import logging
import asyncio
from typing import Optional
from uuid import UUID

from PIL import Image
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from ..database import AsyncSessionLocal
from ..models import Datasource, DataChunk, DatasourceStatus

logger = logging.getLogger(__name__)

# Lazy-loaded model references
_trocr_processor = None
_trocr_model = None
_embed_model = None


def _load_trocr():
    global _trocr_processor, _trocr_model
    if _trocr_processor is None or _trocr_model is None:
        try:
            from transformers import TrOCRProcessor, VisionEncoderDecoderModel

            model_name = "microsoft/trocr-base-handwritten"
            _trocr_processor = TrOCRProcessor.from_pretrained(model_name)
            _trocr_model = VisionEncoderDecoderModel.from_pretrained(model_name)
            logger.info("Loaded TrOCR model for handwriting OCR")
        except Exception as e:
            logger.warning("TrOCR not available: %s", e)
            _trocr_processor = None
            _trocr_model = None


def _load_embed_model():
    global _embed_model
    if _embed_model is None:
        try:
            from sentence_transformers import SentenceTransformer

            _embed_model = SentenceTransformer("all-MiniLM-L6-v2")
            logger.info("Loaded sentence-transformers embedding model")
        except Exception as e:
            logger.warning("Sentence-Transformers not available: %s", e)
            _embed_model = None


def _ocr_image_sync(image: Image.Image) -> str:
    """Run OCR on a PIL Image using TrOCR if available, otherwise fallback to pytesseract."""
    # Try TrOCR first
    try:
        _load_trocr()
        if _trocr_processor and _trocr_model is not None:
            pixel_values = _trocr_processor(images=image, return_tensors="pt").pixel_values
            generated_ids = _trocr_model.generate(pixel_values)
            out = _trocr_processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
            return out
    except Exception as e:
        logger.debug("TrOCR failed: %s", e)

    # Fallback to pytesseract
    try:
        import pytesseract

        return pytesseract.image_to_string(image)
    except Exception as e:
        logger.warning("pytesseract not available or failed: %s", e)
        return ""  # return empty if OCR fails


def _embed_text_sync(text: str) -> Optional[list]:
    """Compute embedding for a single text chunk synchronously. Returns list[float] or None."""
    try:
        _load_embed_model()
        if _embed_model is None:
            return None
        emb = _embed_model.encode(text)
        return emb.tolist()
    except Exception as e:
        logger.warning("Embedding failed: %s", e)
        return None


def _split_text_chunks(text: str, max_chars: int = 500):
    """Naive splitting of text into chunks of <= max_chars, preserving lines when possible."""
    text = text.strip()
    if not text:
        return []
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    chunks = []
    for p in paragraphs:
        while len(p) > max_chars:
            chunks.append(p[:max_chars])
            p = p[max_chars:]
        if p:
            chunks.append(p)
    # If there were no paragraphs, fallback to slicing
    if not chunks:
        for i in range(0, len(text), max_chars):
            chunks.append(text[i : i + max_chars])
    return chunks


async def process_datasource(datasource_id: UUID, content: bytes, content_type: Optional[str] = None) -> None:
    """Background task: perform OCR, chunking, embedding and persist DataChunks.

    - Updates the datasource.status to `processing` at start and `completed` or `failed` at end.
    - Uses local DB session (AsyncSessionLocal) so this can be called outside request context.
    """
    async with AsyncSessionLocal() as session:  # type: AsyncSession
        try:
            # Mark datasource as processing
            q = await session.execute(select(Datasource).where(Datasource.id == datasource_id))
            ds = q.scalar_one_or_none()
            if ds is None:
                logger.error("Datasource %s not found", datasource_id)
                return

            ds.status = DatasourceStatus.processing
            session.add(ds)
            await session.commit()

            # Extract text based on content_type (very basic)
            extracted_text = ""
            if content_type and content_type.startswith("image/"):
                img = Image.open(io.BytesIO(content)).convert("RGB")
                loop = asyncio.get_running_loop()
                # run CPU-bound OCR in thread pool
                extracted_text = await loop.run_in_executor(None, _ocr_image_sync, img)
            elif content_type == "application/pdf":
                # Try to convert PDF pages to images using pdf2image if available
                try:
                    from pdf2image import convert_from_bytes

                    pages = convert_from_bytes(content)
                    texts = []
                    loop = asyncio.get_running_loop()
                    for page in pages:
                        txt = await loop.run_in_executor(None, _ocr_image_sync, page)
                        texts.append(txt)
                    extracted_text = "\n\n".join(texts)
                except Exception as e:
                    logger.warning("pdf2image not available or failed: %s; falling back to mock text", e)
                    extracted_text = "[pdf text extraction not available in this environment]"
            else:
                # treat as plain text or unknown binary
                try:
                    extracted_text = content.decode("utf-8")
                except Exception:
                    extracted_text = ""

            if not extracted_text:
                logger.info("No text extracted for datasource %s", datasource_id)

            # Split into chunks
            chunks = _split_text_chunks(extracted_text, max_chars=500)

            loop = asyncio.get_running_loop()
            for c in chunks:
                # Compute embedding in threadpool
                emb = await loop.run_in_executor(None, _embed_text_sync, c)
                dc = DataChunk(
                    datasource_id=ds.id,
                    user_id=ds.user_id,
                    chunk_text=c,
                    metadata={"source": "ocr"},
                    embedding=emb,
                )
                session.add(dc)

            # finalize
            ds.status = DatasourceStatus.completed
            session.add(ds)
            await session.commit()
            logger.info("Processing complete for datasource %s (chunks=%d)", datasource_id, len(chunks))
        except Exception as exc:  # broad catch to ensure status updated
            logger.exception("Processing failed for datasource %s: %s", datasource_id, exc)
            if 'ds' in locals() and ds is not None:
                ds.status = DatasourceStatus.failed
                session.add(ds)
                await session.commit()
            return
