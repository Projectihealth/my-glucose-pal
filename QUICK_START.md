# CGM Butler - 快速启动指南

## 📋 环境变量配置

将以下内容复制到项目根目录的 `.env` 文件中:

```bash
# ============================================
# OpenAI API (文本对话 + AI 功能)
# ============================================
OPENAI_API_KEY=your_openai_api_key_here

# ============================================
# Tavus API (视频对话功能)
# ============================================
TAVUS_API_KEY=41a2bc2eb63741f2bd6f7d7a2974fc64
TAVUS_PERSONA_ID=p4e7a065501a
TAVUS_REPLICA_ID=r9fa0878977a

# ============================================
# Retell API (语音对话功能)
# ============================================
RETELL_API_KEY=key_e3b74c0de01a1ba9c20228131da1
INTAKE_AGENT_ID=agent_c7d1cb2c279ec45bce38c95067
INTAKE_LLM_ID=llm_e54c307ce74090cdfd06f682523b

# ============================================
# 数据库配置
# ============================================
CGM_DB_PATH=/Users/yijialiu/Desktop/my-glucose-pal/storage/databases/cgm_butler.db

# ============================================
# 服务配置
# ============================================
FLASK_ENV=development
FLASK_DEBUG=True
FLASK_PORT=5000
MINERVA_PORT=8000
CGM_BACKEND_URL=http://localhost:5000
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:8080
```

## 🚀 启动服务

### 一键启动所有服务

```bash
./start-all.sh
```

### 停止所有服务

```bash
./stop-all.sh
```

## 🌐 访问地址

- **前端界面**: http://localhost:8080
- **Flask Backend**: http://localhost:5000
- **Minerva Service**: http://localhost:8000

## ✅ 功能测试

### 1. Voice Chat (语音对话)

```bash
curl -X POST http://localhost:8000/intake/create-web-call \
  -H "Content-Type: application/json" \
  -d '{"user_id":"user_001"}'
```

### 2. Video Chat (视频对话)

```bash
curl -X POST http://localhost:5000/api/avatar/start \
  -H "Content-Type: application/json" \
  -d '{"user_id":"user_001"}'
```

### 3. Text Chat (文本对话)

访问前端界面 http://localhost:8080 并点击 "Text Chat" 卡片。

## 📊 数据库初始化

如果数据库表缺失,运行:

```bash
python3 -c "
from shared.database import get_connection
from shared.database.schema import create_all_tables
conn = get_connection()
create_all_tables(conn)
conn.close()
print('✅ 数据库表已创建')
"
```

## 🔧 故障排查

### 服务无法启动

1. 检查端口是否被占用:
   ```bash
   lsof -i :5000 -i :8000 -i :8080
   ```

2. 查看日志:
   ```bash
   tail -f logs/flask.log
   tail -f logs/minerva.log
   tail -f logs/frontend.log
   ```

### 数据库错误

确保 `.env` 中的 `CGM_DB_PATH` 是绝对路径:

```bash
CGM_DB_PATH=/Users/yijialiu/Desktop/my-glucose-pal/storage/databases/cgm_butler.db
```

## 📝 注意事项

1. **不要提交 `.env` 文件到 Git!** 它已经在 `.gitignore` 中。
2. 首次启动可能需要等待 10-15 秒让所有服务完全启动。
3. 如果修改了代码,需要重启服务才能生效。

## 🎉 完成!

现在你可以访问 http://localhost:8080 开始使用 CGM Butler 了!
