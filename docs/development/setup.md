# 开发环境搭建

## 📋 前置要求

- Python 3.9+
- Node.js 16+
- Git

## 🚀 快速开始

### 1. 克隆仓库

```bash
git clone <repository-url>
cd my-glucose-pal
```

### 2. 配置环境变量

```bash
cp config/.env.example .env
```

编辑 `.env` 文件,填写必需的 API keys:

```bash
# 必需
OPENAI_API_KEY=sk-...
TAVUS_API_KEY=...
RETELL_API_KEY=...

# 可选 (有默认值)
CGM_DB_PATH=storage/databases/cgm_butler.db
FLASK_PORT=5000
MINERVA_PORT=8000
```

### 3. 初始化数据库

```bash
python -c "from shared.database import init_database; init_database()"
```

### 4. 安装依赖

#### Backend (Flask)

```bash
cd apps/backend
pip install -r requirements.txt
```

#### Minerva (FastAPI)

```bash
cd apps/minerva
pip install -r requirements.txt
```

#### Frontend (React)

```bash
cd apps/frontend
npm install
```

### 5. 启动服务

#### 方法 A: 使用启动脚本 (推荐)

```bash
./start-all.sh
```

#### 方法 B: 手动启动

**Terminal 1 - Backend:**
```bash
cd apps/backend
python run.py
```

**Terminal 2 - Minerva:**
```bash
cd apps/minerva
python main.py
```

**Terminal 3 - Frontend:**
```bash
cd apps/frontend
npm run dev
```

### 6. 访问应用

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Minerva API: http://localhost:8000

## 🧪 运行测试

```bash
# 所有测试
pytest

# 特定模块
pytest shared/database/tests/

# 带覆盖率
pytest --cov=shared --cov-report=html
```

## 🔧 开发工具

### 推荐 IDE

- **VSCode** (推荐)
  - Python 扩展
  - Pylance
  - ESLint
  - Prettier

### 代码格式化

```bash
# Python
black apps/backend apps/minerva shared

# JavaScript/TypeScript
cd apps/frontend && npm run format
```

### Linting

```bash
# Python
flake8 apps/backend apps/minerva shared

# JavaScript/TypeScript
cd apps/frontend && npm run lint
```

## 📝 常见问题

### Q: 数据库文件在哪里?

A: 默认在 `storage/databases/cgm_butler.db`。可通过 `CGM_DB_PATH` 环境变量修改。

### Q: 如何重置数据库?

A: 删除数据库文件并重新初始化:

```bash
rm storage/databases/cgm_butler.db
python -c "from shared.database import init_database; init_database()"
```

### Q: 端口冲突怎么办?

A: 修改 `.env` 文件中的端口配置:

```bash
FLASK_PORT=5001
MINERVA_PORT=8001
```

### Q: API Key 无效?

A: 检查 `.env` 文件是否正确配置,并确保 API keys 有效。

## 🔗 相关文档

- [数据库使用指南](../architecture/database.md)
- [API 文档](../api/backend.md)
- [测试指南](./testing.md)

