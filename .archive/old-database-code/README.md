# CGM Butler 数据库文档

## 📁 数据库位置

- **主数据库文件**: `apps/backend/cgm_butler/database/cgm_butler.db`
- **备份文件**: `apps/backend/cgm_butler/cgm_butler.db.backup`

## 📊 数据库结构总览

### 1. 用户相关表

#### `users` - 用户信息表
| 字段 | 类型 | 说明 |
|------|------|------|
| user_id | TEXT (PK) | 用户唯一标识 |
| name | TEXT | 用户姓名 |
| gender | TEXT | 性别 |
| date_of_birth | TEXT | 出生日期 |
| health_goal | TEXT | 健康目标 |
| enrolled_at | TEXT | 注册时间 |
| conditions | TEXT | 健康状况 |
| cgm_device_type | TEXT | CGM 设备类型 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

---

### 2. CGM 数据相关表

#### `cgm_readings` - CGM 读数表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER (PK) | 自增主键 |
| user_id | TEXT (FK) | 用户ID |
| timestamp | TEXT | 读数时间戳 |
| glucose_value | INTEGER | 血糖值 (mg/dL) |
| created_at | TIMESTAMP | 记录创建时间 |

**索引**: `idx_user_timestamp` (user_id, timestamp)

#### `cgm_pattern_actions` - 模式与行动建议映射表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER (PK) | 自增主键 |
| pattern_name | TEXT | 模式名称 |
| pattern_description | TEXT | 模式描述 |
| category | TEXT | 类别 (diet/exercise/sleep/other) |
| action_title | TEXT | 行动建议标题 |
| action_detail | TEXT | 行动建议详情 |
| priority | INTEGER | 优先级 (1-5) |
| created_at | TIMESTAMP | 创建时间 |

#### `activity_logs` - 用户活动日志表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER (PK) | 自增主键 |
| user_id | TEXT (FK) | 用户ID |
| category | TEXT | 活动类别 |
| activity_type | TEXT | 活动类型 |
| description | TEXT | 活动描述 |
| timestamp | TEXT | 活动时间 |
| metadata | TEXT | 元数据 (JSON) |
| created_at | TIMESTAMP | 记录创建时间 |

---

### 3. 对话系统表

#### `conversations` - 对话记录表 (统一存储三种对话)
| 字段 | 类型 | 说明 |
|------|------|------|
| conversation_id | VARCHAR(100) (PK) | 对话唯一标识 |
| user_id | VARCHAR(50) (FK) | 用户ID |
| conversation_type | VARCHAR(20) | 对话类型 |
| conversation_name | VARCHAR(200) | 对话名称 |
| **Tavus 视频对话字段** | | |
| tavus_conversation_id | VARCHAR(100) | Tavus 对话ID |
| tavus_conversation_url | TEXT | Tavus 对话URL |
| tavus_replica_id | VARCHAR(50) | Replica ID |
| tavus_persona_id | VARCHAR(50) | Persona ID |
| **Retell 语音对话字段** | | |
| retell_call_id | VARCHAR(100) | Retell 通话ID |
| retell_agent_id | VARCHAR(100) | Retell Agent ID |
| call_status | VARCHAR(20) | 通话状态 |
| call_type | VARCHAR(20) | 通话类型 |
| call_cost | TEXT | 通话费用 (JSON) |
| disconnection_reason | TEXT | 断开原因 |
| recording_url | TEXT | 录音URL |
| transcript_object | TEXT | 完整 transcript 对象 (JSON) |
| **通用字段** | | |
| started_at | TIMESTAMP | 开始时间 |
| ended_at | TIMESTAMP | 结束时间 |
| duration_seconds | INTEGER | 时长(秒) |
| status | VARCHAR(20) | 状态 (active/ended) |
| shutdown_reason | TEXT | 关闭原因 |
| transcript | TEXT | 对话记录 |
| conversational_context | TEXT | 对话上下文 |
| custom_greeting | TEXT | 自定义问候语 |
| properties | TEXT | 属性 (JSON) |
| metadata | TEXT | 元数据 (JSON) |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

**conversation_type 取值**:
- `gpt_chat`: GPT 文本对话
- `retell_voice`: Retell 语音对话
- `tavus_video`: Tavus 视频对话

**索引**:
- `idx_conv_user_id` (user_id)
- `idx_conv_type` (conversation_type)
- `idx_conv_started_at` (started_at)
- `idx_tavus_conv_id` (tavus_conversation_id)
- `idx_retell_call_id` (retell_call_id)

#### `conversation_analysis` - 对话分析表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER (PK) | 自增主键 |
| conversation_id | VARCHAR(100) (FK) | 对话ID |
| summary | TEXT | 对话摘要 |
| key_topics | TEXT | 关键话题 (JSON array) |
| extracted_data | TEXT | 提取的数据 (JSON) |
| user_intents | TEXT | 用户意图 (JSON array) |
| user_concerns | TEXT | 用户关切 (JSON array) |
| user_sentiment | VARCHAR(20) | 用户情感 |
| engagement_score | FLOAT | 参与度评分 (0-100) |
| action_items | TEXT | 行动项 (JSON array) |
| follow_up_needed | BOOLEAN | 是否需要跟进 |
| analysis_model | VARCHAR(50) | 分析模型 |
| analysis_timestamp | TIMESTAMP | 分析时间 |

