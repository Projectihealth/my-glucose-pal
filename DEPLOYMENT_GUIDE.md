# 🚀 部署指南 / Deployment Guide

本指南将帮助你将 My Glucose Pal 完整部署到生产环境。

## 📋 部署架构

- **Frontend**: Vercel (已完成 ✅)
- **CGM Butler Backend (Flask)**: Railway/Render
- **Minerva Backend (FastAPI)**: Railway/Render

---

## 🔧 步骤 1: 部署 CGM Butler Backend (Flask)

### 使用 Railway 部署（推荐）

1. **访问 [Railway.app](https://railway.app/) 并登录**

2. **创建新项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 选择你的 `my-glucose-pal` 仓库

3. **配置服务**
   - Root Directory: `apps/backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn -w 4 -b 0.0.0.0:$PORT "cgm_butler.app:create_app()"`

4. **添加环境变量**

   在 Railway 项目的 Variables 标签中添加：

   ```bash
   # Database Configuration
   DB_TYPE=mysql
   MYSQL_HOST=<your_mysql_host>
   MYSQL_PORT=<your_mysql_port>
   MYSQL_USER=<your_mysql_user>
   MYSQL_PASSWORD=<your_mysql_password>
   MYSQL_DATABASE=<your_mysql_database>
   MYSQL_CHARSET=utf8mb4

   # OpenAI API
   OPENAI_API_KEY=<your_openai_api_key>

   # Tavus API (for video chat)
   TAVUS_API_KEY=<your_tavus_api_key>
   TAVUS_PERSONA_ID=<your_tavus_persona_id>
   TAVUS_REPLICA_ID=<your_tavus_replica_id>

   # Flask Configuration
   FLASK_ENV=production
   FLASK_DEBUG=False

   # CORS (update after deployment)
   CORS_ORIGINS=https://my-glucose-pal.vercel.app
   ```

5. **部署**
   - Railway 会自动部署
   - 记录生成的 URL（例如：`https://your-app.railway.app`）

---

## 🔧 步骤 2: 部署 Minerva Backend (FastAPI)

### 使用 Railway 部署

1. **在 Railway 创建另一个新项目**
   - 再次选择你的 `my-glucose-pal` 仓库

2. **配置服务**
   - Root Directory: `apps/backend/cgm_butler/digital_avatar`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn api:app --host 0.0.0.0 --port $PORT`

3. **添加环境变量**

   ```bash
   # Retell API (for voice chat)
   RETELL_API_KEY=<your_retell_api_key>
   INTAKE_AGENT_ID=<your_intake_agent_id>
   INTAKE_LLM_ID=<your_intake_llm_id>

   # OpenAI API
   OPENAI_API_KEY=<your_openai_api_key>

   # Database Configuration (same as CGM Butler)
   DB_TYPE=mysql
   MYSQL_HOST=<your_mysql_host>
   MYSQL_PORT=<your_mysql_port>
   MYSQL_USER=<your_mysql_user>
   MYSQL_PASSWORD=<your_mysql_password>
   MYSQL_DATABASE=<your_mysql_database>
   MYSQL_CHARSET=utf8mb4

   # CGM Backend URL (from Step 1)
   CGM_BACKEND_URL=<步骤1中的Railway URL>

   # CORS
   CORS_ORIGINS=https://my-glucose-pal.vercel.app
   ```

4. **部署**
   - 记录生成的 URL（例如：`https://your-minerva.railway.app`）

---

## 🔧 步骤 3: 更新 Vercel 环境变量

1. **访问 [Vercel Dashboard](https://vercel.com/dashboard)**

2. **选择你的 `my-glucose-pal` 项目**

3. **进入 Settings → Environment Variables**

4. **添加以下环境变量**：

   ```bash
   # Backend URLs (use your Railway URLs from above)
   VITE_BACKEND_URL=<步骤1中的Flask URL>
   VITE_MINERVA_BACKEND_URL=<步骤2中的FastAPI URL>

   # Default User
   VITE_DEFAULT_USER_ID=user_001

   # Optional: OpenAI (for frontend features)
   VITE_OPENAI_API_KEY=<your_openai_api_key>

   # Optional: Tavus (for video chat)
   VITE_TAVUS_API_KEY=<your_tavus_api_key>
   ```

5. **重新部署 Vercel**
   - 在 Deployments 页面点击最新部署旁的三个点
   - 选择 "Redeploy"

---

## ✅ 步骤 4: 验证部署

等待所有服务部署完成后，访问 `https://my-glucose-pal.vercel.app`

测试以下功能：
- ✅ My CGM 页面加载
- ✅ Text Chat (需要 Flask backend)
- ✅ Voice Chat (需要 Minerva backend)
- ✅ Video Chat (需要 Flask backend + Tavus)

---

## 🔍 常见问题

### 1. CORS 错误

如果看到 CORS 错误，确保后端的 `CORS_ORIGINS` 包含你的 Vercel URL：
```
CORS_ORIGINS=https://my-glucose-pal.vercel.app,https://my-glucose-pal-*.vercel.app
```

### 2. 数据库连接失败

检查 MySQL 配置是否正确，特别是：
- Host 和 Port
- 用户名和密码
- 数据库是否允许外部连接

### 3. 502 Bad Gateway

后端服务可能未正确启动。检查：
- Railway/Render 部署日志
- 环境变量是否正确设置
- Start Command 是否正确

### 4. Voice/Video Chat 不工作

确保：
- Retell API Key 有效且有额度
- Tavus API Key 有效且有额度
- 后端 URL 在 Vercel 中正确配置

---

## 💡 替代方案: 使用 Render

如果不想用 Railway，可以使用 [Render](https://render.com/)（免费额度）：

1. **创建 Web Service**
2. **连接 GitHub 仓库**
3. **配置类似 Railway 的设置**
4. **添加相同的环境变量**

---

## 📞 需要帮助？

如果遇到问题：
1. 检查部署日志
2. 确认所有环境变量正确设置
3. 测试后端 API endpoints 是否可访问

---

**祝部署顺利！🎉**
