"""
Tests for MemoryRepository
"""

import pytest
from shared.database.repositories import MemoryRepository


def test_save_memory(db_conn, sample_user_id):
    """Test saving short-term memory."""
    repo = MemoryRepository(db_conn)
    
    memory_id = repo.save_memory(
        user_id=sample_user_id,
        conversation_id="conv_123",
        channel="gpt_chat",
        summary="User discussed their diet",
        insights="User prefers low-carb meals",
        key_topics=["diet", "low-carb"],
        extracted_data={"meal_type": "breakfast"}
    )
    
    assert memory_id is not None
    assert isinstance(memory_id, int)


def test_get_recent_memories(db_conn, sample_user_id):
    """Test getting recent memories."""
    repo = MemoryRepository(db_conn)
    
    # Save memories
    repo.save_memory(
        user_id=sample_user_id,
        conversation_id="conv_1",
        channel="gpt_chat",
        summary="Memory 1"
    )
    repo.save_memory(
        user_id=sample_user_id,
        conversation_id="conv_2",
        channel="retell_voice",
        summary="Memory 2"
    )
    
    # Get recent memories
    memories = repo.get_recent_memories(user_id=sample_user_id, days=7, limit=10)
    
    assert len(memories) == 2
    assert memories[0]['summary'] in ["Memory 1", "Memory 2"]


def test_update_long_term_memory(db_conn, sample_user_id):
    """Test updating long-term memory."""
    repo = MemoryRepository(db_conn)
    
    # First update (insert)
    repo.update_long_term_memory(
        user_id=sample_user_id,
        preferences={"diet": "low-carb"},
        health_goals={"weight": "lose 10 lbs"}
    )
    
    # Verify
    ltm = repo.get_long_term_memory(user_id=sample_user_id)
    assert ltm is not None
    assert ltm['preferences']['diet'] == "low-carb"
    assert ltm['health_goals']['weight'] == "lose 10 lbs"
    
    # Second update (update existing)
    repo.update_long_term_memory(
        user_id=sample_user_id,
        habits={"exercise": "3x per week"}
    )
    
    # Verify again
    ltm = repo.get_long_term_memory(user_id=sample_user_id)
    assert ltm['preferences']['diet'] == "low-carb"  # Still there
    assert ltm['habits']['exercise'] == "3x per week"  # New field


def test_save_todos(db_conn, sample_user_id):
    """Test saving TODO list."""
    repo = MemoryRepository(db_conn)
    
    todos = [
        {
            "title": "Eat vegetables 8 times",
            "description": "Include vegetables in meals",
            "category": "diet",
            "target_count": 8
        },
        {
            "title": "Exercise 3 times",
            "description": "30 minutes cardio",
            "category": "exercise",
            "target_count": 3
        }
    ]
    
    todo_ids = repo.save_todos(
        user_id=sample_user_id,
        conversation_id="conv_123",
        todos=todos,
        week_start="2025-01-13"
    )
    
    assert len(todo_ids) == 2
    
    # Get weekly todos
    weekly_todos = repo.get_weekly_todos(
        user_id=sample_user_id,
        week_start="2025-01-13"
    )
    
    assert len(weekly_todos) == 2
    assert weekly_todos[0]['title'] in ["Eat vegetables 8 times", "Exercise 3 times"]

