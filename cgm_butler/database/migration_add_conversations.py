# migration_add_conversations.py
# -*- coding: utf-8 -*-
"""
数据库迁移脚本：添加对话历史存储表
这个脚本向现有数据库添加两个新表：
- conversations: 存储所有对话（Tavus 视频 + GPT 文本）
- conversation_analysis: 存储对话分析结果
"""
import sqlite3
from datetime import datetime
import sys
import io

# 设置 Windows 控制台输出编码
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')


def migrate_add_conversations(db_path: str = 'cgm_butler.db'):
    """
    添加对话相关表到数据库
    
    Args:
        db_path: 数据库文件路径
    """
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        print("开始数据库迁移...")
        print("=" * 60)
        
        # 1. 创建 conversations 表
        print("\n[1/2] 创建 conversations 表...")
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS conversations (
            -- 主键
            conversation_id VARCHAR(100) PRIMARY KEY,
            
            -- 基本信息
            user_id VARCHAR(50) NOT NULL,
            conversation_type VARCHAR(20) NOT NULL,  -- 'tavus_video', 'gpt_chat'
            conversation_name VARCHAR(200),
            
            -- Tavus 特有字段
            tavus_conversation_id VARCHAR(100),
            tavus_conversation_url TEXT,
            tavus_replica_id VARCHAR(100),
            tavus_persona_id VARCHAR(100),
            
            -- 时间信息
            started_at TIMESTAMP NOT NULL,
            ended_at TIMESTAMP,
            duration_seconds INTEGER,
            
            -- 状态信息
            status VARCHAR(20) NOT NULL DEFAULT 'active',  -- 'active', 'ended', 'error'
            shutdown_reason VARCHAR(100),
            
            -- 对话内容（核心）
            transcript TEXT,  -- 完整对话记录（JSON 格式）
            
            -- 对话上下文
            conversational_context TEXT,  -- 传递给 AI 的初始 context
            custom_greeting TEXT,
            
            -- 元数据
            properties TEXT,  -- JSON
            metadata TEXT,  -- JSON
            
            -- 时间戳
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            
            -- 外键和索引
            FOREIGN KEY (user_id) REFERENCES users(user_id),
            UNIQUE(tavus_conversation_id)
        )
        ''')
        
        # 为 conversations 表创建索引
        cursor.execute('''
        CREATE INDEX IF NOT EXISTS idx_conversations_user_time 
        ON conversations(user_id, started_at DESC)
        ''')
        
        cursor.execute('''
        CREATE INDEX IF NOT EXISTS idx_conversations_type 
        ON conversations(conversation_type)
        ''')
        
        cursor.execute('''
        CREATE INDEX IF NOT EXISTS idx_conversations_status 
        ON conversations(status)
        ''')
        
        print("✅ conversations 表创建成功")
        
        # 2. 创建 conversation_analysis 表
        print("[2/2] 创建 conversation_analysis 表...")
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS conversation_analysis (
            -- 主键
            analysis_id INTEGER PRIMARY KEY AUTOINCREMENT,
            conversation_id VARCHAR(100) NOT NULL UNIQUE,
            
            -- AI 生成的摘要
            summary TEXT,
            key_topics TEXT,  -- JSON: ["blood_sugar", "diet", "exercise"]
            
            -- 提取的结构化数据
            extracted_data TEXT,  -- JSON: {foods: [], exercises: [], sleep: [], emotions: []}
            
            -- 用户意图和情绪
            user_intents TEXT,  -- JSON: ["seeking_advice", "logging_data"]
            user_concerns TEXT,  -- JSON: ["night_glucose", "weight_loss"]
            user_sentiment VARCHAR(20),  -- 'positive', 'neutral', 'negative'
            
            -- 对话质量
            engagement_score REAL,
            
            -- 行动项
            action_items TEXT,  -- JSON
            follow_up_needed INTEGER DEFAULT 0,  -- SQLite 中用 INTEGER(0/1) 代替 BOOLEAN
            
            -- 分析元数据
            analysis_model VARCHAR(50),
            analysis_timestamp TIMESTAMP,
            
            -- 时间戳
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            
            -- 外键
            FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id) ON DELETE CASCADE
        )
        ''')
        
        # 为 conversation_analysis 表创建索引
        cursor.execute('''
        CREATE INDEX IF NOT EXISTS idx_analysis_follow_up 
        ON conversation_analysis(follow_up_needed)
        ''')
        
        cursor.execute('''
        CREATE INDEX IF NOT EXISTS idx_analysis_sentiment 
        ON conversation_analysis(user_sentiment)
        ''')
        
        print("✅ conversation_analysis 表创建成功")
        
        # 提交更改
        conn.commit()
        
        print("\n" + "=" * 60)
        print("✅ 数据库迁移完成！")
        print("\n新增表：")
        print("  1. conversations - 存储所有对话记录")
        print("  2. conversation_analysis - 存储对话分析结果")
        print("\n可以开始使用 ConversationManager 来保存对话了！")
        
    except sqlite3.Error as e:
        print(f"❌ 数据库迁移失败: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == '__main__':
    import os
    
    # 获取数据库路径
    db_path = os.path.join(os.path.dirname(__file__), 'cgm_butler.db')
    
    try:
        migrate_add_conversations(db_path)
    except Exception as e:
        print(f"迁移出错: {e}")
        sys.exit(1)

