# Minerva - Voice Chat Backend Service

Minerva 是 CGM Butler 的语音对话后端服务,基于 FastAPI 和 Retell AI。

## 📁 目录结构

```
apps/minerva/
├── main.py                    ← FastAPI 应用入口
├── requirements.txt           ← Python 依赖
├── .env.example              ← 环境变量示例
├── README.md                 ← 本文档
└── src/
    ├── routers/              ← API 路由
    │   └── intake_router.py  ← 语音对话路由
    ├── services/             ← 业务逻辑
    │   └── intake_service.py ← 语音对话服务
    └── prompts/              ← Prompt 文件
        ├── olivia_coach_prompt.txt
        └── begin_message.txt
```

## 🚀 快速开始

### 1. 安装依赖

```bash
cd apps/minerva
pip install -r requirements.txt
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填写:

```bash
cp .env.example .env
```

必需的环境变量:
- `RETELL_API_KEY`: Retell AI API Key
- `INTAKE_AGENT_ID`: Retell Agent ID
- `INTAKE_LLM_ID`: Retell LLM ID
- `OPENAI_API_KEY`: OpenAI API Key
- `CGM_DB_PATH`: 数据库路径 (默认: `storage/databases/cgm_butler.db`)

### 3. 启动服务

```bash
python main.py
```

或使用 uvicorn:

```bash
uvicorn main:app --reload --port 8000
```

## 📡 API 端点

### 创建 Web Call

```http
POST /intake/create-web-call
Content-Type: application/json

{
  "user_id": "user_001"
}
```

### 保存通话数据

```http
POST /intake/save-call-data
Content-Type: application/json

{
  "user_id": "user_001",
  "call_id": "call_abc123",
  "agent_id": "agent_123",
  "call_status": "ended",
  "transcript": "...",
  "transcript_object": [...]
}
```

## 🔗 与 Backend 的集成

Minerva 使用 `shared/database` 模块与主 Backend 共享数据库访问:

```python
from shared.database import get_connection, ConversationRepository, MemoryRepository

conn = get_connection()
repo = ConversationRepository(conn)
conv_id = repo.save_retell_conversation(...)
```

## 📝 开发说明

- 所有数据库操作通过 `shared/database` 进行
- 使用 Repository 模式访问数据
- 环境变量通过 `os.getenv()` 读取
- 日志使用 Python `logging` 模块

## 🧪 测试

```bash
pytest tests/
```

