# MySQL 数据库迁移指南

本指南将帮助你从 SQLite 迁移到 MySQL 数据库。

## 📋 前提条件

### 1. MySQL 服务器信息

根据你提供的MySQL服务器信息：
```
Host: cdb-21524894-89b5-412b-b520-510dfa4e32f8-0
Port: 20120
Version: 8.0.22-txsql
```

### 2. 需要的信息

你需要准备以下信息：
- ✅ MySQL用户名（通常是 `root`）
- ✅ MySQL密码
- ✅ 要使用的数据库名称（建议：`cgm_butler`）

---

## 🚀 迁移步骤

### 步骤 1: 安装 MySQL 依赖

```bash
cd /Users/yijialiu/Desktop/my-glucose-pal

# 安装后端依赖
pip install pymysql cryptography

# 或者安装完整的requirements
pip install -r apps/backend/cgm_butler/requirements.txt
pip install -r apps/minerva/requirements.txt
```

### 步骤 2: 配置环境变量

在项目根目录创建或编辑 `.env` 文件：

```bash
# 在项目根目录创建 .env 文件
cat > .env << 'EOF'
# ============================================================
# 数据库配置
# ============================================================
DB_TYPE=mysql

# MySQL 配置
MYSQL_HOST=cdb-21524894-89b5-412b-b520-510dfa4e32f8-0
MYSQL_PORT=20120
MYSQL_USER=root
MYSQL_PASSWORD=你的MySQL密码
MYSQL_DATABASE=cgm_butler
MYSQL_CHARSET=utf8mb4

# ============================================================
# API Keys (保持原有配置)
# ============================================================
OPENAI_API_KEY=你的OpenAI_API_Key
TAVUS_API_KEY=你的Tavus_API_Key
RETELL_API_KEY=你的Retell_API_Key
TAVUS_PERSONA_ID=你的Persona_ID
TAVUS_REPLICA_ID=你的Replica_ID
INTAKE_AGENT_ID=agent_c7d1cb2c279ec45bce38c95067
INTAKE_LLM_ID=llm_e54c307ce74090cdfd06f682523b

# ============================================================
# 服务配置
# ============================================================
FLASK_ENV=production
FLASK_DEBUG=False
FLASK_PORT=5000
MINERVA_PORT=8000
CGM_BACKEND_URL=http://localhost:5000
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
LOG_LEVEL=INFO
LOG_FILE=./storage/logs/app.log
EOF
```

**重要：** 请替换以下值：
- `你的MySQL密码` - 你的MySQL root密码
- `你的OpenAI_API_Key` - 从现有配置复制
- `你的Tavus_API_Key` - 从现有配置复制
- `你的Retell_API_Key` - 从现有配置复制
- 其他API keys 和 IDs

### 步骤 3: 测试 MySQL 连接

```bash
cd /Users/yijialiu/Desktop/my-glucose-pal
python shared/database/mysql_connection.py
```

**预期输出：**
```
================================================================================
测试MySQL连接
================================================================================
Host: cdb-21524894-89b5-412b-b520-510dfa4e32f8-0
Port: 20120
User: root
Database: cgm_butler
================================================================================
✅ MySQL连接成功!
   服务器版本: {'VERSION()': '8.0.22-txsql'}
```

如果看到错误，请检查：
- MySQL密码是否正确
- 网络连接是否正常
- MySQL服务是否运行

### 步骤 4: 创建 MySQL 数据库

首先需要在MySQL中创建数据库：

**方法 A: 使用 MySQL 客户端**
```bash
mysql -h cdb-21524894-89b5-412b-b520-510dfa4e32f8-0 -P 20120 -u root -p

# 在MySQL命令行中执行：
CREATE DATABASE IF NOT EXISTS cgm_butler 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

USE cgm_butler;
SHOW TABLES;

EXIT;
```

**方法 B: 使用Python脚本**
```python
import pymysql

conn = pymysql.connect(
    host='cdb-21524894-89b5-412b-b520-510dfa4e32f8-0',
    port=20120,
    user='root',
    password='你的密码'
)

cursor = conn.cursor()
cursor.execute("CREATE DATABASE IF NOT EXISTS cgm_butler CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
conn.commit()
conn.close()

print("✅ 数据库创建成功!")
```

### 步骤 5: 创建 MySQL 表结构

```bash
cd /Users/yijialiu/Desktop/my-glucose-pal
python shared/database/mysql_schema.py
```

**预期输出：**
```
测试MySQL schema 定义...
正在创建MySQL数据库表...
  ✓ users
  ✓ cgm_readings
  ✓ cgm_pattern_actions
  ✓ activity_logs
  ✓ conversations
  ✓ conversation_analysis
  ✓ user_memories
  ✓ user_long_term_memory
  ✓ user_todos
  ✓ user_onboarding_status

✅ MySQL数据库 schema 创建完成!

MySQL数据库中的所有表:
  - activity_logs
  - cgm_pattern_actions
  - cgm_readings
  - conversation_analysis
  - conversations
  - user_long_term_memory
  - user_memories
  - user_onboarding_status
  - user_todos
  - users

总共 10 张表
```

### 步骤 6: 迁移数据（从 SQLite 到 MySQL）

⚠️ **重要：此步骤将把现有的SQLite数据迁移到MySQL**

