# CGM Butler - 智能血糖管理助手

通过 AI 驱动的对话和实时数据分析,为用户提供个性化的血糖管理支持和健康建议。

## 🎯 项目概述

### 核心功能
- 🩺 **CGM 数据管理** - 存储和分析连续血糖监测数据
- 🤖 **AI 聊天助手** (Olivia) - GPT-4o 驱动的智能对话
- 🎬 **数字人视频** - Tavus AI 创建的视频对话互动
- 📊 **Web 仪表板** - 实时数据可视化和分析
- 🔍 **模式识别** - 自动检测血糖模式(共10种)
- 💾 **对话历史** - 保存所有对话记录用于分析

### 核心模块
```
cgm-butler/
├── database/                  # 数据库模块
│   ├── cgm_database.py       # 数据库操作类
│   ├── cgm_butler.db         # SQLite 数据库
│   ├── conversation_manager.py # 对话历史管理
│   ├── migration_add_conversations.py # 数据库迁移
│   └── setup_database.py     # 初始化脚本
│
├── dashboard/                # Flask Web 仪表板
│   ├── app.py               # Flask 应用
│   └── templates/index.html # 前端界面
│
├── digital_avatar/          # AI 聊天模块
│   ├── gpt_chat.py          # GPT-4o 聊天管理
│   ├── api.py               # REST API 端点
│   ├── chat.html            # 聊天界面
│   ├── cgm_tools.py         # CGM 工具函数
│   ├── config.py            # 配置管理
│   └── tavus_client.py      # Tavus API 客户端
│
├── pattern_identification/  # 模式识别模块
│   ├── identifier.py        # 10 种 CGM 模式识别
│   └── scheduler.py         # 定时任务调度
│
├── cgm-avatar-app/          # React Tavus 视频应用
│   ├── src/App.tsx          # React 应用主组件
│   ├── package.json         # 依赖配置
│   └── vite.config.ts       # Vite 配置
│
├── start_chat.bat           # 启动文本聊天
├── start_dashboard.bat      # 启动 Web 仪表板
├── start_video_avatar.bat   # 启动视频头像
├── requirements.txt         # Python 依赖
├── README.md               # 本文档
└── INTEGRATION_COMPLETE.md # 功能集成完成报告
```

## 🚀 快速开始

### 1. 环境配置
```bash
# 安装 Python 依赖
pip install -r requirements.txt

# 安装 Node.js 依赖 (用于视频头像)
cd cgm-avatar-app
npm install
```

### 2. 初始化数据库
```bash
python database/setup_database.py
```

### 3. 启动服务

#### 方式 A: 文本聊天 (推荐快速测试)
```bash
start_chat.bat
# 或
cd dashboard && python app.py
# 然后访问: http://localhost:5000/chat
```

#### 方式 B: Web 仪表板
```bash
start_dashboard.bat
# 访问: http://localhost:5000
```

#### 方式 C: 视频头像
```bash
start_video_avatar.bat
# 启动: Flask (端口 5000) 和 React (端口 5173)
# 访问: http://localhost:5173
```

## 🔑 配置 API Keys

需要设置以下环境变量:

```bash
# .env 文件
TAVUS_API_KEY=your-tavus-api-key
TAVUS_PERSONA_ID=your-persona-id
OPENAI_API_KEY=your-openai-api-key
```

或在系统环境变量中设置:
```bash
set TAVUS_API_KEY=your-key
set OPENAI_API_KEY=your-key
```

## 📊 功能详情

### Web 仪表板
- 📈 实时血糖数据可视化
- 📊 7 天血糖统计
- 🔍 血糖模式识别显示
- 💡 个性化健康建议
- 👥 多用户支持

### AI 聊天助手 (Olivia)
- 🤖 由 GPT-4o 驱动
- 💬 自然对话交互
- 🔍 自动查询 CGM 数据
- 📝 完整对话历史保存
- 🧠 个性化的健康顾问

### 数字人视频 (Tavus)
- 🎬 AI 生成的视频对话
- 🎤 支持语音交互
- 💡 上下文感知回应
- 📹 专业视频质量

## 📝 对话历史

所有对话都自动保存到数据库:
```python
from database.conversation_manager import ConversationManager

manager = ConversationManager()
conversations = manager.get_user_conversations('user_001')
for conv in conversations:
    print(f"对话 ID: {conv['conversation_id']}")
    print(f"消息数: {len(conv['transcript'])}")
    print(f"时长: {conv['duration_seconds']}s")
```

## 🔍 CGM 模式识别 (10 种)

系统能识别以下血糖模式:

1. **Post-Meal Spike** - 餐后血糖飙升
2. **Dawn Phenomenon** - 黎明现象
3. **Nocturnal Hypoglycemia** - 夜间低血糖
4. **Afternoon Dip** - 下午血糖下降
5. **High Variability** - 高血糖波动
6. **Sustained Hyperglycemia** - 持续高血糖
7. **Frequent Hypoglycemia** - 频繁低血糖
8. **Post-Exercise Drop** - 运动后血糖下降
9. **Stress Hyperglycemia** - 压力引起的高血糖
10. **Roller Coaster** - 血糖大幅波动

每 4 小时自动检测一次,结果显示在仪表板上。

## 📚 文档

- **[对话历史指南](CONVERSATION_HISTORY_GUIDE.md)** - 对话保存和分析
- **[集成完成报告](INTEGRATION_COMPLETE.md)** - 所有功能集成细节

## 🛠 技术栈

### 后端
- **Python 3.7+** - 核心编程语言
- **SQLite 3** - 数据库
- **Flask** - Web 框架
- **OpenAI GPT-4o** - AI 聊天
- **Tavus API** - 数字人视频

### 前端
- **HTML/CSS/JavaScript** - 仪表板
- **React + TypeScript** - 视频应用
- **Vite** - 构建工具
- **Chart.js** - 数据可视化

## 🔒 安全性

⚠️ **重要提示**:

1. **API Keys** - 永远不要硬编码敏感信息,使用环境变量
2. **数据隐私** - 遵守 HIPAA/GDPR 等医疗数据法规
3. **生产部署** - 添加用户认证和 HTTPS
4. **医疗免责** - 本项目仅供参考,不构成医疗建议

## 📞 联系方式

GitHub: [yijialiu-aigeekgo/cgm_butler](https://github.com/yijialiu-aigeekgo/cgm_butler)

## 📄 许可证

待定

---

**版本**: v2.0.0  
**最后更新**: 2025-10-27  
**状态**: ✅ 所有核心模块完成,可用于生产
