import pytest
from httpx import AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_semantic_search_hindi(monkeypatch):
    # Fake embedding vector for 'दूध'
    fake_emb = [1.0] + [0.0] * 383

    async def fake_get_query_embedding(query: str):
        assert "दूध" in query or "milk" in query or len(query) > 0
        return fake_emb

    async def fake_search_chunks(session, embedding, top_k=5):
        assert embedding == fake_emb
        return [
            {
                "id": "11111111-1111-1111-1111-111111111111",
                "datasource_id": "22222222-2222-2222-2222-222222222222",
                "chunk_text": "दूध बिक्री - 10 लीटर",
                "metadata": {"lang": "hi"},
                "distance": 0.01,
            }
        ]

    monkeypatch.setattr("app.api.v1.endpoints.search.get_query_embedding", fake_get_query_embedding)
    monkeypatch.setattr("app.api.v1.endpoints.search.search_chunks", fake_search_chunks)

    async with AsyncClient(app=app, base_url="http://test") as ac:
        resp = await ac.post("/api/v1/search/", json={"query": "दूध", "top_k": 3})

    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert any("दूध" in r["chunk_text"] for r in data)
