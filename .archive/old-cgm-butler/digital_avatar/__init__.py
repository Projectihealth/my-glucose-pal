"""
Digital Avatar Module for CGM Butler

This module integrates Tavus digital avatar with CGM data to provide
intelligent conversational interactions with users.

Main Components:
- TavusClient: Client for Tavus API
- CGMTools: Tools for retrieving CGM data
- ConversationManager: Manages conversations with digital avatar
- AvatarConfig: Configuration management

Usage:
    from digital_avatar import ConversationManager
    
    manager = ConversationManager()
    conversation = manager.start_conversation('user_001')
    response = manager.send_message(conversation['conversation_id'], "What's my glucose?")
"""

from .tavus_client import TavusClient
from .cgm_tools import CGMTools, FUNCTION_DEFINITIONS
from .conversation_manager import ConversationManager
from .config import AvatarConfig

__all__ = [
    'TavusClient',
    'CGMTools',
    'ConversationManager',
    'AvatarConfig',
    'FUNCTION_DEFINITIONS'
]

__version__ = '1.0.0'


