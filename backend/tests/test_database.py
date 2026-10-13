"""Configuration and API failure behavior; no running MySQL required."""

import asyncio

import httpx
from sqlalchemy.exc import OperationalError

from backend.app import database, main


def test_password_special_characters(monkeypatch) -> None:
    """Passwords are preserved without manual URL encoding."""
    monkeypatch.setenv("MYSQL_PASSWORD", "example@:/#pass")
    monkeypatch.setenv("MYSQL_DATABASE", "agris")
    monkeypatch.setenv("MYSQL_PORT", "3306")
    url = database.database_url()
    assert url.password == "example@:/#pass"
    assert url.database == "agris"
    assert url.drivername == "mysql+pymysql"


def test_database_health_hides_driver_details(monkeypatch) -> None:
    """An unavailable database returns 503 without leaking connection details."""
    def fail() -> None:
        raise OperationalError("SELECT 1", {}, Exception("private connection details"))

    monkeypatch.setattr(main, "check_connection", fail)

    async def request() -> httpx.Response:
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=main.app), base_url="http://test"
        ) as client:
            return await client.get("/health/database")

    response = asyncio.run(request())
    assert response.status_code == 503
    assert "private connection details" not in response.text
    assert response.json()["detail"].startswith("Database unavailable.")
