"""FastAPI entry point for the advisory-first AGRIS platform."""

from typing import Literal

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sqlalchemy.exc import SQLAlchemyError

from backend.app.database import check_connection


class HealthResponse(BaseModel):
    """Service liveness; does not claim database or model readiness."""

    status: Literal["ok"]
    service: Literal["AGRIS"]


app = FastAPI(
    title="AGRIS API",
    description="Advisory-first agricultural intelligence API.",
    version="0.1.0",
)


@app.get("/health", response_model=HealthResponse, tags=["health"])
def health() -> HealthResponse:
    """Confirm that the API process can respond to requests."""
    return HealthResponse(status="ok", service="AGRIS")


@app.get("/health/database", response_model=HealthResponse, tags=["health"])
def database_health() -> HealthResponse:
    """Check MySQL availability without exposing credentials or driver errors."""
    try:
        check_connection()
    except (SQLAlchemyError, ValueError):
        raise HTTPException(
            status_code=503,
            detail="Database unavailable. Check MySQL and the local .env configuration.",
        ) from None
    return HealthResponse(status="ok", service="AGRIS")
