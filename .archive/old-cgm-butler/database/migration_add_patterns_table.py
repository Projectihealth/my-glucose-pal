#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
数据库迁移: 添加 user_patterns 表

这个表用于存储识别出的血糖模式
"""

import sqlite3
import os
from datetime import datetime

def migrate_add_patterns_table(db_path=None):
    """
    添加 user_patterns 表到数据库
    
    Args:
        db_path: 数据库路径，如果为None则使用默认路径
    """
    if db_path is None:
        db_path = os.path.join(os.path.dirname(__file__), 'cgm_butler.db')
    
    print(f"正在连接数据库: {db_path}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # 检查表是否已存在
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='user_patterns'
        """)
        
        if cursor.fetchone():
            print("✅ user_patterns 表已存在，跳过创建")
            return
        
        print("正在创建 user_patterns 表...")
        
        # 创建 user_patterns 表
        cursor.execute('''
            CREATE TABLE user_patterns (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                pattern_name TEXT NOT NULL,
                pattern_description TEXT,
                severity TEXT,
                category TEXT,
                detected_at TEXT NOT NULL,
                start_time TEXT,
                end_time TEXT,
                confidence REAL DEFAULT 1.0,
                metadata TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            )
        ''')
        
        # 创建索引以提高查询性能
        cursor.execute('''
            CREATE INDEX idx_user_patterns_user_detected 
            ON user_patterns(user_id, detected_at DESC)
        ''')
        
        cursor.execute('''
            CREATE INDEX idx_user_patterns_category 
            ON user_patterns(category)
        ''')
        
        # 提交更改
        conn.commit()
        
        print("✅ user_patterns 表创建成功!")
        print("\n表结构:")
        print("  - id: 主键")
        print("  - user_id: 用户ID (外键)")
        print("  - pattern_name: 模式名称")
        print("  - pattern_description: 模式描述")
        print("  - severity: 严重程度 (low/medium/high)")
        print("  - category: 类别 (meal/time_of_day/variability/level/activity/stress)")
        print("  - detected_at: 检测时间")
        print("  - start_time: 模式开始时间")
        print("  - end_time: 模式结束时间")
        print("  - confidence: 置信度 (0.0-1.0)")
        print("  - metadata: 额外元数据 (JSON)")
        print("  - created_at: 创建时间")
        
    except Exception as e:
        print(f"❌ 错误: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == '__main__':
    print("="*60)
    print("数据库迁移: 添加 user_patterns 表")
    print("="*60)
    print()
    
    migrate_add_patterns_table()
    
    print()
    print("="*60)
    print("迁移完成!")
    print("="*60)

