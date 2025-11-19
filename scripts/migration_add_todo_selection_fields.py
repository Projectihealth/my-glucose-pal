#!/usr/bin/env python3
"""
Migration: Add user_selected, priority, and recommendation_tag fields to user_todos table
"""
import sys
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from shared.database import get_connection
from config.settings import settings

def migrate():
    """Add new fields to user_todos table"""
    print("Starting migration: Add user_selected, priority, and recommendation_tag to user_todos")
    print(f"Database type: {settings.DB_TYPE}")

    with get_connection() as conn:
        cursor = conn.cursor()

        # Get existing columns (MySQL syntax)
        cursor.execute("""
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'user_todos'
        """)
        result = cursor.fetchall()
        # Handle both dict and tuple cursor results
        if result and isinstance(result[0], dict):
            columns = {row['COLUMN_NAME'] for row in result}
        else:
            columns = {row[0] for row in result}
        print(f"Existing columns: {columns}")

        migrations = []

        if 'user_selected' not in columns:
            migrations.append(("user_selected", "ALTER TABLE user_todos ADD COLUMN user_selected BOOLEAN DEFAULT 1"))

        if 'priority' not in columns:
            migrations.append(("priority", "ALTER TABLE user_todos ADD COLUMN priority VARCHAR(20)"))

        if 'recommendation_tag' not in columns:
            migrations.append(("recommendation_tag", "ALTER TABLE user_todos ADD COLUMN recommendation_tag VARCHAR(50)"))

        # Execute migrations
        for field_name, sql in migrations:
            try:
                print(f"Adding column: {field_name}")
                cursor.execute(sql)
                conn.commit()
                print(f"✓ Successfully added {field_name}")
            except Exception as e:
                error_msg = str(e).lower()
                if "duplicate column" in error_msg or "already exists" in error_msg:
                    print(f"⊗ Column {field_name} already exists, skipping")
                else:
                    print(f"✗ Error adding {field_name}: {e}")
                    raise

        # Verify the changes
        cursor.execute("""
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'user_todos'
        """)
        result_after = cursor.fetchall()
        if result_after and isinstance(result_after[0], dict):
            columns_after = {row['COLUMN_NAME'] for row in result_after}
        else:
            columns_after = {row[0] for row in result_after}

        print("\n=== Migration Summary ===")
        print(f"user_selected: {'✓' if 'user_selected' in columns_after else '✗'}")
        print(f"priority: {'✓' if 'priority' in columns_after else '✗'}")
        print(f"recommendation_tag: {'✓' if 'recommendation_tag' in columns_after else '✗'}")

        print("\n✓ Migration completed successfully!")

if __name__ == "__main__":
    migrate()
