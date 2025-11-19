#!/usr/bin/env python3
"""
自动化MySQL迁移脚本
一键完成从SQLite到MySQL的完整迁移
"""

import sys
import os
from pathlib import Path
import getpass

# 添加项目根目录到路径
project_root = Path(__file__).parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))


def print_header(title):
    """打印标题"""
    print("\n" + "=" * 80)
    print(f" {title}")
    print("=" * 80 + "\n")


def print_step(step_num, title):
    """打印步骤"""
    print(f"\n{'='*80}")
    print(f"步骤 {step_num}: {title}")
    print("=" * 80)


def check_dependencies():
    """检查并安装依赖"""
    print_step(1, "检查依赖")
    
    try:
        import pymysql
        print("✅ pymysql 已安装")
    except ImportError:
        print("⚠️  pymysql 未安装，正在安装...")
        os.system("pip install pymysql")
    
    try:
        import cryptography
        print("✅ cryptography 已安装")
    except ImportError:
        print("⚠️  cryptography 未安装，正在安装...")
        os.system("pip install cryptography")
    
    # 重新导入以确保安装成功
    try:
        import pymysql
        import cryptography
        print("\n✅ 所有依赖已就绪")
        return True
    except ImportError as e:
        print(f"\n❌ 依赖安装失败: {e}")
        return False


def get_mysql_config():
    """获取MySQL配置"""
    print_step(2, "配置MySQL连接")
    
    print("请输入MySQL配置信息（按回车使用默认值）:\n")
    
    config = {
        'host': input("MySQL Host [cdb-21524894-89b5-412b-b520-510dfa4e32f8-0]: ").strip() 
                or 'cdb-21524894-89b5-412b-b520-510dfa4e32f8-0',
        'port': input("MySQL Port [20120]: ").strip() or '20120',
        'user': input("MySQL User [root]: ").strip() or 'root',
        'password': getpass.getpass("MySQL Password: "),
        'database': input("Database Name [cgm_butler]: ").strip() or 'cgm_butler',
    }
    
    config['port'] = int(config['port'])
    
    return config


def test_mysql_connection(config):
    """测试MySQL连接"""
    print_step(3, "测试MySQL连接")
    
    try:
        import pymysql
        
        # 先不指定数据库，测试基本连接
        conn = pymysql.connect(
            host=config['host'],
            port=config['port'],
            user=config['user'],
            password=config['password']
        )
        
        print(f"✅ 成功连接到MySQL服务器!")
        
        cursor = conn.cursor()
        cursor.execute("SELECT VERSION()")
        version = cursor.fetchone()
        print(f"   MySQL版本: {version[0]}")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ MySQL连接失败: {e}")
        print("\n请检查:")
        print("  - MySQL服务是否运行")
        print("  - 用户名和密码是否正确")
        print("  - 网络连接是否正常")
        return False


def create_database(config):
    """创建数据库"""
    print_step(4, "创建MySQL数据库")
    
    try:
        import pymysql
        
        conn = pymysql.connect(
            host=config['host'],
            port=config['port'],
            user=config['user'],
            password=config['password']
        )
        
        cursor = conn.cursor()
        
        # 检查数据库是否已存在
        cursor.execute(f"SHOW DATABASES LIKE '{config['database']}'")
        exists = cursor.fetchone()
        
        if exists:
            print(f"⚠️  数据库 '{config['database']}' 已存在")
            overwrite = input("是否清空并重建? (yes/no): ").strip().lower()
            
            if overwrite == 'yes':
                cursor.execute(f"DROP DATABASE {config['database']}")
                print(f"   已删除旧数据库")
            else:
                print(f"   将使用现有数据库")
                conn.close()
                return True
        
        # 创建数据库
        cursor.execute(f"""
            CREATE DATABASE IF NOT EXISTS {config['database']} 
            CHARACTER SET utf8mb4 
            COLLATE utf8mb4_unicode_ci
        """)
        
        print(f"✅ 数据库 '{config['database']}' 创建成功!")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ 创建数据库失败: {e}")
        return False


