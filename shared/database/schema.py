"""
CGM Butler 数据库 Schema 定义
统一管理所有数据表结构
"""

# ============================================================
# 1. 用户相关表
# ============================================================

USERS_TABLE = """
CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    gender TEXT,
    date_of_birth TEXT,
    health_goal TEXT,
    enrolled_at TEXT,
    conditions TEXT,
    cgm_device_type TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
)
"""

# ============================================================
# 2. CGM 数据相关表
# ============================================================

CGM_READINGS_TABLE = """
CREATE TABLE IF NOT EXISTS cgm_readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    glucose_value INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
)
"""

CGM_READINGS_INDEX = """
CREATE INDEX IF NOT EXISTS idx_user_timestamp 
ON cgm_readings(user_id, timestamp)
"""

CGM_PATTERN_ACTIONS_TABLE = """
CREATE TABLE IF NOT EXISTS cgm_pattern_actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pattern_name TEXT NOT NULL,
    pattern_description TEXT,
    category TEXT,
    action_title TEXT NOT NULL,
    action_detail TEXT,
    priority INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
"""

ACTIVITY_LOGS_TABLE = """
CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    category TEXT NOT NULL,
    activity_type TEXT NOT NULL,
    description TEXT,
    timestamp TEXT NOT NULL,
    metadata TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
)
"""

# ============================================================
# 3. 对话相关表
# ============================================================

CONVERSATIONS_TABLE = """
CREATE TABLE IF NOT EXISTS conversations (
    conversation_id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    conversation_type VARCHAR(20) NOT NULL,  -- 'tavus_video', 'gpt_chat', 'retell_voice'
    conversation_name VARCHAR(200),
    
    -- Tavus 视频对话专用字段
    tavus_conversation_id VARCHAR(100),
    tavus_conversation_url TEXT,
    tavus_replica_id VARCHAR(50),
    tavus_persona_id VARCHAR(50),
    
    -- Retell 语音对话专用字段
    retell_call_id VARCHAR(100),
    retell_agent_id VARCHAR(100),
    call_status VARCHAR(20),
    call_type VARCHAR(20),
    call_cost TEXT,
    disconnection_reason TEXT,
    recording_url TEXT,
    transcript_object TEXT,
    
    -- 通用字段
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    duration_seconds INTEGER,
    status VARCHAR(20) DEFAULT 'active',
    shutdown_reason TEXT,
    
    -- 对话内容
    transcript TEXT,  -- JSON 格式的对话记录 (video/text) 或纯文本 (voice)
    conversational_context TEXT,
    custom_greeting TEXT,
    
    -- 元数据
    properties TEXT,  -- JSON
    metadata TEXT,    -- JSON
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id)
)
"""

CONVERSATIONS_INDEXES = [
    "CREATE INDEX IF NOT EXISTS idx_conv_user_id ON conversations(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_conv_type ON conversations(conversation_type)",
    "CREATE INDEX IF NOT EXISTS idx_conv_started_at ON conversations(started_at)",
    "CREATE INDEX IF NOT EXISTS idx_tavus_conv_id ON conversations(tavus_conversation_id)",
    "CREATE INDEX IF NOT EXISTS idx_retell_call_id ON conversations(retell_call_id)"
]

CONVERSATION_ANALYSIS_TABLE = """
CREATE TABLE IF NOT EXISTS conversation_analysis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id VARCHAR(100) NOT NULL,
    
    -- 分析结果
    summary TEXT,
    key_topics TEXT,           -- JSON array
    extracted_data TEXT,       -- JSON object
    user_intents TEXT,         -- JSON array
    user_concerns TEXT,        -- JSON array
    user_sentiment VARCHAR(20), -- 'positive', 'neutral', 'negative'
    engagement_score FLOAT,    -- 0-100
    
    -- 行动项
    action_items TEXT,         -- JSON array
    follow_up_needed BOOLEAN DEFAULT 0,
    
    -- 元数据
    analysis_model VARCHAR(50) DEFAULT 'gpt-4o',
    analysis_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id)
)
"""

# ============================================================
# 4. 记忆系统表 (Memory System)
# ============================================================

USER_MEMORIES_TABLE = """
CREATE TABLE IF NOT EXISTS user_memories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id VARCHAR(50) NOT NULL,
    conversation_id VARCHAR(100),
    channel VARCHAR(20) NOT NULL,  -- 'gpt_chat', 'retell_voice', 'tavus_video'
    
    -- 记忆内容
    summary TEXT NOT NULL,         -- 本次对话总结
    insights TEXT,                 -- 洞察/发现
    key_topics TEXT,               -- JSON array: 关键话题
    extracted_data TEXT,           -- JSON object: 提取的结构化数据
    
    -- 元数据
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id)
)
"""

USER_MEMORIES_INDEXES = [
    "CREATE INDEX IF NOT EXISTS idx_mem_user_id ON user_memories(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_mem_created_at ON user_memories(created_at)",
    "CREATE INDEX IF NOT EXISTS idx_mem_channel ON user_memories(channel)"
]

