"""Datasource endpoints: handle uploads and create Datasource records."""
from uuid import uuid4
import logging
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ....schemas import DatasourceRead
from ....models import Datasource, DatasourceStatus
from ....database import get_session
from ....services.processing import process_datasource

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/", response_model=DatasourceRead)
async def create_datasource(
    file: UploadFile = File(...), background_tasks: BackgroundTasks = None, db: AsyncSession = Depends(get_session)
):
    """Accept an uploaded file, simulate storing it, create a Datasource DB record, and enqueue background processing.

    For now, user_id is hardcoded to `None` (replaceable later).
    """
    # Generate a unique storage key
    storage_key = f"user_{'anonymous'}/{uuid4()}/{file.filename}"

    # Simulate upload to object storage - in prod, upload to S3/GCS
    content = await file.read()
    logger.info(f"Simulated upload: {storage_key} ({len(content)} bytes)")

    datasource = Datasource(
        file_name=file.filename,
        storage_key=storage_key,
        file_type=file.content_type or "application/octet-stream",
        status=DatasourceStatus.uploaded,
        user_id=None,
    )
    db.add(datasource)
    await db.commit()
    await db.refresh(datasource)

    # Enqueue background processing (in-process BackgroundTasks)
    if background_tasks is not None:
        background_tasks.add_task(process_datasource, datasource.id, content, datasource.file_type)
        logger.info("Enqueued processing for datasource %s", datasource.id)
    else:
        # If no BackgroundTasks provided, process inline (useful for some tests)
        await process_datasource(datasource.id, content, datasource.file_type)

    return datasource
