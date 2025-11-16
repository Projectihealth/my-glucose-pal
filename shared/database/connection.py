"""
Database Connection Management

Provides centralized database connection handling for all services.
"""

import sqlite3
import os
from typing import Optional
from contextlib import contextmanager


def get_db_path(db_name: str = 'cgm_butler.db') -> str:
    """
    Get the database file path.
    
    Priority:
    1. Environment variable: CGM_DB_PATH
    2. storage/databases/ directory (production)
    3. Fallback to project root
    
    Args:
        db_name: Database filename
        
    Returns:
        Absolute path to database file
    """
    # Check environment variable first
    env_path = os.getenv('CGM_DB_PATH')
    if env_path:
        return env_path
    
    # Try storage/databases/ (production)
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    storage_path = os.path.join(project_root, 'storage', 'databases', db_name)
    
    if os.path.exists(storage_path):
        return storage_path
    
    # Fallback: create storage directory if it doesn't exist
    storage_dir = os.path.dirname(storage_path)
    if not os.path.exists(storage_dir):
        os.makedirs(storage_dir, exist_ok=True)
    
    return storage_path


def get_connection(db_path: Optional[str] = None) -> sqlite3.Connection:
    """
    Get a database connection.
    
    Args:
        db_path: Optional custom database path
        
    Returns:
        SQLite connection with row_factory set
    """
    if db_path is None:
        db_path = get_db_path()
    
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    
    # Enable foreign keys
    conn.execute("PRAGMA foreign_keys = ON")
    
    return conn


@contextmanager
def get_db_session(db_path: Optional[str] = None):
    """
    Context manager for database sessions.
    
    Usage:
        with get_db_session() as conn:
            cursor = conn.cursor()
            cursor.execute(...)
            conn.commit()
    
    Args:
        db_path: Optional custom database path
        
    Yields:
        SQLite connection
    """
    conn = get_connection(db_path)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_database(db_path: Optional[str] = None) -> None:
    """
    Initialize database with all tables.
    
    Args:
        db_path: Optional custom database path
    """
    from .schema import create_all_tables
    
    if db_path is None:
        db_path = get_db_path()
    
    conn = get_connection(db_path)
    try:
        create_all_tables(conn)
        print(f"✅ Database initialized: {db_path}")
    finally:
        conn.close()


if __name__ == '__main__':
    # Test connection
    print("Testing database connection...")
    print(f"Database path: {get_db_path()}")
    
    with get_db_session() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        print(f"Found {len(tables)} tables:")
        for table in tables:
            print(f"  - {table[0]}")

