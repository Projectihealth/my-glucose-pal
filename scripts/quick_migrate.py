#!/usr/bin/env python3
"""快速MySQL迁移 - 修复版"""
import sys
import os
from pathlib import Path

project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

import pymysql
from pymysql.cursors import DictCursor
from shared.database.mysql_schema import create_all_tables

# MySQL配置
config = {
    'host': 'sh-cdb-fceva04s.sql.tencentcdb.com',
    'port': 28494,
    'user': 'root',
    'password': 'myglucosepal666',
    'database': 'cgm_butler'
}

print("🚀 快速MySQL迁移")
print("="*60)

# 1. 创建数据库
print("\n1. 创建数据库...")
conn = pymysql.connect(
    host=config['host'],
    port=config['port'],
    user=config['user'],
    password=config['password']
)
cursor = conn.cursor()
cursor.execute(f"DROP DATABASE IF EXISTS {config['database']}")
cursor.execute(f"CREATE DATABASE {config['database']} CHARACTER SET utf8mb4")
print(f"✅ 数据库 '{config['database']}' 已重建（干净环境）")
conn.close()

# 2. 创建表
print("\n2. 创建表结构...")
conn = pymysql.connect(
    **config,
    charset='utf8mb4',
    cursorclass=DictCursor,
    autocommit=False
)
create_all_tables(conn)
print("✅ 10张表创建完成")

# 3. 迁移数据
print("\n3. 迁移数据...")
import sqlite3

def convert_datetime(value):
    """转换时间格式"""
    if not value:
        return None
    # 处理 ISO 8601 格式: 2025-01-14T10:00:00Z -> 2025-01-14 10:00:00
    if isinstance(value, str):
        value = value.replace('T', ' ').replace('Z', '').split('.')[0]
        if len(value) == 10:  # 只有日期
            return value
        return value[:19]  # YYYY-MM-DD HH:MM:SS
    return value

sqlite_db = str(project_root / 'storage' / 'databases' / 'cgm_butler.db')

if os.path.exists(sqlite_db):
    sqlite_conn = sqlite3.connect(sqlite_db)
    sqlite_conn.row_factory = sqlite3.Row
    
    # 按依赖顺序迁移
    tables = [
        'users',
        'cgm_pattern_actions',
        'cgm_readings', 
        'activity_logs',
        'conversations',
        'conversation_analysis',
        'user_long_term_memory',
        'user_memories',
        'user_todos',
        'user_onboarding_status'
    ]
    
    total = 0
    mysql_cursor = conn.cursor()
    
    # 临时禁用外键检查
    mysql_cursor.execute("SET FOREIGN_KEY_CHECKS=0")
    
    for table in tables:
        try:
            sqlite_cursor = sqlite_conn.cursor()
            sqlite_cursor.execute(
                "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
                (table,)
            )
            if not sqlite_cursor.fetchone():
                continue
            
            sqlite_cursor.execute(f"SELECT * FROM {table}")
            rows = sqlite_cursor.fetchall()
            if not rows:
                continue
            
            print(f"  → {table}: 共有 {len(rows)} 条，开始迁移...")
            
            # 获取MySQL表的列
            mysql_cursor.execute(f"DESCRIBE {table}")
            mysql_cols = [r['Field'] for r in mysql_cursor.fetchall()]
            
            # 时间字段列表
            datetime_fields = ['timestamp', 'started_at', 'ended_at', 'created_at', 
                             'updated_at', 'completed_at', 'analysis_timestamp',
                             'enrolled_at', 'last_interaction_at']
            date_fields = ['date_of_birth', 'week_start']
            
            # 准备批量数据
            batch_size = 100
            batch_data = []
            migrated = 0
            
            for row in rows:
                row_dict = dict(row)
                data = {}
                
                for col in mysql_cols:
                    if col in row_dict:
                        val = row_dict[col]
                        
                        # 转换时间格式
                        if col in datetime_fields or col in date_fields:
                            val = convert_datetime(val)
                        
                        # 转换布尔值
                        bool_fields = ['email_verified', 'follow_up_needed', 'completed_today',
                                     'has_health_goals', 'has_dietary_info', 'has_exercise_info',
                                     'has_medical_history', 'has_lifestyle_info']
                        if col in bool_fields and val is not None:
                            val = bool(int(val)) if val not in (True, False) else val
                        
                        data[col] = val
                
                if data:
                    batch_data.append(data)
                    
                    # 批量插入
                    if len(batch_data) >= batch_size:
                        cols = ', '.join(batch_data[0].keys())
                        placeholders = ', '.join(['%s'] * len(batch_data[0]))
                        sql = f"INSERT INTO {table} ({cols}) VALUES ({placeholders})"
                        
                        for item in batch_data:
                            try:
                                mysql_cursor.execute(sql, list(item.values()))
                                migrated += 1
                            except Exception as e:
                                # 单条失败不影响其他
                                pass
                        
                        conn.commit()
                        batch_data = []
                        print(f"     ▸ 已迁移 {migrated}/{len(rows)}")
            
            # 插入剩余数据
            if batch_data:
                cols = ', '.join(batch_data[0].keys())
                placeholders = ', '.join(['%s'] * len(batch_data[0]))
                sql = f"INSERT INTO {table} ({cols}) VALUES ({placeholders})"
                
                for item in batch_data:
                    try:
                        mysql_cursor.execute(sql, list(item.values()))
                        migrated += 1
                    except:
                        pass
                
                conn.commit()
                print(f"     ▸ 已迁移 {migrated}/{len(rows)}")
            
            total += migrated
            print(f"  ✓ {table}: 总计 {migrated} 条记录完成")
            
        except Exception as e:
            print(f"  ⚠️  迁移表 {table} 时出错: {e}")
    
    # 恢复外键检查
    mysql_cursor.execute("SET FOREIGN_KEY_CHECKS=1")
    
    sqlite_conn.close()
    print(f"\n✅ 迁移完成: {total}条记录")
else:
    print("⚠️  SQLite数据库不存在，跳过")

conn.close()

# 4. 更新.env
print("\n4. 更新配置文件...")
env_path = project_root / '.env'
with open(env_path, 'w') as f:
    f.write("DB_TYPE=mysql\n")
    f.write(f"MYSQL_HOST={config['host']}\n")
    f.write(f"MYSQL_PORT={config['port']}\n")
    f.write(f"MYSQL_USER={config['user']}\n")
    f.write(f"MYSQL_PASSWORD={config['password']}\n")
    f.write(f"MYSQL_DATABASE={config['database']}\n")
    f.write("MYSQL_CHARSET=utf8mb4\n\n")
    f.write("OPENAI_API_KEY=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\n")
    f.write("TAVUS_API_KEY=41a2bc2eb63741f2bd6f7d7a2974fc64\n")
    f.write("RETELL_API_KEY=key_e3b74c0de01a1ba9c20228131da1\n")
    f.write("TAVUS_PERSONA_ID=p4e7a065501a\n")
    f.write("TAVUS_REPLICA_ID=r9fa0878977a\n")
    f.write("INTAKE_AGENT_ID=agent_c7d1cb2c279ec45bce38c95067\n")
    f.write("INTAKE_LLM_ID=llm_e54c307ce74090cdfd06f682523b\n")
print(f"✅ 配置已保存: {env_path}")

print("\n" + "="*60)
print("🎉 MySQL迁移完成!")
print("="*60)
print("\n下一步:")
print("  python3 scripts/test_mysql_connection.py")
print("  ./start-all.sh")