def update_env_file(config):
    """更新.env文件"""
    print_step(5, "更新环境配置")
    
    env_path = project_root / '.env'
    
    # 读取现有的.env文件（如果存在）
    existing_env = {}
    if env_path.exists():
        print("📄 读取现有.env文件...")
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    existing_env[key.strip()] = value.strip()
    
    # 更新MySQL配置
    existing_env['DB_TYPE'] = 'mysql'
    existing_env['MYSQL_HOST'] = config['host']
    existing_env['MYSQL_PORT'] = str(config['port'])
    existing_env['MYSQL_USER'] = config['user']
    existing_env['MYSQL_PASSWORD'] = config['password']
    existing_env['MYSQL_DATABASE'] = config['database']
    existing_env['MYSQL_CHARSET'] = 'utf8mb4'
    
    # 写入.env文件
    with open(env_path, 'w', encoding='utf-8') as f:
        f.write("# ============================================================\n")
        f.write("# CGM Butler - 环境配置\n")
        f.write("# ============================================================\n\n")
        
        f.write("# 数据库配置\n")
        f.write(f"DB_TYPE={existing_env.get('DB_TYPE', 'mysql')}\n")
        f.write(f"MYSQL_HOST={existing_env.get('MYSQL_HOST', '')}\n")
        f.write(f"MYSQL_PORT={existing_env.get('MYSQL_PORT', '3306')}\n")
        f.write(f"MYSQL_USER={existing_env.get('MYSQL_USER', 'root')}\n")
        f.write(f"MYSQL_PASSWORD={existing_env.get('MYSQL_PASSWORD', '')}\n")
        f.write(f"MYSQL_DATABASE={existing_env.get('MYSQL_DATABASE', 'cgm_butler')}\n")
        f.write(f"MYSQL_CHARSET={existing_env.get('MYSQL_CHARSET', 'utf8mb4')}\n\n")
        
        f.write("# API配置\n")
        for key in ['OPENAI_API_KEY', 'OPENAI_MODEL', 'TAVUS_API_KEY', 'TAVUS_PERSONA_ID', 
                   'TAVUS_REPLICA_ID', 'RETELL_API_KEY', 'INTAKE_AGENT_ID', 'INTAKE_LLM_ID']:
            if key in existing_env:
                f.write(f"{key}={existing_env[key]}\n")
        
        f.write("\n# 服务配置\n")
        for key in ['FLASK_ENV', 'FLASK_DEBUG', 'FLASK_PORT', 'MINERVA_PORT', 
                   'CGM_BACKEND_URL', 'CORS_ORIGINS', 'LOG_LEVEL', 'LOG_FILE']:
            if key in existing_env:
                f.write(f"{key}={existing_env[key]}\n")
    
    print(f"✅ 环境配置已更新: {env_path}")
    return True


def create_tables(config):
    """创建表结构"""
    print_step(6, "创建MySQL表结构")
    
    try:
        import pymysql
        from shared.database.mysql_schema import create_all_tables
        
        conn = pymysql.connect(
            host=config['host'],
            port=config['port'],
            user=config['user'],
            password=config['password'],
            database=config['database'],
            charset='utf8mb4'
        )
        
        create_all_tables(conn)
        
        # 列出创建的表
        cursor = conn.cursor()
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        
        print(f"\n✅ 成功创建 {len(tables)} 张表:")
        for table in tables:
            print(f"   - {list(table.values())[0]}")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ 创建表失败: {e}")
        import traceback
        traceback.print_exc()
        return False


