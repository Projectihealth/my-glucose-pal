"""
Database Connection Management

Provides centralized database connection handling for all services.
Supports both SQLite and MySQL databases.

⚠️ IMPORTANT: Database Type Selection
- The active database type is controlled by DB_TYPE in .env file
- DB_TYPE=sqlite: Uses SQLite (storage/databases/cgm_butler.db)
- DB_TYPE=mysql: Uses MySQL (connection details from .env)

🔧 Usage:
- ALWAYS use get_connection() or get_db_session() for database access
- DO NOT directly access SQLite files when DB_TYPE=mysql
- The get_db_path() function is ONLY for SQLite mode
"""

import sqlite3
import os
import sys
from typing import Optional, Union
from contextlib import contextmanager

# 添加项目根目录到路径
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

try:
    import pymysql
    MYSQL_AVAILABLE = True
except ImportError:
    MYSQL_AVAILABLE = False
    pymysql = None


def get_db_path(db_name: str = 'cgm_butler.db') -> str:
    """
    Get the database file path.
    
    ⚠️ WARNING: This function is ONLY for SQLite mode.
    If DB_TYPE=mysql in .env, this function should NOT be used.
    Use get_connection() instead, which handles both SQLite and MySQL.
    
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


def get_connection(db_path: Optional[str] = None) -> Union[sqlite3.Connection, 'pymysql.connections.Connection']:
    """
    Get a database connection (SQLite or MySQL based on config).
    
    Args:
        db_path: Optional custom database path (SQLite only)
        
    Returns:
        Database connection (SQLite or MySQL)
    """
    from config.settings import settings
    
    db_type = settings.DB_TYPE.lower()
    
    if db_type == 'mysql':
        if not MYSQL_AVAILABLE:
            raise ImportError("PyMySQL not installed. Install with: pip install pymysql")
        
        from shared.database.mysql_connection import MySQLConnection
        return MySQLConnection.get_connection()
    
    else:  # Default to SQLite
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
    Context manager for database sessions (SQLite or MySQL).
    
    Usage:
        with get_db_session() as conn:
            cursor = conn.cursor()
            cursor.execute(...)
            conn.commit()
    
    Args:
        db_path: Optional custom database path (SQLite only)
        
    Yields:
        Database connection (SQLite or MySQL)
    """
    from config.settings import settings
    
    db_type = settings.DB_TYPE.lower()
    
    if db_type == 'mysql':
        if not MYSQL_AVAILABLE:
            raise ImportError("PyMySQL not installed. Install with: pip install pymysql")
        
        from shared.database.mysql_connection import MySQLConnection
        with MySQLConnection.get_db_session() as conn:
            yield conn
    else:
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
    Initialize database with all tables (SQLite or MySQL).
    
    Args:
        db_path: Optional custom database path (SQLite only)
    """
    from config.settings import settings
    
    db_type = settings.DB_TYPE.lower()
    
    if db_type == 'mysql':
        if not MYSQL_AVAILABLE:
            raise ImportError("PyMySQL not installed. Install with: pip install pymysql")
        
        from shared.database.mysql_schema import create_all_tables
        from shared.database.mysql_connection import MySQLConnection
        
        conn = MySQLConnection.get_connection()
        try:
            create_all_tables(conn)
            print(f"✅ MySQL数据库初始化成功: {settings.MYSQL_HOST}:{settings.MYSQL_PORT}/{settings.MYSQL_DATABASE}")
        finally:
            conn.close()
    else:
        from .schema import create_all_tables
        
        if db_path is None:
            db_path = get_db_path()
        
        conn = get_connection(db_path)
        try:
            create_all_tables(conn)
            print(f"✅ SQLite数据库初始化成功: {db_path}")
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

