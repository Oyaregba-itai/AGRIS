"""SQLAlchemy connection and request-scoped sessions for local MySQL."""

import os
from collections.abc import Iterator
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import URL, Engine, create_engine, text
from sqlalchemy.orm import DeclarativeBase, Session


class Base(DeclarativeBase):
    """Base class for future AGRIS database models."""


def database_url() -> URL:
    """Read configuration; URL.create handles special password characters."""
    load_dotenv(Path(__file__).resolve().parents[2] / ".env", override=False)
    database = os.getenv("MYSQL_DATABASE", "agris")
    if not database.strip():
        raise ValueError("MYSQL_DATABASE must not be empty")
    port = int(os.getenv("MYSQL_PORT", "3306"))
    if not 1 <= port <= 65535:
        raise ValueError("MYSQL_PORT must be between 1 and 65535")
    return URL.create(
        "mysql+pymysql",
        username=os.getenv("MYSQL_USER", "root"),
        password=os.getenv("MYSQL_PASSWORD", ""),
        host=os.getenv("MYSQL_HOST", "127.0.0.1"),
        port=port,
        database=database,
        query={"charset": "utf8mb4"},
    )


@lru_cache(maxsize=1)
def get_engine() -> Engine:
    """Create a lazy engine; verify pooled connections before reuse."""
    return create_engine(
        database_url(),
        pool_pre_ping=True,
        pool_recycle=1800,
        connect_args={"connect_timeout": 5},
    )


def get_session() -> Iterator[Session]:
    """Yield a session; callers explicitly commit writes when appropriate."""
    with Session(get_engine()) as session:
        yield session


def check_connection() -> None:
    """Check the selected database without creating or modifying records."""
    with get_engine().connect() as connection:
        connection.execute(text("SELECT 1"))


if __name__ == "__main__":
    import sys

    from sqlalchemy.exc import SQLAlchemyError

    try:
        check_connection()
    except (SQLAlchemyError, ValueError):
        print("MySQL unavailable: check the service, .env credentials and agris database.")
        sys.exit(1)
    else:
        print("MySQL connection successful.")
