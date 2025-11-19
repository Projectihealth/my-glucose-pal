"""
CGM Butler MySQL 数据库 Schema 定义
适配MySQL语法的数据表结构
"""

# ============================================================
# 1. 用户相关表
# ============================================================

USERS_TABLE = """
CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,
    gender VARCHAR(20),
    date_of_birth DATE,
    health_goal TEXT,
    enrolled_at DATETIME,
    conditions TEXT,
    cgm_device_type VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
"""

# ============================================================
# 2. CGM 数据相关表
# ============================================================

CGM_READINGS_TABLE = """
CREATE TABLE IF NOT EXISTS cgm_readings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    timestamp DATETIME NOT NULL,
    glucose_value INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_timestamp (user_id, timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
"""

CGM_PATTERN_ACTIONS_TABLE = """
CREATE TABLE IF NOT EXISTS cgm_pattern_actions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pattern_name VARCHAR(200) NOT NULL,
    pattern_description TEXT,
    category VARCHAR(100),
    action_title VARCHAR(500) NOT NULL,
    action_detail TEXT,
    priority INT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_pattern_name (pattern_name),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
"""

ACTIVITY_LOGS_TABLE = """
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL,
    activity_type VARCHAR(100) NOT NULL,
    description TEXT,
    timestamp DATETIME NOT NULL,
    metadata JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_timestamp (user_id, timestamp),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
"""

# ============================================================
# 3. 对话相关表
# ============================================================

CONVERSATIONS_TABLE = """
CREATE TABLE IF NOT EXISTS conversations (
    conversation_id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    conversation_type VARCHAR(20) NOT NULL,
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
    transcript_object LONGTEXT,
    
    -- 通用字段
    started_at DATETIME,
    ended_at DATETIME,
    duration_seconds INT,
    status VARCHAR(20) DEFAULT 'active',
    shutdown_reason TEXT,
    
    -- 对话内容
    transcript LONGTEXT,
    conversational_context LONGTEXT,
    custom_greeting TEXT,
    
    -- 元数据
    properties JSON,
    metadata JSON,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_conv_user_id (user_id),
    INDEX idx_conv_type (conversation_type),
    INDEX idx_conv_started_at (started_at),
    INDEX idx_tavus_conv_id (tavus_conversation_id),
    INDEX idx_retell_call_id (retell_call_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
"""

CONVERSATION_ANALYSIS_TABLE = """
CREATE TABLE IF NOT EXISTS conversation_analysis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id VARCHAR(100) NOT NULL,
    
    -- 分析结果
    summary TEXT,
    key_topics JSON,
    extracted_data JSON,
    user_intents JSON,
    user_concerns JSON,
    user_sentiment VARCHAR(20),
    engagement_score FLOAT,
    
    -- 行动项
    action_items JSON,
    follow_up_needed BOOLEAN DEFAULT FALSE,
    
    -- 元数据
    analysis_model VARCHAR(50) DEFAULT 'gpt-4o',
    analysis_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id) ON DELETE CASCADE,
    INDEX idx_conversation_id (conversation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
"""

# ============================================================
# 4. 记忆系统表 (Memory System)
# ============================================================

USER_MEMORIES_TABLE = """
CREATE TABLE IF NOT EXISTS user_memories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    conversation_id VARCHAR(100),
    channel VARCHAR(20) NOT NULL,
    
    -- 记忆内容
    summary TEXT NOT NULL,
    insights TEXT,
    key_topics JSON,
    extracted_data JSON,
    
    -- 元数据
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id) ON DELETE SET NULL,
    INDEX idx_mem_user_id (user_id),
    INDEX idx_mem_created_at (created_at),
    INDEX idx_mem_channel (channel)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
"""

USER_LONG_TERM_MEMORY_TABLE = """
CREATE TABLE IF NOT EXISTS user_long_term_memory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) UNIQUE NOT NULL,
    
    -- 长期记忆字段 (JSON 格式)
    preferences JSON,
    health_goals JSON,
    habits JSON,
    dietary_patterns JSON,
    exercise_patterns JSON,
    stress_patterns JSON,
    sleep_patterns JSON,
    concerns JSON,
    
    -- 元数据
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
"""

USER_TODOS_TABLE = """
CREATE TABLE IF NOT EXISTS user_todos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    conversation_id VARCHAR(100),

    -- TODO 内容
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    health_benefit TEXT,

    -- 时间相关
    time_of_day VARCHAR(50),
    time_description VARCHAR(100),

    -- 进度跟踪
    target_count INT DEFAULT 1,
    current_count INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',
    completed_today BOOLEAN DEFAULT FALSE,

    -- 用户选择和推荐
    user_selected BOOLEAN DEFAULT TRUE,
    priority VARCHAR(20),
    recommendation_tag VARCHAR(50),

    -- 附件
    uploaded_images JSON,
    notes TEXT,

    -- 时间范围
    week_start DATE,

    -- 元数据
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id) ON DELETE SET NULL,
    INDEX idx_todo_user_id (user_id),
    INDEX idx_todo_status (status),
    INDEX idx_todo_week_start (week_start)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
"""

# 用户Onboarding状态表
USER_ONBOARDING_STATUS_TABLE = """
CREATE TABLE IF NOT EXISTS user_onboarding_status (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) UNIQUE NOT NULL,
    
    -- Onboarding进度
    completion_score INT DEFAULT 0,
    onboarding_stage VARCHAR(50) DEFAULT 'initial',
    
    -- 收集的信息
    has_health_goals BOOLEAN DEFAULT FALSE,
    has_dietary_info BOOLEAN DEFAULT FALSE,
    has_exercise_info BOOLEAN DEFAULT FALSE,
    has_medical_history BOOLEAN DEFAULT FALSE,
    has_lifestyle_info BOOLEAN DEFAULT FALSE,
    
    -- 元数据
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_interaction_at DATETIME,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_completion_score (completion_score),
    INDEX idx_onboarding_stage (onboarding_stage)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
"""

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
    ("user_onboarding_status", USER_ONBOARDING_STATUS_TABLE),
]


def create_all_tables(conn):
    """
    创建所有MySQL表
    
    Args:
        conn: PyMySQL数据库连接
    """
    cursor = conn.cursor()
    
    print("正在创建MySQL数据库表...")
    
    # 创建所有表
    for table_name, table_sql in ALL_TABLES:
        try:
            cursor.execute(table_sql)
            print(f"  ✓ {table_name}")
        except Exception as e:
            print(f"  ✗ {table_name}: {e}")
    
    conn.commit()
    print("\n✅ MySQL数据库 schema 创建完成!")


def list_all_tables(conn):
    """
    列出MySQL数据库中的所有表
    
    Args:
        conn: PyMySQL数据库连接
        
    Returns:
        表名列表
    """
    cursor = conn.cursor()
    cursor.execute("SHOW TABLES")
    return [row[list(row.keys())[0]] for row in cursor.fetchall()]


if __name__ == '__main__':
    from mysql_connection import MySQLConnection
    
    # 测试：创建MySQL数据库表
    print("测试MySQL schema 定义...")
    
    try:
        with MySQLConnection.get_db_session() as conn:
            create_all_tables(conn)
            
            print("\nMySQL数据库中的所有表:")
            tables = list_all_tables(conn)
            for table in tables:
                print(f"  - {table}")
            
            print(f"\n总共 {len(tables)} 张表")
    except Exception as e:
        print(f"❌ 创建表失败: {e}")

