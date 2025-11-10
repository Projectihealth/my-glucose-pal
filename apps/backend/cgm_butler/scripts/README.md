# CGM Butler - 启动脚本与工具

本文件夹包含所有快速启动脚本、清理工具和启动文档。

## 📁 文件结构

```
scripts/
├── README.md                    # 本文件
├── startup/                     # 启动脚本
│   ├── start_chat.bat          # 一键启动（Dashboard + Vite + Chat）
│   ├── start_dashboard.bat     # 仅启动 Dashboard
│   ├── start_video_avatar.bat  # 启动 Dashboard + Video Avatar
│   ├── start_app.ps1           # PowerShell 启动脚本
│   └── restart_with_cleanup.bat # 清理旧对话后启动
├── cleanup/                     # 清理工具
│   ├── cleanup_tavus.bat       # Tavus 对话清理（一键）
│   ├── cleanup_tavus.py        # Tavus 清理脚本（Python）
│   └── TAVUS_CLEANUP_GUIDE.md  # 清理指南
├── verify/                      # 验证工具
│   └── verify_config.py        # 配置验证脚本
└── docs/                        # 文档
    ├── QUICKSTART.md           # 快速开始
    ├── TROUBLESHOOTING.md      # 故障排除
    └── CONVERSATION_HISTORY_GUIDE.md  # 对话历史
```

---

## 🚀 快速启动

### **方式 1：双击启动脚本（推荐）**

进入 `startup/` 文件夹：

- **start_chat.bat** - 完整启动（推荐）
  - 启动 Dashboard（http://localhost:5000）
  - 启动 Video Avatar（http://localhost:5173）
  - 打开聊天界面

- **start_dashboard.bat** - 仅启动 Dashboard
  
- **start_video_avatar.bat** - 启动 Dashboard + Video Avatar

### **方式 2：PowerShell 启动**

```powershell
cd "D:\cgm butler\scripts\startup"

# 或者直接运行 start_app.ps1
.\start_app.ps1
```

### **方式 3：命令行启动（最灵活）**

```powershell
# 窗口1：启动 Dashboard
cd "D:\cgm butler"
python dashboard/app.py

# 窗口2：启动 Vite 前端
cd "D:\cgm butler\cgm-avatar-app"
npm run dev

# 窗口3：打开聊天界面
start "D:\cgm butler\digital_avatar\chat.html"
```

或见 [QUICKSTART.md](./docs/QUICKSTART.md) 中的详细命令

---

## 🧹 清理工具

进入 `cleanup/` 文件夹：

### **解决 Tavus 并发对话错误**

```bash
# 方式1：双击 cleanup_tavus.bat
cleanup_tavus.bat

# 方式2：Python 脚本
python cleanup_tavus.py

# 方式3：指定对话ID清理
python cleanup_tavus.py --conversation-id conv_xxxxx
```

详见 [TAVUS_CLEANUP_GUIDE.md](./cleanup/TAVUS_CLEANUP_GUIDE.md)

---

## ✅ 配置验证

进入 `verify/` 文件夹：

```bash
python verify_config.py
```

验证项：
- ✅ 环境变量（OpenAI、Tavus）
- ✅ 依赖库安装
- ✅ 必要文件存在
- ✅ OpenAI API 连接

---

## 📚 文档

进入 `docs/` 文件夹：

| 文件 | 说明 |
|------|------|
| **QUICKSTART.md** | 详细启动命令和配置 |
| **TROUBLESHOOTING.md** | 常见问题与解决方案 |
| **CONVERSATION_HISTORY_GUIDE.md** | 对话历史管理 |

---

## 🎯 常见场景

### **场景1：第一次使用**
```bash
# 1. 验证配置
python verify/verify_config.py

# 2. 启动应用
双击 startup/start_chat.bat
```

### **场景2：遇到 Tavus 并发错误**
```bash
# 1. 清理旧对话
双击 cleanup/cleanup_tavus.bat

# 2. 重新启动
双击 startup/restart_with_cleanup.bat
```

### **场景3：仅启动后端开发**
```bash
# 1. 启动 Dashboard
双击 startup/start_dashboard.bat

# 2. 访问 http://localhost:5000
```

### **场景4：需要调试**
```bash
# 1. 打开 3 个 PowerShell 窗口分别运行

# 窗口1：Dashboard（可看日志）
cd "D:\cgm butler" && python dashboard/app.py

# 窗口2：Vite（可看编译输出）
cd "D:\cgm butler\cgm-avatar-app" && npm run dev

# 窗口3：打开聊天界面
start "D:\cgm butler\digital_avatar\chat.html"
```

---

## ⚙️ 环境配置

所有 API Keys 已配置在代码中默认值：
- **OpenAI API Key**: digital_avatar/config.py
- **Tavus API Key**: digital_avatar/config.py
- **Tavus Persona ID**: cgm-avatar-app/vite.config.ts

若需修改，请编辑上述文件。

---

## 🔗 相关链接

- **项目主README**: ../README.md
- **Tavus 文档**: https://docs.tavus.io/
- **OpenAI 文档**: https://platform.openai.com/docs/

---

**快速导航**
- 🚀 启动应用 → `startup/start_chat.bat`
- 🧹 清理对话 → `cleanup/cleanup_tavus.bat`
- ✅ 验证配置 → `verify/verify_config.py`
- 📖 查看文档 → `docs/`
