"""
Migration: Add emoji field to user_todos table
Created: 2025-11-30
"""

def migrate_sqlite(conn):
    """Add emoji column to user_todos table for SQLite"""
    cursor = conn.cursor()
    
    try:
        # Check if emoji column already exists
        cursor.execute("PRAGMA table_info(user_todos)")
        columns = [row[1] for row in cursor.fetchall()]
        
        if 'emoji' not in columns:
            print("Adding emoji column to user_todos table (SQLite)...")
            cursor.execute("ALTER TABLE user_todos ADD COLUMN emoji VARCHAR(10)")
            conn.commit()
            print("✓ Successfully added emoji column")
        else:
            print("✓ emoji column already exists")
            
    except Exception as e:
        print(f"✗ Error during migration: {e}")
        conn.rollback()
        raise


def migrate_mysql(conn):
    """Add emoji column to user_todos table for MySQL"""
    cursor = conn.cursor()
    
    try:
        # Check if emoji column already exists
        cursor.execute("""
            SELECT COUNT(*) 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'user_todos' 
            AND COLUMN_NAME = 'emoji'
        """)
        exists = cursor.fetchone()[0] > 0
        
        if not exists:
            print("Adding emoji column to user_todos table (MySQL)...")
            cursor.execute("ALTER TABLE user_todos ADD COLUMN emoji VARCHAR(10) AFTER health_benefit")
            conn.commit()
            print("✓ Successfully added emoji column")
        else:
            print("✓ emoji column already exists")
            
    except Exception as e:
        print(f"✗ Error during migration: {e}")
        conn.rollback()
        raise


if __name__ == "__main__":
    import sys
    import os
    
    # Add parent directory to path for imports
    sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))
    
    from shared.database.db_connection import get_connection
    
    print("Starting emoji field migration...")
    
    with get_connection() as conn:
        # Detect database type
        cursor = conn.cursor()
        
        # Try to detect if it's MySQL or SQLite
        try:
            cursor.execute("SELECT VERSION()")  # MySQL
            migrate_mysql(conn)
        except:
            migrate_sqlite(conn)
    
    print("Migration completed!")

