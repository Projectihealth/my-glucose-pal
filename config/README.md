# Configuration

统一的配置管理模块。

## 📁 文件说明

- `.env.example`: 环境变量模板
- `settings.py`: 配置类定义

## 🚀 使用方法

### 1. 创建 .env 文件

```bash
cp config/.env.example .env
```

然后编辑 `.env` 文件,填写实际的 API keys 和配置。

### 2. 在代码中使用

```python
from config.settings import settings

# 数据库路径
db_path = settings.DB_PATH

# API Keys
openai_key = settings.OPENAI_API_KEY
tavus_key = settings.TAVUS_API_KEY
retell_key = settings.RETELL_API_KEY

# 服务配置
flask_port = settings.FLASK_PORT
minerva_port = settings.MINERVA_PORT
```

### 3. 验证配置

```bash
python config/settings.py
```

输出示例:

```
================================================================================
CGM Butler - Configuration
================================================================================
Settings(
  DB_PATH=storage/databases/cgm_butler.db
  OPENAI_API_KEY=***
  TAVUS_API_KEY=***
  RETELL_API_KEY=***
  FLASK_ENV=development
  FLASK_PORT=5000
  MINERVA_PORT=8000
)
================================================================================
✅ All required settings are configured
```

## 🔒 安全注意事项

1. **永远不要提交 `.env` 文件到版本控制**
2. `.env` 已添加到 `.gitignore`
3. 只提交 `.env.example` 作为模板
4. 生产环境使用环境变量而非 `.env` 文件

## 📝 环境变量优先级

1. 系统环境变量 (最高优先级)
2. `.env` 文件
3. 代码中的默认值 (最低优先级)

## 🎯 最佳实践

### 开发环境

使用 `.env` 文件:

```bash
# .env
FLASK_ENV=development
FLASK_DEBUG=True
```

### 生产环境

使用系统环境变量:

```bash
export FLASK_ENV=production
export FLASK_DEBUG=False
export CGM_DB_PATH=/var/lib/cgm-butler/cgm_butler.db
```

或使用 Docker:

```yaml
# docker-compose.yml
environment:
  - FLASK_ENV=production
  - CGM_DB_PATH=/data/cgm_butler.db
```

