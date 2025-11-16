# Database Module

This directory contains the database access layer for the CGM Butler application.

## 📁 Structure

```
shared/database/
├── connection.py           # Database connection management
├── repositories/           # Repository pattern implementations
│   ├── base_repository.py
│   ├── conversation_repository.py
│   ├── memory_repository.py
│   ├── cgm_repository.py
│   └── user_repository.py
└── migrations/            # Database migration scripts
    ├── 001_*.py
    ├── 002_*.py
    └── 003_*.py
```

## 📚 Documentation

For detailed database documentation, please refer to:

- **[Database Architecture](../../docs/architecture/database.md)** - Complete database schema and usage guide
- **[Database Structure](../../docs/architecture/DATABASE_STRUCTURE.md)** - Visual representation and table relationships

## 🔧 Usage

### Get Database Connection

```python
from shared.database import get_connection, get_db_session

# Simple connection
conn = get_connection()

# Context manager (recommended)
with get_db_session() as conn:
    # Your database operations
    pass
```

### Use Repositories

```python
from shared.database import get_connection
from shared.database.repositories import ConversationRepository, MemoryRepository

conn = get_connection()
conversation_repo = ConversationRepository(conn)
memory_repo = MemoryRepository(conn)

# Save conversation
conversation_id = conversation_repo.save_gpt_conversation(...)
conn.commit()

# Get memories
memories = memory_repo.get_recent_memories(user_id, days=7)
```

## 🚀 Migrations

Run migrations:

```bash
python3 shared/database/migrations/001_*.py
python3 shared/database/migrations/002_*.py
python3 shared/database/migrations/003_*.py
```

## 📖 More Information

- [Project Documentation](../../docs/README.md)
- [Architecture Overview](../../docs/architecture/overview.md)
- [Development Setup](../../docs/development/setup.md)

