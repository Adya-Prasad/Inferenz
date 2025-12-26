import pytest
import asyncio
from httpx import AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_create_datasource_enqueues_processing(monkeypatch):
    called = {"cnt": 0}

    async def fake_processing(datasource_id, content, content_type=None):
        called["cnt"] += 1

    # Patch the background processing function used by the endpoint
    monkeypatch.setattr("app.api.v1.endpoints.datasources.process_datasource", fake_processing)

    async with AsyncClient(app=app, base_url="http://test") as ac:
        files = {"file": ("test.txt", b"hello world", "text/plain")}
        resp = await ac.post("/api/v1/datasources/", files=files)

    assert resp.status_code == 200
    # BackgroundTasks executes after response; give a tiny moment for it
    await asyncio.sleep(0.05)
    assert called["cnt"] == 1