def migrate_data(config):
    """迁移数据"""
    print_step(7, "迁移SQLite数据到MySQL")
    
    # 检查SQLite数据库是否存在
    from config.settings import settings
    sqlite_db = settings.DB_PATH
    
    if not os.path.exists(sqlite_db):
        print(f"⚠️  SQLite数据库不存在: {sqlite_db}")
        print("   跳过数据迁移")
        return True
    
    print(f"📊 SQLite数据库: {sqlite_db}")
    
    migrate = input("\n是否迁移SQLite数据到MySQL? (yes/no): ").strip().lower()
    
    if migrate != 'yes':
        print("   跳过数据迁移")
        return True
    
    try:
        import sqlite3
        import pymysql
        
        # 连接SQLite
        sqlite_conn = sqlite3.connect(sqlite_db)
        sqlite_conn.row_factory = sqlite3.Row
        
        # 连接MySQL
        mysql_conn = pymysql.connect(
            host=config['host'],
            port=config['port'],
            user=config['user'],
            password=config['password'],
            database=config['database'],
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        
        # 要迁移的表
        tables_to_migrate = [
            'users', 'cgm_readings', 'cgm_pattern_actions', 'activity_logs',
            'conversations', 'conversation_analysis', 'user_memories',
            'user_long_term_memory', 'user_todos', 'user_onboarding_status'
        ]
        
        total_migrated = 0
        
        for table_name in tables_to_migrate:
            # 检查表是否存在
            sqlite_cursor = sqlite_conn.cursor()
            sqlite_cursor.execute(
                "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
                (table_name,)
            )
            
            if not sqlite_cursor.fetchone():
                continue
            
            # 获取数据
            sqlite_cursor.execute(f"SELECT * FROM {table_name}")
            rows = sqlite_cursor.fetchall()
            
            if not rows:
                continue
            
            print(f"\n迁移表: {table_name} ({len(rows)} 条记录)")
            
            # 获取MySQL表的列
            mysql_cursor = mysql_conn.cursor()
            mysql_cursor.execute(f"DESCRIBE {table_name}")
            mysql_columns = [row['Field'] for row in mysql_cursor.fetchall()]
            
            # 插入数据
            migrated = 0
            for row in rows:
                try:
                    row_dict = dict(row)
                    
                    # 过滤列并转换值
                    filtered_data = {}
                    for col in mysql_columns:
                        if col in row_dict:
                            value = row_dict[col]
                            
                            # 转换布尔值
                            boolean_fields = [
                                'email_verified', 'follow_up_needed', 'completed_today',
                                'has_health_goals', 'has_dietary_info', 'has_exercise_info',
                                'has_medical_history', 'has_lifestyle_info'
                            ]
                            if col in boolean_fields and value is not None:
                                value = bool(value)
                            
                            filtered_data[col] = value
                    
                    # 构建INSERT语句
                    columns = ', '.join(filtered_data.keys())
                    placeholders = ', '.join(['%s'] * len(filtered_data))
                    values = list(filtered_data.values())
                    
                    insert_sql = f"INSERT INTO {table_name} ({columns}) VALUES ({placeholders})"
                    mysql_cursor.execute(insert_sql, values)
                    migrated += 1
                    
                except Exception as e:
                    print(f"  ⚠️  跳过一条记录: {e}")
            
            mysql_conn.commit()
            total_migrated += migrated
            print(f"  ✓ 成功迁移 {migrated} 条记录")
        
        sqlite_conn.close()
        mysql_conn.close()
        
        print(f"\n✅ 数据迁移完成! 共迁移 {total_migrated} 条记录")
        return True
        
    except Exception as e:
        print(f"❌ 数据迁移失败: {e}")
        import traceback
        traceback.print_exc()
        return False


def verify_migration(config):
    """验证迁移结果"""
    print_step(8, "验证迁移结果")
    
    try:
        import pymysql
        
        conn = pymysql.connect(
            host=config['host'],
            port=config['port'],
            user=config['user'],
            password=config['password'],
            database=config['database'],
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        
        cursor = conn.cursor()
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        
        print(f"\n数据库 '{config['database']}' 中的表:\n")
        
        for table in tables:
            table_name = list(table.values())[0]
            cursor.execute(f"SELECT COUNT(*) as count FROM {table_name}")
            result = cursor.fetchone()
            count = result['count']
            print(f"  ✓ {table_name:30} {count:6} 条记录")
        
        conn.close()
        
        print("\n✅ 验证完成!")
        return True
        
    except Exception as e:
        print(f"❌ 验证失败: {e}")
        return False


def main():
    """主函数"""
    print_header("🚀 自动化MySQL迁移工具")
    
    print("本工具将帮助你完成以下操作:")
    print("  1. 检查并安装依赖")
    print("  2. 配置MySQL连接")
    print("  3. 测试MySQL连接")
    print("  4. 创建MySQL数据库")
    print("  5. 更新环境配置")
    print("  6. 创建表结构")
    print("  7. 迁移SQLite数据")
    print("  8. 验证迁移结果")
    
    proceed = input("\n是否继续? (yes/no): ").strip().lower()
    if proceed != 'yes':
        print("❌ 已取消")
        return
    
    # 步骤1: 检查依赖
    if not check_dependencies():
        print("\n❌ 依赖检查失败，无法继续")
        return
    
    # 步骤2: 获取MySQL配置
    config = get_mysql_config()
    
    # 步骤3: 测试连接
    if not test_mysql_connection(config):
        print("\n❌ MySQL连接失败，无法继续")
        return
    
    # 步骤4: 创建数据库
    if not create_database(config):
        print("\n❌ 创建数据库失败，无法继续")
        return
    
    # 步骤5: 更新.env文件
    if not update_env_file(config):
        print("\n❌ 更新配置失败，无法继续")
        return
    
    # 步骤6: 创建表结构
    if not create_tables(config):
        print("\n❌ 创建表失败，无法继续")
        return
    
    # 步骤7: 迁移数据
    if not migrate_data(config):
        print("\n❌ 数据迁移失败")
        print("   但表结构已创建，你可以稍后手动迁移数据")
    
    # 步骤8: 验证
    verify_migration(config)
    
    # 完成
    print_header("🎉 迁移完成!")
    
    print("✅ MySQL数据库已配置完成!")
    print(f"\n数据库信息:")
    print(f"  Host: {config['host']}")
    print(f"  Port: {config['port']}")
    print(f"  Database: {config['database']}")
    print(f"  User: {config['user']}")
    
    print(f"\n下一步:")
    print(f"  1. 测试应用: python scripts/test_mysql_connection.py")
    print(f"  2. 启动服务: ./start-all.sh")
    print(f"\n配置文件已保存到: {project_root / '.env'}")
    print("\n" + "=" * 80)


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ 用户中断")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ 发生错误: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)



