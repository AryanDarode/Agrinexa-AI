import os

from dotenv import load_dotenv

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.engine import URL


load_dotenv()


POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")

if not POSTGRES_PASSWORD:
    raise RuntimeError(
        "POSTGRES_PASSWORD is not set in the environment."
    )


DATABASE_URL = URL.create(
    drivername="postgresql+psycopg2",
    username="postgres",
    password=POSTGRES_PASSWORD,
    host="localhost",
    port=5433,
    database="agrinexa"
)


engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True
)


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


Base = declarative_base()


def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()