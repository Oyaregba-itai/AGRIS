"""HTTP contract checks for the AGRIS health endpoint."""

import asyncio

import httpx

from backend.app.main import app


def test_health_returns_service_status() -> None:
    """The public health route returns a successful JSON response."""
    async def request_health() -> httpx.Response:
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(
            transport=transport, base_url="http://test"
        ) as client:
            return await client.get("/health")

    response = asyncio.run(request_health())

    assert response.status_code == 200
    assert response.headers["content-type"] == "application/json"
    assert response.json() == {"status": "ok", "service": "AGRIS"}