```bash
cd /Users/yijialiu/Desktop/my-glucose-pal
python scripts/migrate_sqlite_to_mysql.py
```

**交互式过程：**
```
================================================================================
SQLite 到 MySQL 数据迁移
================================================================================

数据库配置:
  SQLite: /Users/yijialiu/Desktop/my-glucose-pal/storage/databases/cgm_butler.db
  MySQL:  cdb-21524894-89b5-412b-b520-510dfa4e32f8-0:20120/cgm_butler
================================================================================

⚠️  注意：此操作将清空MySQL数据库并迁移SQLite数据。是否继续? (yes/no): yes

连接数据库...
  ✓ SQLite连接成功
  ✓ MySQL连接成功

创建MySQL表结构...
... (表创建输出)

================================================================================
开始迁移数据
================================================================================

迁移表: users
  ✓ 成功迁移 2/2 条记录

迁移表: cgm_readings
  ✓ 成功迁移 X/X 条记录

... (更多表的迁移)

================================================================================
验证迁移结果
================================================================================
  ✓ users                          SQLite:     2 | MySQL:     2
  ✓ cgm_readings                   SQLite:   XXX | MySQL:   XXX
  ✓ conversations                  SQLite:     X | MySQL:     X
  ... (更多表)

================================================================================
✅ 迁移完成! 共迁移 XXXX 条记录
================================================================================
```

### 步骤 7: 验证迁移结果

**检查用户数据：**
```bash
mysql -h cdb-21524894-89b5-412b-b520-510dfa4e32f8-0 -P 20120 -u root -p cgm_butler

# 在MySQL中执行：
SELECT user_id, name, email FROM users;
SELECT COUNT(*) FROM cgm_readings;
SELECT COUNT(*) FROM conversations;
```

### 步骤 8: 更新应用以使用 MySQL

现在你的应用已经配置为使用MySQL，启动服务：

```bash
cd /Users/yijialiu/Desktop/my-glucose-pal
./start-all.sh
```

---

## 🔧 故障排除

### 问题 1: 连接失败

**错误：** `pymysql.err.OperationalError: (2003, "Can't connect to MySQL server")`

**解决方案：**
- 检查MySQL host和port是否正确
- 检查网络连接
- 确认MySQL服务正在运行

### 问题 2: 认证失败

**错误：** `pymysql.err.OperationalError: (1045, "Access denied for user 'root'@'...')`

**解决方案：**
- 检查用户名和密码是否正确
- 确认MySQL用户有远程连接权限

### 问题 3: 数据库不存在

**错误：** `pymysql.err.OperationalError: (1049, "Unknown database 'cgm_butler'")`

**解决方案：**
```sql
CREATE DATABASE cgm_butler CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 问题 4: 字符集问题

**解决方案：**
```sql
ALTER DATABASE cgm_butler CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## 📊 性能优化建议

### 1. 为用户添加邮箱字段（为即将实现的认证系统做准备）

```sql
ALTER TABLE users ADD COLUMN email VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
```

### 2. 添加索引以提高查询性能

数据库schema已经包含了必要的索引，如果需要额外的索引：

```sql
-- 对话查询优化
CREATE INDEX idx_conv_user_started ON conversations(user_id, started_at DESC);

-- CGM数据查询优化  
CREATE INDEX idx_cgm_user_time ON cgm_readings(user_id, timestamp DESC);

-- TODO查询优化
CREATE INDEX idx_todo_user_status ON user_todos(user_id, status);
```

### 3. 定期备份

```bash
# 创建备份
mysqldump -h cdb-21524894-89b5-412b-b520-510dfa4e32f8-0 -P 20120 -u root -p \
  cgm_butler > backup_$(date +%Y%m%d_%H%M%S).sql

# 恢复备份
mysql -h cdb-21524894-89b5-412b-b520-510dfa4e32f8-0 -P 20120 -u root -p \
  cgm_butler < backup_20251118_120000.sql
```

---

## 🎯 下一步

数据库迁移完成后，建议实施以下改进：

1. ✅ **实现用户认证系统**
   - 用户注册/登录
   - JWT token认证
   - 密码加密存储

2. ✅ **实现API安全**
   - 所有API添加认证中间件
   - 输入验证
   - 速率限制

3. ✅ **设置监控**
   - 数据库连接池监控
   - 慢查询日志
   - 错误日志收集

4. ✅ **配置生产环境**
   - HTTPS配置
   - 反向代理（Nginx）
   - 进程管理（Supervisor/systemd）

---

## ❓ 常见问题

### Q: SQLite数据库还会使用吗？
A: 迁移完成后，应用将使用MySQL。SQLite数据库文件可以保留作为备份，但不会再被使用。

### Q: 可以同时支持SQLite和MySQL吗？
A: 是的，通过设置环境变量 `DB_TYPE=sqlite` 或 `DB_TYPE=mysql` 来切换。

### Q: 迁移会影响正在运行的服务吗？
A: 迁移过程不会影响SQLite数据库，但建议在服务停止时进行迁移。

### Q: 如何回滚到SQLite？
A: 修改 `.env` 文件，设置 `DB_TYPE=sqlite`，然后重启服务。

---

## 📞 需要帮助？

如果遇到问题，请检查：
1. 日志文件：`logs/minerva.log` 和 `logs/flask.log`
2. 数据库连接配置是否正确
3. MySQL服务是否可访问

祝你迁移顺利！🎉



