"""ORM models for the application.

Models:
- User (minimal stub for FK references)
- Datasource
- DataChunk

Uses pgvector.sqlalchemy.Vector for embeddings storage.
"""
from datetime import datetime
import enum
import uuid
from sqlalchemy import (
    Column,
    String,
    Enum,
    DateTime,
    ForeignKey,
    Text,
    JSON,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector

from .database import Base


class DatasourceStatus(str, enum.Enum):
    uploaded = "uploaded"
    processing = "processing"
    failed = "failed"
    completed = "completed"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=True)


class Datasource(Base):
    __tablename__ = "datasources"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    file_name = Column(String, nullable=False)
    storage_key = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    status = Column(Enum(DatasourceStatus), default=DatasourceStatus.uploaded)
    created_at = Column(DateTime, default=datetime.utcnow)

    chunks = relationship("DataChunk", back_populates="datasource")


class DataChunk(Base):
    __tablename__ = "data_chunks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    datasource_id = Column(UUID(as_uuid=True), ForeignKey("datasources.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    chunk_text = Column(Text, nullable=False)
    # 'metadata' is reserved on declarative classes; use a different attribute name
    # while preserving the column name in the DB so external APIs and schemas remain unchanged.
    metadata_ = Column("metadata", JSON, nullable=True)
    embedding = Column(Vector(384), nullable=True)

    datasource = relationship("Datasource", back_populates="chunks")

    # The JSON column is named `metadata` in the DB but the Python attribute
    # is `metadata_` to avoid colliding with SQLAlchemy's declarative `metadata`.
    # Access the JSON payload on instances via `instance.metadata_`.
