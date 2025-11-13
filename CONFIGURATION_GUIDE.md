# 🔧 配置指南 - My Glucose Pal with Olivia

## ⚠️ 必需配置

要使用 Olivia 的所有功能，你需要配置 API keys：

---

## 📝 快速配置步骤

### 1️⃣ 配置后端 API Keys

**创建后端配置文件：**

```bash
cd /Users/yijialiu/Desktop/my-glucose-pal/apps/backend/cgm_butler
cp .env.example .env
```

**编辑 `.env` 文件，填入你的 API keys：**

```bash
# OpenAI API Key (必需 - 用于文本聊天)
OPENAI_API_KEY=sk-your-actual-openai-api-key-here

# Tavus API Key (可选 - 用于视频对话)
TAVUS_API_KEY=your-tavus-api-key-here
TAVUS_PERSONA_ID=your-tavus-persona-id-here

# Database (默认配置，无需修改)
CGM_DB_PATH=./database/cgm_butler.db

# Flask (默认配置，无需修改)
FLASK_ENV=development
FLASK_DEBUG=True
```

### 2️⃣ 配置 Minerva 服务

**编辑 Minerva 配置文件：**

```bash
cd /Users/yijialiu/Desktop/my-glucose-pal/cgm_butler/minerva
nano .env  # 或使用你喜欢的编辑器
```

**确保以下配置存在：**

```bash
# Retell API (用于语音对话)
RETELL_API_KEY=your-retell-api-key
INTAKE_AGENT_ID=agent_xxx
INTAKE_LLM_ID=llm_xxx

# OpenAI API (用于语音对话)
OPENAI_API_KEY=sk-your-actual-openai-api-key-here

# Backend URLs (已配置，无需修改)
CGM_BACKEND_URL=http://localhost:5000
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:8080
```

---

## 🔑 如何获取 API Keys

### OpenAI API Key (必需)

1. 访问 [OpenAI Platform](https://platform.openai.com/)
2. 注册/登录账号
3. 进入 [API Keys](https://platform.openai.com/api-keys)
4. 点击 "Create new secret key"
5. 复制生成的 key（格式：`sk-...`）
6. 粘贴到 `.env` 文件中

**费用说明：**
- Text Chat 使用 GPT-4o，按使用量计费
- 建议设置使用限额

### Retell API Key (可选 - 语音对话)

1. 访问 [Retell AI](https://www.retellai.com/)
2. 注册账号并获取 API key
3. 创建 Agent 和 LLM 配置
4. 填入 Minerva 的 `.env`

### Tavus API Key (可选 - 视频对话)

1. 访问 [Tavus](https://www.tavus.io/)
2. 注册账号并获取 API key
3. 创建 Persona
4. 填入后端的 `.env`

---

## ✅ 验证配置

配置完成后，重启服务：

```bash
cd /Users/yijialiu/Desktop/my-glucose-pal
./stop-all.sh
./start-all.sh
```

**检查启动日志：**

```bash
# 查看 Flask 日志
./view-logs.sh flask

# 应该看到：
# ✅ OPENAI_API_KEY: 已设置
# ✅ GPT-4o chat initialized successfully
```

---

## 🎯 功能 vs API Keys 对照表

| 功能 | 需要的 API Key | 是否必需 |
|------|---------------|---------|
| 💬 **Text Chat** | OpenAI (后端) | ✅ 必需 |
| 🎤 **Voice Chat** | Retell + OpenAI (Minerva) | 可选 |
| 🎥 **Video Chat** | Tavus + Daily.co | 可选 |

**最低配置（只使用文本聊天）：**
- ✅ 只需要 OpenAI API Key 在后端配置

---

## 🐛 常见问题

### Q1: 启动后显示 "OPENAI_API_KEY: 未设置"

**A:** `.env` 文件不存在或未正确配置
```bash
# 创建配置文件
cd apps/backend/cgm_butler
cp .env.example .env
# 编辑文件填入 API key
nano .env
```

### Q2: Text Chat 返回 500 错误

**A:** OpenAI API Key 无效或未设置
- 检查 key 格式是否正确（`sk-...`）
- 检查 OpenAI 账户是否有余额
- 查看日志：`./view-logs.sh flask`

### Q3: Voice Chat 无法连接

**A:** Retell 服务未配置
- 检查 `cgm_butler/minerva/.env`
- 确保 Retell API key 已填写

---

## 📚 完整配置文件示例

### `/apps/backend/cgm_butler/.env`
```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
TAVUS_API_KEY=tvs_xxxxxxxxxxxxxxxxxxxxx
TAVUS_PERSONA_ID=persona_xxxxxxxxxxxxx
CGM_DB_PATH=./database/cgm_butler.db
FLASK_ENV=development
FLASK_DEBUG=True
```

### `/cgm_butler/minerva/.env`
```bash
RETELL_API_KEY=key_xxxxxxxxxxxxxxxxxxxxx
INTAKE_AGENT_ID=agent_xxxxxxxxxxxxxxxxxxxxx
INTAKE_LLM_ID=llm_xxxxxxxxxxxxxxxxxxxxx
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
CGM_BACKEND_URL=http://localhost:5000
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:8080
```

---

## 🚀 快速开始

1. **获取 OpenAI API Key**（必需）
2. **配置后端 `.env`**
3. **重启服务** `./start-all.sh`
4. **测试 Text Chat**

就这么简单！🎉

---

**需要帮助？** 查看日志了解详细错误信息：
```bash
./view-logs.sh all
```

