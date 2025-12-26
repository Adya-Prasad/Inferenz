import asyncio
import pytest
from httpx import AsyncClient

from app.main import app


class DummySession:
    def __init__(self):
        self.added = []

    def add(self, obj):
        self.added.append(obj)

    async def commit(self):
        pass

    async def refresh(self, obj):
        # mimic setting an id
        if hasattr(obj, "id") and obj.id is None:
            import uuid

            obj.id = uuid.uuid4()


@pytest.mark.asyncio
async def test_create_datasource_endpoint(monkeypatch):
    async def fake_get_session():
        yield DummySession()

    # patch the get_session used in the endpoint
    monkeypatch.setattr("app.api.v1.endpoints.datasources.get_session", fake_get_session)

    async with AsyncClient(app=app, base_url="http://test") as ac:
        files = {"file": ("test.txt", b"hello world", "text/plain")}
        resp = await ac.post("/api/v1/datasources/", files=files)

    assert resp.status_code == 200
    data = resp.json()
    assert data["file_name"] == "test.txt"