USER_LONG_TERM_MEMORY_TABLE = """
CREATE TABLE IF NOT EXISTS user_long_term_memory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id VARCHAR(50) UNIQUE NOT NULL,
    
    -- 长期记忆字段 (JSON 格式)
    preferences TEXT,          -- 用户偏好
    health_goals TEXT,         -- 健康目标
    habits TEXT,               -- 习惯
    dietary_patterns TEXT,     -- 饮食模式
    exercise_patterns TEXT,    -- 运动模式
    stress_patterns TEXT,      -- 压力模式
    sleep_patterns TEXT,       -- 睡眠模式
    concerns TEXT,             -- 关注事项 (JSON array)
    
    -- 元数据
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id)
)
"""

USER_TODOS_TABLE = """
CREATE TABLE IF NOT EXISTS user_todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id VARCHAR(50) NOT NULL,
    conversation_id VARCHAR(100),

    -- TODO 内容
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50),      -- 'diet', 'exercise', 'sleep', 'stress', 'medication', 'other'
    health_benefit TEXT,       -- 健康益处说明

    -- 时间相关
    time_of_day VARCHAR(50),   -- 时间段 (e.g., '09:00-10:00')
    time_description VARCHAR(100), -- 时间描述 (e.g., 'Before work')

    -- 进度跟踪
    target_count INTEGER DEFAULT 1,     -- 目标次数
    current_count INTEGER DEFAULT 0,    -- 当前完成次数
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'
    completed_today INTEGER DEFAULT 0,   -- 今天是否已完成 (0 or 1)

    -- 附件
    uploaded_images TEXT,      -- 上传的图片 URLs (JSON array)
    notes TEXT,                -- 用户笔记

    -- 时间范围
    week_start DATE,           -- 本周开始日期 (YYYY-MM-DD)

    -- 元数据
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id)
)
"""

USER_TODOS_INDEXES = [
    "CREATE INDEX IF NOT EXISTS idx_todo_user_id ON user_todos(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_todo_status ON user_todos(status)",
    "CREATE INDEX IF NOT EXISTS idx_todo_week_start ON user_todos(week_start)"
]

# ============================================================
# 完整的表列表 (按创建顺序)
# ============================================================

ALL_TABLES = [
    # 基础表
    ("users", USERS_TABLE),
    ("cgm_readings", CGM_READINGS_TABLE),
    ("cgm_pattern_actions", CGM_PATTERN_ACTIONS_TABLE),
    ("activity_logs", ACTIVITY_LOGS_TABLE),
    
    # 对话表
    ("conversations", CONVERSATIONS_TABLE),
    ("conversation_analysis", CONVERSATION_ANALYSIS_TABLE),
    
    # 记忆系统表
    ("user_memories", USER_MEMORIES_TABLE),
    ("user_long_term_memory", USER_LONG_TERM_MEMORY_TABLE),
    ("user_todos", USER_TODOS_TABLE),
]

ALL_INDEXES = [
    CGM_READINGS_INDEX,
] + CONVERSATIONS_INDEXES + USER_MEMORIES_INDEXES + USER_TODOS_INDEXES


# ============================================================
# 辅助函数
# ============================================================

def create_all_tables(conn):
    """
    创建所有表和索引
    
    Args:
        conn: sqlite3 数据库连接
    """
    cursor = conn.cursor()
    
    print("正在创建数据库表...")
    
    # 创建所有表
    for table_name, table_sql in ALL_TABLES:
        cursor.execute(table_sql)
        print(f"  ✓ {table_name}")
    
    # 创建所有索引
    print("\n正在创建索引...")
    for index_sql in ALL_INDEXES:
        cursor.execute(index_sql)
    print("  ✓ 所有索引创建完成")
    
    conn.commit()
    print("\n✅ 数据库 schema 创建完成!")


def get_table_info(conn, table_name):
    """
    获取表的结构信息
    
    Args:
        conn: sqlite3 数据库连接
        table_name: 表名
        
    Returns:
        表结构信息列表
    """
    cursor = conn.cursor()
    cursor.execute(f"PRAGMA table_info({table_name})")
    return cursor.fetchall()


def list_all_tables(conn):
    """
    列出数据库中的所有表
    
    Args:
        conn: sqlite3 数据库连接
        
    Returns:
        表名列表
    """
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    return [row[0] for row in cursor.fetchall()]


if __name__ == '__main__':
    import sqlite3
    
    # 测试：创建一个临时数据库
    print("测试 schema 定义...")
    conn = sqlite3.connect(':memory:')
    
    create_all_tables(conn)
    
    print("\n数据库中的所有表:")
    tables = list_all_tables(conn)
    for table in tables:
        print(f"  - {table}")
    
    print(f"\n总共 {len(tables)} 张表")
    
    conn.close()

