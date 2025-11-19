#!/usr/bin/env python3
"""
为MySQL数据库添加性能优化索引
"""
import sys
import os

# 添加项目根目录到路径
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
sys.path.insert(0, project_root)

from shared.database import get_connection

def add_indexes():
    """添加关键索引以提升查询性能"""
    print("="*80)
    print("⚡ Adding MySQL Performance Indexes")
    print("="*80)
    print()
    
    conn = get_connection()
    cursor = conn.cursor()
    
    indexes = [
        # Conversations表索引
        ("idx_conversations_user_id", "conversations", "user_id"),
        ("idx_conversations_started_at", "conversations", "started_at"),
        ("idx_conversations_user_started", "conversations", "user_id, started_at DESC"),
        
        # User_memories表索引
        ("idx_memories_user_id", "user_memories", "user_id"),
        ("idx_memories_conversation_id", "user_memories", "conversation_id"),
        ("idx_memories_created_at", "user_memories", "created_at"),
        ("idx_memories_user_created", "user_memories", "user_id, created_at DESC"),
        
        # User_todos表索引
        ("idx_todos_user_id", "user_todos", "user_id"),
        ("idx_todos_conversation_id", "user_todos", "conversation_id"),
        ("idx_todos_status", "user_todos", "status"),
        ("idx_todos_user_status", "user_todos", "user_id, status"),
        ("idx_todos_created_at", "user_todos", "created_at"),
        
        # User_long_term_memory表索引
        ("idx_ltm_user_id", "user_long_term_memory", "user_id"),
        ("idx_ltm_updated_at", "user_long_term_memory", "updated_at"),
        
        # Onboarding_status表索引
        ("idx_onboarding_user_id", "onboarding_status", "user_id"),
        
        # CGM_readings表索引（如果有）
        ("idx_cgm_user_id", "cgm_readings", "user_id"),
        ("idx_cgm_timestamp", "cgm_readings", "timestamp"),
        ("idx_cgm_user_timestamp", "cgm_readings", "user_id, timestamp DESC"),
    ]
    
    success_count = 0
    skip_count = 0
    
    for index_name, table_name, columns in indexes:
        try:
            # 检查索引是否已存在
            cursor.execute(f"SHOW INDEX FROM {table_name} WHERE Key_name = '{index_name}'")
            if cursor.fetchone():
                print(f"⏭️  Skip: {index_name} already exists on {table_name}")
                skip_count += 1
                continue
            
            # 创建索引
            sql = f"CREATE INDEX {index_name} ON {table_name} ({columns})"
            cursor.execute(sql)
            print(f"✅ Created: {index_name} on {table_name} ({columns})")
            success_count += 1
            
        except Exception as e:
            # 忽略表不存在或其他非关键错误
            if "doesn't exist" in str(e).lower():
                print(f"⏭️  Skip: Table {table_name} doesn't exist")
                skip_count += 1
            elif "Duplicate key name" in str(e):
                print(f"⏭️  Skip: {index_name} already exists")
                skip_count += 1
            else:
                print(f"⚠️  Warning: Failed to create {index_name} on {table_name}: {e}")
    
    conn.commit()
    conn.close()
    
    print()
    print("="*80)
    print(f"✅ Indexing Complete!")
    print(f"   Created: {success_count} indexes")
    print(f"   Skipped: {skip_count} indexes")
    print("="*80)
    print()
    print("🚀 Database query performance should now be significantly improved!")

if __name__ == '__main__':
    add_indexes()



