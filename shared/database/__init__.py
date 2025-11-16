"""
Shared Database Layer

This module provides a unified database access layer for all services
(Backend Flask app, Minerva FastAPI service, etc.)

Usage:
    from shared.database import get_connection, ConversationRepository
    
    conn = get_connection()
    repo = ConversationRepository(conn)
    conversations = repo.get_user_conversations(user_id)
"""

from .connection import get_connection, get_db_path
from .repositories import (
    ConversationRepository,
    MemoryRepository,
    CGMRepository,
    UserRepository,
    OnboardingStatusRepository
)

__all__ = [
    'get_connection',
    'get_db_path',
    'ConversationRepository',
    'MemoryRepository',
    'CGMRepository',
    'UserRepository',
    'OnboardingStatusRepository',
]

