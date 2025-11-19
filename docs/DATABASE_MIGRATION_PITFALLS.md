# Database Migration Pitfalls & Solutions

## 🚨 Common Mistake: Writing to SQLite When Using MySQL

### The Problem

After migrating from SQLite to MySQL, there are **legacy SQLite files and functions** that can mislead developers into writing data to the wrong database.

### Real Example

**Incorrect approach** (what happened):
```python
# ❌ WRONG: This writes to SQLite, not MySQL
import sqlite3
from pathlib import Path

DB_PATH = Path('storage/databases/cgm_butler.db').resolve()
conn = sqlite3.connect(str(DB_PATH))
# ... insert data ...
```

**Result**: Data is written to the old SQLite file, but the application reads from MySQL. The frontend shows no new data because it's querying the wrong database.

### Why This Happens

1. **Legacy files still exist**:
   - `storage/databases/cgm_butler.db` (SQLite file)
   - This file is no longer used when `DB_TYPE=mysql`

2. **Misleading functions**:
   - `get_db_path()` in `shared/database/connection.py`
   - This function returns SQLite path, but shouldn't be used in MySQL mode

3. **No clear warnings**:
   - Code doesn't explicitly warn against using SQLite functions
   - Easy to assume SQLite is still active

## ✅ Correct Approach

### Always Use the Abstraction Layer

```python
# ✅ CORRECT: Use the database abstraction layer
from shared.database.connection import get_connection

# This automatically uses MySQL when DB_TYPE=mysql
conn = get_connection()
cursor = conn.cursor()

# Insert data (works for both SQLite and MySQL)
cursor.execute("""
    INSERT INTO conversations (
        conversation_id,
        user_id,
        ...
    ) VALUES (%s, %s, ...)  # MySQL uses %s
""", (conversation_id, user_id, ...))

conn.commit()
conn.close()
```

### Or Use Repository Pattern

```python
# ✅ EVEN BETTER: Use repositories
from shared.database.repositories.conversation_repository import ConversationRepository

ConversationRepository.create({
    'conversation_id': conversation_id,
    'user_id': user_id,
    ...
})
```

## 🔍 How to Check Current Database Type

### Method 1: Check .env file
```bash
grep "^DB_TYPE=" .env
# Output: DB_TYPE=mysql
```

### Method 2: Check in Python
```python
from config.settings import settings
print(f"Current DB: {settings.DB_TYPE}")
```

### Method 3: Check active connections
```bash
# For MySQL
lsof -i :28494  # Your MySQL port

# For SQLite (should be empty if using MySQL)
lsof storage/databases/cgm_butler.db
```

## 📋 Migration Checklist

When working with the database after migration:

- [ ] Check `DB_TYPE` in `.env` file
- [ ] Use `get_connection()` or repositories, NOT direct SQLite access
- [ ] Test data insertion by querying the MySQL database
- [ ] Verify frontend displays the new data
- [ ] If using raw SQL, use `%s` placeholders (MySQL) not `?` (SQLite)

## 🛠️ Code Improvements Made

### 1. Added warnings to `connection.py`

```python
"""
⚠️ IMPORTANT: Database Type Selection
- The active database type is controlled by DB_TYPE in .env file
- DB_TYPE=sqlite: Uses SQLite (storage/databases/cgm_butler.db)
- DB_TYPE=mysql: Uses MySQL (connection details from .env)

🔧 Usage:
- ALWAYS use get_connection() or get_db_session() for database access
- DO NOT directly access SQLite files when DB_TYPE=mysql
- The get_db_path() function is ONLY for SQLite mode
"""
```

### 2. Updated `get_db_path()` docstring

```python
def get_db_path(db_name: str = 'cgm_butler.db') -> str:
    """
    ⚠️ WARNING: This function is ONLY for SQLite mode.
    If DB_TYPE=mysql in .env, this function should NOT be used.
    Use get_connection() instead, which handles both SQLite and MySQL.
    """
```

## 🎯 Key Takeaways

1. **Never assume the database type** - always check `DB_TYPE` in `.env`
2. **Use abstraction layers** - `get_connection()` or repositories
3. **SQLite files may exist but be inactive** - don't be misled by their presence
4. **Test data insertion** - verify data appears in the correct database
5. **Use correct SQL placeholders** - `%s` for MySQL, `?` for SQLite

## 📚 Related Documentation

- [MySQL Migration Guide](./deployment/MYSQL_MIGRATION_GUIDE.md)
- [Database Architecture](./architecture/database.md)
- [Configuration Guide](../CONFIGURATION_GUIDE.md)

---

**Last Updated**: 2025-11-19  
**Issue**: Data written to SQLite instead of MySQL after migration  
**Resolution**: Use `get_connection()` abstraction layer, added warnings to code


