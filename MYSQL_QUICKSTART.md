# MySQL 快速开始指南 🚀

## 📝 你的MySQL信息

```
Host: cdb-21524894-89b5-412b-b520-510dfa4e32f8-0
Port: 20120
Version: 8.0.22-txsql
```

---

## ⚡ 快速开始（3步）

### 第1步：安装依赖

```bash
cd /Users/yijialiu/Desktop/my-glucose-pal
pip install pymysql cryptography
```

### 第2步：配置环境变量

在项目根目录创建或修改 `.env` 文件，添加MySQL配置：

```bash
# 数据库类型
DB_TYPE=mysql

# MySQL配置
MYSQL_HOST=cdb-21524894-89b5-412b-b520-510dfa4e32f8-0
MYSQL_PORT=20120
MYSQL_USER=root
MYSQL_PASSWORD=你的MySQL密码
MYSQL_DATABASE=cgm_butler
MYSQL_CHARSET=utf8mb4

# 保留其他现有配置（API keys等）
# ...
```

### 第3步：测试连接

```bash
python scripts/test_mysql_connection.py
```

如果看到 `✅ MySQL连接测试成功!`，恭喜！可以继续下一步。

---

## 📦 完整迁移步骤

### 1. 创建MySQL数据库

**方法A：使用MySQL命令行**
```bash
mysql -h cdb-21524894-89b5-412b-b520-510dfa4e32f8-0 -P 20120 -u root -p

# 输入密码后，执行：
CREATE DATABASE cgm_butler CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

**方法B：使用Python脚本**
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
```

### 2. 创建表结构

```bash
python shared/database/mysql_schema.py
```

**预期输出：**
```
✅ MySQL数据库 schema 创建完成!
总共 10 张表
```

### 3. 迁移数据（可选）

如果你有现有的SQLite数据需要迁移：

```bash
python scripts/migrate_sqlite_to_mysql.py
```

按提示输入 `yes` 确认迁移。

### 4. 启动应用

```bash
./start-all.sh
```

---

## 🔧 常用命令

### 测试MySQL连接
```bash
python scripts/test_mysql_connection.py
```

### 查看数据库状态
```bash
mysql -h cdb-21524894-89b5-412b-b520-510dfa4e32f8-0 -P 20120 -u root -p cgm_butler -e "SHOW TABLES;"
```

### 查看表数据
```bash
mysql -h cdb-21524894-89b5-412b-b520-510dfa4e32f8-0 -P 20120 -u root -p cgm_butler

# 然后执行SQL：
SELECT * FROM users;
SELECT COUNT(*) FROM conversations;
```

### 备份数据库
```bash
mysqldump -h cdb-21524894-89b5-412b-b520-510dfa4e32f8-0 -P 20120 -u root -p \
  cgm_butler > backup_$(date +%Y%m%d).sql
```

---

## ❓ 故障排除

### 问题1：连接失败
```
❌ Can't connect to MySQL server
```
**解决：**
- 检查网络连接
- 确认MySQL服务运行中
- 验证host和port是否正确

### 问题2：认证失败
```
❌ Access denied for user 'root'
```
**解决：**
- 检查用户名和密码
- 确认用户有远程连接权限

### 问题3：数据库不存在
```
❌ Unknown database 'cgm_butler'
```
**解决：**
```sql
CREATE DATABASE cgm_butler CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 问题4：缺少依赖
```
❌ No module named 'pymysql'
```
**解决：**
```bash
pip install pymysql cryptography
```

---

## 📊 数据库Schema

应用将创建以下10张表：

| 表名 | 说明 |
|------|------|
| `users` | 用户信息 |
| `cgm_readings` | CGM血糖读数 |
| `cgm_pattern_actions` | CGM模式和建议 |
| `activity_logs` | 用户活动日志 |
| `conversations` | 对话记录 |
| `conversation_analysis` | 对话分析 |
| `user_memories` | 短期记忆 |
| `user_long_term_memory` | 长期记忆 |
| `user_todos` | 待办事项 |
| `user_onboarding_status` | 用户引导状态 |

---

## 🔐 安全建议

1. **不要在代码中硬编码密码**
   - 始终使用 `.env` 文件
   - 确保 `.env` 在 `.gitignore` 中

2. **使用强密码**
   - MySQL密码应该足够复杂
   - 定期更换密码

3. **限制数据库访问**
   - 只允许必要的IP访问
   - 使用防火墙规则

4. **定期备份**
   - 设置自动备份任务
   - 测试备份恢复流程

---

## 📚 详细文档

查看完整的迁移指南：
```bash
cat docs/deployment/MYSQL_MIGRATION_GUIDE.md
```

---

## ✅ 检查清单

迁移完成后，请确认：

- [ ] 能够成功连接MySQL
- [ ] 10张表全部创建成功
- [ ] 数据已成功迁移（如有）
- [ ] 应用可以正常启动
- [ ] 可以正常读写数据
- [ ] 日志中没有数据库错误

---

## 🎉 完成！

MySQL数据库配置完成后，你就可以：
- ✅ 支持多用户并发访问
- ✅ 更好的数据完整性
- ✅ 更强大的查询能力
- ✅ 为生产环境做好准备

下一步建议实现用户认证系统！💪



