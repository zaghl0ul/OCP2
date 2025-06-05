from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, scoped_session
import os
from contextlib import contextmanager
import logging

from models.database import Base

# Configure logging
logger = logging.getLogger(__name__)

# Get the DB URL from environment variable or use SQLite as default
DB_URL = os.environ.get("DATABASE_URL", "sqlite:///./openclip.db")

# Create engine
engine = create_engine(
    DB_URL, 
    connect_args={"check_same_thread": False} if DB_URL.startswith("sqlite") else {},
    echo=False  # Set to True for SQL debugging
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
SessionScoped = scoped_session(SessionLocal)

# Initialize database tables
def init_db():
    """Initialize the database tables"""
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created")

# Dependency to get DB session
def get_db():
    """Get a database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Context manager for DB session
@contextmanager
def get_db_session():
    """Context manager for database session"""
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception as e:
        session.rollback()
        raise
    finally:
        session.close() 