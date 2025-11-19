#!/usr/bin/env python3
"""
Database Migration Script: Add new fields to user_todos table

This script adds the following new fields to the user_todos table:
- health_benefit: Health benefit description
- time_of_day: Time of day (e.g., '09:00-10:00')
- time_description: Time description (e.g., 'Before work')
- completed_today: Today's completion status (0 or 1)
- uploaded_images: Uploaded image URLs (JSON array)
- notes: User notes

Usage:
    python migrate_todos_table.py
"""

import sqlite3
import os
import sys

# 添加项目根目录到路径
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from shared.database import get_connection


def column_exists(cursor, table_name, column_name):
    """Check if a column exists in a table."""
    cursor.execute(f"PRAGMA table_info({table_name})")
    columns = [row[1] for row in cursor.fetchall()]
    return column_name in columns


def migrate_todos_table():
    """Migrate the user_todos table to add new fields."""

    print("🔄 Starting migration of user_todos table...")

    try:
        with get_connection() as conn:
            cursor = conn.cursor()

            # Check if table exists
            cursor.execute("""
                SELECT name FROM sqlite_master
                WHERE type='table' AND name='user_todos'
            """)

            if not cursor.fetchone():
                print("⚠️  user_todos table does not exist. Creating new table...")

                # Create the table with all fields
                from shared.database.schema import USER_TODOS_TABLE, USER_TODOS_INDEXES
                cursor.execute(USER_TODOS_TABLE)

                for index in USER_TODOS_INDEXES:
                    cursor.execute(index)

                conn.commit()
                print("✅ Created user_todos table with all new fields")
                return

            # Table exists, check which columns need to be added
            new_columns = {
                'health_benefit': 'TEXT',
                'time_of_day': 'VARCHAR(50)',
                'time_description': 'VARCHAR(100)',
                'completed_today': 'INTEGER DEFAULT 0',
                'uploaded_images': 'TEXT',
                'notes': 'TEXT',
            }

            columns_added = []

            for column_name, column_type in new_columns.items():
                if not column_exists(cursor, 'user_todos', column_name):
                    print(f"  Adding column: {column_name}")
                    cursor.execute(f"""
                        ALTER TABLE user_todos
                        ADD COLUMN {column_name} {column_type}
                    """)
                    columns_added.append(column_name)
                else:
                    print(f"  ⏭️  Column already exists: {column_name}")

            if columns_added:
                conn.commit()
                print(f"✅ Migration completed! Added {len(columns_added)} columns: {', '.join(columns_added)}")
            else:
                print("✅ No migration needed - all columns already exist")

    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    migrate_todos_table()