---

### 4. 记忆系统表 (Memory System)

#### `user_memories` - 短期记忆表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER (PK) | 自增主键 |
| user_id | VARCHAR(50) (FK) | 用户ID |
| conversation_id | VARCHAR(100) (FK) | 对话ID |
| channel | VARCHAR(20) | 对话渠道 |
| summary | TEXT | 对话总结 |
| insights | TEXT | 洞察/发现 |
| key_topics | TEXT | 关键话题 (JSON array) |
| extracted_data | TEXT | 提取的数据 (JSON) |
| created_at | TIMESTAMP | 创建时间 |

**channel 取值**: `gpt_chat`, `retell_voice`, `tavus_video`

**索引**:
- `idx_mem_user_id` (user_id)
- `idx_mem_created_at` (created_at)
- `idx_mem_channel` (channel)

#### `user_long_term_memory` - 长期记忆表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER (PK) | 自增主键 |
| user_id | VARCHAR(50) (UNIQUE, FK) | 用户ID |
| preferences | TEXT | 用户偏好 (JSON) |
| health_goals | TEXT | 健康目标 (JSON) |
| habits | TEXT | 习惯 (JSON) |
| dietary_patterns | TEXT | 饮食模式 (JSON) |
| exercise_patterns | TEXT | 运动模式 (JSON) |
| stress_patterns | TEXT | 压力模式 (JSON) |
| sleep_patterns | TEXT | 睡眠模式 (JSON) |
| concerns | TEXT | 关注事项 (JSON array) |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

#### `user_todos` - 用户待办事项表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER (PK) | 自增主键 |
| user_id | VARCHAR(50) (FK) | 用户ID |
| conversation_id | VARCHAR(100) (FK) | 对话ID |
| title | VARCHAR(200) | TODO 标题 |
| description | TEXT | 详细描述 |
| category | VARCHAR(50) | 类别 |
| target_count | INTEGER | 目标次数 |
| current_count | INTEGER | 当前完成次数 |
| status | VARCHAR(20) | 状态 |
| week_start | DATE | 本周开始日期 |
| created_at | TIMESTAMP | 创建时间 |
| completed_at | TIMESTAMP | 完成时间 |

**category 取值**: `diet`, `exercise`, `sleep`, `stress`, `medication`, `other`

**status 取值**: `pending`, `in_progress`, `completed`, `cancelled`

**索引**:
- `idx_todo_user_id` (user_id)
- `idx_todo_status` (status)
- `idx_todo_week_start` (week_start)

---

## 🔧 使用方式

### 1. 查看完整 Schema 定义
```python
from database.schema import ALL_TABLES, ALL_INDEXES

# 查看所有表定义
for table_name, table_sql in ALL_TABLES:
    print(f"Table: {table_name}")
    print(table_sql)
    print()
```

### 2. 创建数据库
```python
import sqlite3
from database.schema import create_all_tables

conn = sqlite3.connect('cgm_butler.db')
create_all_tables(conn)
conn.close()
```

### 3. 查看表结构
```python
import sqlite3
from database.schema import get_table_info, list_all_tables

conn = sqlite3.connect('cgm_butler.db')

# 列出所有表
tables = list_all_tables(conn)
print("所有表:", tables)

# 查看特定表的结构
info = get_table_info(conn, 'conversations')
for column in info:
    print(column)

conn.close()
```

---

## 📝 数据流说明

### 对话数据流
```
用户对话 (Text/Voice/Video)
    ↓
保存到 conversations 表 (统一存储)
    ↓
MemoryService 处理
    ↓
├─→ user_memories (短期记忆)
├─→ user_long_term_memory (长期记忆更新)
└─→ user_todos (TODO 列表)
```

### 查询最近记忆用于下次对话
```python
from database.conversation_manager import ConversationManager

manager = ConversationManager()

# 获取最近 7 天的记忆
memories = manager.get_recent_memories(user_id='user_001', days=7)

# 获取长期记忆
long_term = manager.get_long_term_memory(user_id='user_001')

# 获取本周 TODO
todos = manager.get_weekly_todos(user_id='user_001')
```

---

## 🔄 Migration 脚本

如果需要更新现有数据库,运行对应的 migration 脚本:

```bash
# 添加对话表
python database/migration_add_conversations.py

# 添加记忆系统表
python database/migration_add_memory_tables.py

# 添加语音对话字段
python database/migration_add_voice_chat_fields.py
```

---

## 📦 相关文件

- `schema.py` - 统一的 Schema 定义 (本文件的数据源)
- `conversation_manager.py` - 对话和记忆的数据库操作
- `cgm_database.py` - CGM 数据的数据库操作
- `setup_database.py` - 初始化数据库和测试数据
- `migration_*.py` - 数据库迁移脚本

---

## ⚠️ 注意事项

1. **数据库文件位置**: 确保使用 `apps/backend/cgm_butler/database/cgm_butler.db`
2. **JSON 字段**: 所有标记为 JSON 的字段在存储前需要用 `json.dumps()` 序列化
3. **时间戳格式**: 使用 ISO 8601 格式 (`datetime.now().isoformat()`)
4. **外键约束**: SQLite 默认不启用外键约束,如需启用需执行 `PRAGMA foreign_keys = ON`

