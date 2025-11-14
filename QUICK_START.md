# 🚀 Quick Start Guide

## 一键启动 My Glucose Pal with Olivia

### 📋 前提条件

确保已安装：
- ✅ Node.js (v18+)
- ✅ Python (v3.8+)
- ✅ npm 或 yarn

### 🎯 使用方法

#### 1️⃣ 启动所有服务

```bash
./start-all.sh
```

这个命令会自动启动：
- 🔵 Flask 后端 (端口 5000)
- 🟣 Minerva 语音服务 (端口 8000)
- 🟢 前端应用 (端口 8080)

启动完成后会自动打开浏览器访问 `http://localhost:8080`

#### 2️⃣ 停止所有服务

**方法 1：在启动终端按 `Ctrl+C`**

**方法 2：运行停止脚本**
```bash
./stop-all.sh
```

#### 3️⃣ 查看日志

查看所有日志摘要：
```bash
./view-logs.sh all
```

查看特定服务的实时日志：
```bash
# Flask 后端
./view-logs.sh flask

# Minerva 语音服务
./view-logs.sh minerva

# 前端
./view-logs.sh frontend
```

---

## 📱 访问应用

启动后访问：
- **主应用**: http://localhost:8080
- **Olivia (Coach)**: http://localhost:8080/coach

### Olivia 三种对话模式

1. **💬 文本聊天** - GPT-4o 智能对话
2. **🎤 语音对话** - Retell 实时语音通话
3. **🎥 视频对话** - Tavus 数字人视频对话

---

## 🔧 手动启动（调试用）

如果需要单独启动某个服务进行调试：

### Flask 后端
```bash
cd apps/backend/cgm_butler
python dashboard/app.py
```

### Minerva 服务
```bash
cd cgm_butler/minerva
uvicorn main:app --reload --port 8000
```

### 前端
```bash
cd apps/frontend
npm run dev
```

---

## 📝 日志位置

所有日志保存在 `logs/` 目录：
- `logs/flask.log` - Flask 后端日志
- `logs/minerva.log` - Minerva 服务日志
- `logs/frontend.log` - 前端日志

---

## ⚠️ 常见问题

### 端口被占用

如果看到 "Port already in use" 错误：

```bash
# 查看占用端口的进程
lsof -ti:5000
lsof -ti:8000
lsof -ti:8080

# 杀掉进程（替换 PID）
kill -9 <PID>

# 或者运行停止脚本清理
./stop-all.sh
```

### 服务启动失败

1. 检查日志文件
2. 确保所有依赖已安装
3. 确保环境变量配置正确

### 前端依赖问题

```bash
cd apps/frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 🎉 开始使用

1. 运行 `./start-all.sh`
2. 浏览器会自动打开
3. 点击底部导航的 "Olivia" tab
4. 选择你想要的对话模式
5. 开始和 Olivia 聊天！

---

## 📚 更多文档

- [Integration Plan](CGM_BUTLER_INTEGRATION_PLAN.md) - 完整集成方案
- [Integration Complete](INTEGRATION_COMPLETE.md) - 集成完成总结
- [Integration Review](INTEGRATION_REVIEW_SUMMARY.md) - 审查总结

---

**Enjoy using My Glucose Pal with Olivia! 🎉**



