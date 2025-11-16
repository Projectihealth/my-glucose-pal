# Storage Directory

此目录用于存储运行时数据,不应提交到版本控制。

## 📁 目录结构

```
storage/
├── databases/           ← SQLite 数据库文件
│   └── cgm_butler.db   ← 主数据库
├── logs/               ← 应用日志
└── uploads/            ← 用户上传文件
```

## ⚙️ 配置

通过环境变量 `CGM_DB_PATH` 指定数据库路径:

```bash
export CGM_DB_PATH=/path/to/my-glucose-pal/storage/databases/cgm_butler.db
```

或在 `.env` 文件中:

```
CGM_DB_PATH=storage/databases/cgm_butler.db
```

## 🔒 安全说明

- `storage/` 目录已添加到 `.gitignore`
- 不要将数据库文件提交到版本控制
- 定期备份 `databases/` 目录

## 📝 备份建议

```bash
# 备份数据库
cp storage/databases/cgm_butler.db storage/databases/cgm_butler.db.backup.$(date +%Y%m%d)

# 或使用 SQLite 备份命令
sqlite3 storage/databases/cgm_butler.db ".backup storage/databases/cgm_butler.db.backup"
```

