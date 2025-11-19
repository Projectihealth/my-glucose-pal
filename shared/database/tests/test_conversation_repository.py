"""
Tests for ConversationRepository
"""

import pytest
from shared.database.repositories import ConversationRepository


def test_save_gpt_conversation(db_conn, sample_conversation_data):
    """Test saving GPT conversation."""
    repo = ConversationRepository(db_conn)
    
    conv_id = repo.save_gpt_conversation(**sample_conversation_data)
    
    assert conv_id is not None
    assert isinstance(conv_id, str)
    
    # Verify saved data
    conv = repo.get_by_id(conv_id)
    assert conv is not None
    assert conv['user_id'] == sample_conversation_data['user_id']
    assert conv['conversation_type'] == 'gpt_chat'
    assert len(conv['transcript']) == 2


def test_get_user_conversations(db_conn, sample_conversation_data):
    """Test getting user conversations."""
    repo = ConversationRepository(db_conn)
    
    # Save multiple conversations
    conv_id_1 = repo.save_gpt_conversation(**sample_conversation_data)
    conv_id_2 = repo.save_gpt_conversation(**sample_conversation_data)
    
    # Get conversations
    conversations = repo.get_user_conversations(
        user_id=sample_conversation_data['user_id'],
        limit=10
    )
    
    assert len(conversations) == 2
    assert conversations[0]['conversation_id'] in [conv_id_1, conv_id_2]


def test_get_stats(db_conn, sample_conversation_data):
    """Test getting conversation statistics."""
    repo = ConversationRepository(db_conn)
    
    # Save conversations
    repo.save_gpt_conversation(**sample_conversation_data)
    repo.save_gpt_conversation(**sample_conversation_data)
    
    # Get stats
    stats = repo.get_stats(user_id=sample_conversation_data['user_id'], days=7)
    
    assert stats['total_conversations'] == 2
    assert 'gpt_chat' in stats['by_type']
    assert stats['by_type']['gpt_chat'] == 2
    assert stats['total_duration_seconds'] == 600  # 2 * 300


def test_save_retell_conversation(db_conn, sample_user_id):
    """Test saving Retell voice conversation."""
    repo = ConversationRepository(db_conn)
    
    conv_id = repo.save_retell_conversation(
        user_id=sample_user_id,
        retell_call_id="call_123",
        retell_agent_id="agent_456",
        call_status="ended",
        call_type="web_call",
        started_at="2025-01-01T10:00:00Z",
        transcript="User: Hello\nAssistant: Hi!",
        transcript_object=[
            {"role": "user", "content": "Hello"},
            {"role": "assistant", "content": "Hi!"}
        ]
    )
    
    assert conv_id is not None
    
    # Verify
    conv = repo.get_by_id(conv_id)
    assert conv['conversation_type'] == 'retell_voice'
    assert conv['retell_call_id'] == "call_123"
    assert isinstance(conv['transcript'], str)
    assert isinstance(conv['transcript_object'], list)

