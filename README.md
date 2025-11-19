# My Glucose Pal - CGM Butler 🩺

一个智能血糖管理助手,结合 CGM (连续血糖监测) 数据、AI 对话和个性化健康指导。

## 📁 项目结构

| 路径 | 说明 |
| --- | --- |
| `apps/frontend` | React 前端 (Vite + shadcn/ui) |
| `apps/backend` | Flask 后端服务 |
| `apps/minerva` | FastAPI 语音对话服务 (Retell AI) |
| `shared/database` | **统一数据库访问层** (所有服务共享) |
| `config/` | **配置管理** (环境变量、设置) |
| `storage/` | **运行时数据** (数据库、日志、上传文件) |
| `docs/` | **项目文档** (架构、API、开发指南) |

> 💡 **最近更新**: 
> - ✅ 完成数据库层重构 - Repository 模式,统一数据访问 ([详情](./REFACTORING_SUMMARY.md))
> - ✅ 完成代码清理 - 删除重复代码,优化项目结构 ([详情](./CLEANUP_REPORT.md))

## 🚀 快速开始

### 1. 环境配置

```bash
# 复制环境变量模板
cp config/.env.example .env

# 编辑 .env 文件,填写 API keys
# 必需: OPENAI_API_KEY, TAVUS_API_KEY, RETELL_API_KEY
```

### 2. 初始化数据库

```bash
python -c "from shared.database import init_database; init_database()"
```

### 3. 启动所有服务

**方法 A: 一键启动 (推荐)**

```bash
./start-all.sh
```

**方法 B: 手动启动**

```bash
# Terminal 1 - Backend (Flask)
cd apps/backend && python run.py

# Terminal 2 - Minerva (FastAPI)
cd apps/minerva && python main.py

# Terminal 3 - Frontend (React)
cd apps/frontend && npm run dev
```

### 4. 访问应用

- 🌐 Frontend: http://localhost:5173
- 🔧 Backend API: http://localhost:5000
- 🎙️ Minerva API: http://localhost:8000

详细说明请参考 [开发环境搭建](./docs/development/setup.md)

## 🏗️ 核心功能

### 1. 多模态 AI 对话

- **文本对话** (GPT-4o): 智能健康咨询
- **视频对话** (Tavus): 数字人视频交互
- **语音对话** (Retell AI): 自然语音交互

### 2. 智能记忆系统

- **短期记忆**: 最近 7 天的对话摘要
- **长期记忆**: 用户习惯、目标、偏好
- **TODO 管理**: 从对话中自动提取待办事项

### 3. CGM 数据分析

- 实时血糖监测
- 模式识别和预警
- 个性化健康建议

## 📚 文档

- [📖 完整文档](./docs/README.md)
- [🏗️ 系统架构](./docs/architecture/overview.md)
- [🗄️ 数据库结构](./docs/architecture/DATABASE_STRUCTURE.md)
- [💻 开发指南](./docs/development/setup.md)
- [🔄 重构总结](./REFACTORING_SUMMARY.md)

## 🧪 测试

```bash
# 运行所有测试
pytest

# 运行数据库测试
pytest shared/database/tests/

# 带覆盖率报告
pytest --cov=shared --cov-report=html
```

## 🛠️ 技术栈

### Frontend
- React + TypeScript
- Vite
- shadcn/ui
- TailwindCSS

### Backend
- Flask (主服务)
- FastAPI (Minerva 语音服务)
- SQLite (数据库)
- OpenAI GPT-4o
- Tavus (视频数字人)
- Retell AI (语音对话)

### 数据库
- Repository 模式
- 统一的 `shared/database` 层
- 支持多服务共享

## 📝 最近更新

### 2025-11-15: 代码清理完成 ✅

- ✅ 删除顶层重复的 `cgm_butler/` 目录
- ✅ 归档 50+ 个过时文件到 `.archive/`
- ✅ 统一数据库文件到 `storage/databases/`
- ✅ 整理文档到 `docs/design/` 和 `docs/integration/`
- ✅ 清理重复的数据库代码

详见 [CLEANUP_REPORT.md](./CLEANUP_REPORT.md)

### 2025-11-15: 数据库层重构 ✅

- ✅ 创建统一的 `shared/database/` 层
- ✅ 采用 Repository 模式
- ✅ 独立 Minerva 服务到 `apps/minerva/`
- ✅ 规范化配置管理 (`config/`)
- ✅ 添加测试框架
- ✅ 重组文档到 `docs/`

详见 [REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md) | [迁移完成](./MIGRATION_COMPLETE.md)

## 🤝 贡献

欢迎贡献! 请查看开发文档了解详情。

## 📄 许可

[添加许可信息]
