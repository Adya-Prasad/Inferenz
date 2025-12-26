"""Semantic search over DataChunks using pgvector similarity (vector <-> query).

Endpoint: POST / (under /api/v1/search) accepts `query` and `top_k`, computes/query embedding,
and returns nearest chunks ordered by distance.
"""
from typing import List, Optional
import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from ....schemas import SearchRequest, SearchResult
from ....database import get_session

logger = logging.getLogger(__name__)
router = APIRouter()


async def get_query_embedding(query: str) -> List[float]:
    """Try to compute embedding; fallback to deterministic pseudo-embedding if models are not installed.

    Return a list of 384 floats.
    """
    try:
        # Lazy attempt to use sentence-transformers if available
        from sentence_transformers import SentenceTransformer

        model = SentenceTransformer("all-MiniLM-L6-v2")
        emb = model.encode(query)
        return emb.tolist()
    except Exception as e:
        logger.debug("Embedding model not available, using fallback: %s", e)
        # Simple deterministic fallback: use hash to populate a small vector signature
        import hashlib

        h = hashlib.sha256(query.encode("utf-8")).digest()
        vec = [float(b) / 255.0 for b in h]
        # pad/truncate to 384
        vec = (vec * (384 // len(vec) + 1))[:384]
        return vec


async def search_chunks(session: AsyncSession, embedding: List[float], top_k: int = 5):
    """Run a pgvector nearest neighbor search. Returns list of mappings.

    This function is isolated to make testing easier (can be monkeypatched).
    """
    # Raw SQL using the <-> operator for pgvector (distance)
    sql = text(
        "SELECT id, datasource_id, chunk_text, metadata, (embedding <-> :emb) AS distance "
        "FROM data_chunks ORDER BY distance ASC LIMIT :k"
    )
    params = {"emb": embedding, "k": top_k}
    res = await session.execute(sql, params)
    rows = res.fetchall()
    results = []
    for r in rows:
        # SQLAlchemy Row mapping support
        m = dict(r._mapping) if hasattr(r, "_mapping") else dict(r)
        results.append(m)
    return results


@router.post("/", response_model=List[SearchResult])
async def semantic_search(req: SearchRequest, db: AsyncSession = Depends(get_session)):
    """Semantic search endpoint.

    Returns list of nearest `DataChunk`s.
    """
    if not req.query or not req.query.strip():
        raise HTTPException(status_code=400, detail="query must not be empty")

    emb = await get_query_embedding(req.query)
    rows = await search_chunks(db, emb, req.top_k)

    # map rows to SearchResult-compatible dicts
    out = []
    for r in rows:
        out.append(
            {
                "id": r["id"],
                "datasource_id": r["datasource_id"],
                "chunk_text": r["chunk_text"],
                "metadata": r.get("metadata"),
                "distance": float(r.get("distance")) if r.get("distance") is not None else None,
            }
        )
    return out
