"""
Pytest Configuration for Database Tests
"""

import pytest
import sqlite3
import sys
import os

# Add project root to path
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
if project_root not in sys.path:
    sys.path.insert(0, project_root)


@pytest.fixture
def db_conn():
    """Create in-memory database for testing."""
    conn = sqlite3.connect(':memory:')
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    
    # Create all tables
    from shared.database.schema import create_all_tables
    create_all_tables(conn)
    
    yield conn
    conn.close()


@pytest.fixture
def sample_user_id():
    """Sample user ID for testing."""
    return "test_user_001"


@pytest.fixture
def sample_conversation_data():
    """Sample conversation data for testing."""
    return {
        "user_id": "test_user_001",
        "transcript": [
            {"role": "user", "content": "Hello"},
            {"role": "assistant", "content": "Hi there!"}
        ],
        "conversational_context": "Test context",
        "started_at": "2025-01-01T10:00:00Z",
        "ended_at": "2025-01-01T10:05:00Z",
        "duration_seconds": 300
    }

