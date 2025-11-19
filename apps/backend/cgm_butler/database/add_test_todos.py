#!/usr/bin/env python3
"""
Add test todos for user_001

This script adds sample todos to demonstrate the GoalTab functionality.
"""

import sys
import os

# 添加项目根目录到路径
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from shared.database import get_connection
from shared.database.repositories import TodoRepository
from datetime import datetime, timedelta


def add_test_todos():
    """Add sample todos for user_001."""

    print("🔄 Adding test todos for user_001...")

    # Calculate current week start (Monday)
    today = datetime.now()
    week_start = (today - timedelta(days=today.weekday())).strftime('%Y-%m-%d')

    test_todos = [
        {
            'user_id': 'user_001',
            'title': 'Eat a nutritious breakfast before work (Greek yogurt + nuts or boiled eggs)',
            'category': 'diet',
            'health_benefit': 'Reduces hunger-related blood sugar drops, stabilizes morning glucose levels',
            'time_of_day': '09:00-10:00',
            'time_description': 'Before work',
            'target_count': 7,
            'current_count': 0,
            'status': 'pending',
            'week_start': week_start,
        },
        {
            'user_id': 'user_001',
            'title': 'Exercise for 30 minutes after dinner (brisk walk or light jog)',
            'category': 'exercise',
            'health_benefit': 'Improves insulin sensitivity, helps control blood sugar',
            'time_of_day': '20:00-21:00',
            'time_description': '1 hour after dinner',
            'target_count': 3,
            'current_count': 0,
            'status': 'pending',
            'week_start': week_start,
        },
        {
            'user_id': 'user_001',
            'title': 'Go to bed before 11 PM every night',
            'category': 'sleep',
            'health_benefit': 'Improves sleep quality, aids in blood sugar regulation',
            'time_of_day': '22:30-23:00',
            'time_description': 'Before bedtime',
            'target_count': 7,
            'current_count': 0,
            'status': 'pending',
            'week_start': week_start,
        },
        {
            'user_id': 'user_001',
            'title': 'Drink 8 glasses of water throughout the day',
            'category': 'other',
            'health_benefit': 'Maintains hydration, supports metabolism',
            'time_of_day': '08:00-20:00',
            'time_description': 'Throughout the day',
            'target_count': 7,
            'current_count': 2,
            'status': 'in_progress',
            'completed_today': 1,
            'week_start': week_start,
        },
    ]

    try:
        with get_connection() as conn:
            todo_repo = TodoRepository(conn)

            # Check if todos already exist
            existing_todos = todo_repo.get_by_user('user_001')

            if existing_todos:
                print(f"⚠️  user_001 already has {len(existing_todos)} todos. Skipping...")
                print("\nExisting todos:")
                for todo in existing_todos:
                    print(f"  - {todo['title'][:50]}... (status: {todo['status']})")
                return

            # Add test todos
            created_count = 0
            for todo_data in test_todos:
                title = todo_data.pop('title')
                user_id = todo_data.pop('user_id')
                todo_id = todo_repo.create(user_id, title, **todo_data)
                print(f"  ✅ Created todo #{todo_id}: {title[:50]}...")
                created_count += 1

            print(f"\n✅ Successfully created {created_count} test todos for user_001!")

    except Exception as e:
        print(f"❌ Failed to add test todos: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    add_test_todos()
