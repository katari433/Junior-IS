import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


# Load database credentials from environment variables
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")


# Construct the MySQL connection URL
DATABASE_URL = (
    f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}"
    f"@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)


# Create the database engine and check connections before use
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True
)


# Configure database sessions with manual transaction control
SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False
)