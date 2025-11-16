"""
数据库迁移: 为 user_todos 表添加时间和健康好处字段

新增字段:
- health_benefit: 健康好处/影响（强化用户执行动力）
- time_of_day: 执行时间段（HH:MM-HH:MM 格式，用于前端排序）
- time_description: 时间描述（用户友好的描述，如"上班前"）

运行方式:
    python3 shared/database/migrations/003_add_todo_timing_fields.py
"""

import sqlite3
import os
import sys
from pathlib import Path

# 添加项目根目录到路径
project_root = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(project_root))

from config.settings import settings


def run_migration():
    """运行迁移"""
    db_path = settings.DB_PATH
    
    print(f"📁 数据库路径: {db_path}")
    
    if not os.path.exists(db_path):
        print(f"❌ 数据库文件不存在: {db_path}")
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("\n🔍 检查当前表结构...")
        cursor.execute("PRAGMA table_info(user_todos)")
        columns = [row[1] for row in cursor.fetchall()]
        print(f"   当前字段: {', '.join(columns)}")
        
        # 检查字段是否已存在
        fields_to_add = []
        if 'health_benefit' not in columns:
            fields_to_add.append('health_benefit')
        if 'time_of_day' not in columns:
            fields_to_add.append('time_of_day')
        if 'time_description' not in columns:
            fields_to_add.append('time_description')
        
        if not fields_to_add:
            print("\n✅ 所有字段已存在，无需迁移")
            return True
        
        print(f"\n📝 需要添加的字段: {', '.join(fields_to_add)}")
        
        # 添加新字段
        if 'health_benefit' in fields_to_add:
            print("\n➕ 添加字段: health_benefit (TEXT)")
            cursor.execute("""
                ALTER TABLE user_todos 
                ADD COLUMN health_benefit TEXT
            """)
            print("   ✅ health_benefit 添加成功")
        
        if 'time_of_day' in fields_to_add:
            print("\n➕ 添加字段: time_of_day (VARCHAR(50))")
            cursor.execute("""
                ALTER TABLE user_todos 
                ADD COLUMN time_of_day VARCHAR(50)
            """)
            print("   ✅ time_of_day 添加成功")
        
        if 'time_description' in fields_to_add:
            print("\n➕ 添加字段: time_description (TEXT)")
            cursor.execute("""
                ALTER TABLE user_todos 
                ADD COLUMN time_description TEXT
            """)
            print("   ✅ time_description 添加成功")
        
        # 提交更改
        conn.commit()
        
        # 验证新结构
        print("\n🔍 验证新表结构...")
        cursor.execute("PRAGMA table_info(user_todos)")
        new_columns = cursor.fetchall()
        
        print("\n📊 完整表结构:")
        for col in new_columns:
            col_id, name, type_, notnull, default, pk = col
            nullable = "NOT NULL" if notnull else "NULL"
            default_val = f"DEFAULT {default}" if default else ""
            pk_marker = "PRIMARY KEY" if pk else ""
            print(f"   {name:20s} {type_:15s} {nullable:10s} {default_val:20s} {pk_marker}")
        
        conn.close()
        
        print("\n" + "="*60)
        print("✅ 迁移成功完成!")
        print("="*60)
        
        return True
        
    except Exception as e:
        print(f"\n❌ 迁移失败: {e}")
        import traceback
        traceback.print_exc()
        return False


def rollback_migration():
    """回滚迁移（SQLite 不支持 DROP COLUMN，需要重建表）"""
    print("\n⚠️  SQLite 不支持 DROP COLUMN")
    print("   如需回滚，请手动重建表或从备份恢复")


if __name__ == '__main__':
    print("="*60)
    print("🚀 数据库迁移: 添加 TODO 时间和健康好处字段")
    print("="*60)
    
    if len(sys.argv) > 1 and sys.argv[1] == 'rollback':
        rollback_migration()
    else:
        success = run_migration()
        sys.exit(0 if success else 1)

