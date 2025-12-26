"""Pydantic schemas for request/response validation."""
from __future__ import annotations
from typing import Optional, Any
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field


class DatasourceBase(BaseModel):
    file_name: str
    file_type: str


class DatasourceCreate(DatasourceBase):
    pass


class DatasourceRead(DatasourceBase):
    id: UUID
    user_id: Optional[UUID]
    storage_key: str
    status: str
    created_at: datetime

    class Config:
        orm_mode = True


class DataChunkRead(BaseModel):
    id: UUID
    datasource_id: UUID
    chunk_text: str
    # Use `metadata_` as the attribute name (matches the ORM) but expose as `metadata` in JSON
    metadata_: Optional[Any] = Field(None, alias="metadata")

    class Config:
        orm_mode = True
        # Allow using field names during population if needed
        allow_population_by_field_name = True


# Search schemas
class SearchRequest(BaseModel):
    query: str
    top_k: int = 5


class SearchResult(BaseModel):
    id: UUID
    datasource_id: UUID
    chunk_text: str
    metadata: Optional[Any]
    distance: Optional[float]

    class Config:
        orm_mode = True
