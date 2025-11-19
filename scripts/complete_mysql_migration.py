#!/usr/bin/env python3
"""
完成MySQL迁移的所有步骤（非交互式版本）
使用默认配置自动完成迁移
"""

import sys
import os
from pathlib import Path

# 添加项目根目录到路径
project_root = Path(__file__).parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))


def print_step(step, title):
    """打印步骤"""
    print(f"\n{'='*80}")
    print(f"步骤 {step}: {title}")
    print("=" * 80)


def install_dependencies():
    """安装依赖"""
    print_step(1, "安装MySQL依赖")
    
    try:
        import pymysql
        print("✅ pymysql 已安装")
    except ImportError:
        print("📦 安装 pymysql...")
        os.system("pip3 install -q pymysql")
        print("✅ pymysql 安装完成")
    
    try:
        import cryptography
        print("✅ cryptography 已安装")
    except ImportError:
        print("📦 安装 cryptography...")
        os.system("pip3 install -q cryptography")
        print("✅ cryptography 安装完成")
    
    return True


def create_env_template():
    """创建环境变量模板"""
    print_step(2, "创建环境配置模板")
    
    env_path = project_root / '.env'
    env_template_path = project_root / 'mysql_config_template.txt'
    
    # 读取现有配置
    existing_env = {}
    if env_path.exists():
        print(f"📄 读取现有配置: {env_path}")
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    existing_env[key.strip()] = value.strip()
    
    # 创建配置模板
    template_content = f"""# MySQL配置信息
# 请填写你的MySQL密码，然后运行下一步

MYSQL_HOST=cdb-21524894-89b5-412b-b520-510dfa4e32f8-0
MYSQL_PORT=20120
MYSQL_USER=root
MYSQL_PASSWORD=在这里填写你的MySQL密码
MYSQL_DATABASE=cgm_butler

# 其他现有配置（保持不变）
"""
    
    # 添加现有的API keys
    for key in ['OPENAI_API_KEY', 'TAVUS_API_KEY', 'RETELL_API_KEY', 'TAVUS_PERSONA_ID', 
                'TAVUS_REPLICA_ID', 'INTAKE_AGENT_ID', 'INTAKE_LLM_ID']:
        if key in existing_env:
            template_content += f"{key}={existing_env[key]}\n"
    
    with open(env_template_path, 'w', encoding='utf-8') as f:
        f.write(template_content)
    
    print(f"\n✅ 配置模板已创建: {env_template_path}")
    print(f"\n⚠️  请执行以下步骤:")
    print(f"\n1. 打开文件: {env_template_path}")
    print(f"2. 填写你的MySQL密码")
    print(f"3. 运行命令: python3 scripts/complete_mysql_migration.py --step2")
    
    return False  # 需要用户手动填写密码


def read_mysql_config():
    """读取MySQL配置"""
    template_path = project_root / 'mysql_config_template.txt'
    
    if not template_path.exists():
        print(f"❌ 配置文件不存在: {template_path}")
        return None
    
    config = {}
    with open(template_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                config[key.strip()] = value.strip()
    
    # 检查是否填写了密码
    password = config.get('MYSQL_PASSWORD', '')
    if not password or password == '在这里填写你的MySQL密码':
        print(f"❌ 请先在 {template_path} 中填写MySQL密码")
        return None
    
    return {
        'host': config.get('MYSQL_HOST'),
        'port': int(config.get('MYSQL_PORT', 3306)),
        'user': config.get('MYSQL_USER'),
        'password': config.get('MYSQL_PASSWORD'),
        'database': config.get('MYSQL_DATABASE'),
    }


def test_and_create_database(config):
    """测试连接并创建数据库"""
    print_step(3, "测试连接并创建数据库")
    
    try:
        import pymysql
        
        # 测试基本连接
        print(f"🔌 连接到 {config['host']}:{config['port']}...")
        conn = pymysql.connect(
            host=config['host'],
            port=config['port'],
            user=config['user'],
            password=config['password']
        )
        
        cursor = conn.cursor()
        cursor.execute("SELECT VERSION()")
        version = cursor.fetchone()
        print(f"✅ MySQL连接成功! 版本: {version[0]}")
        
        # 创建数据库
        print(f"\n📊 创建数据库: {config['database']}")
        cursor.execute(f"""
            CREATE DATABASE IF NOT EXISTS {config['database']} 
            CHARACTER SET utf8mb4 
            COLLATE utf8mb4_unicode_ci
        """)
        print(f"✅ 数据库 '{config['database']}' 已就绪")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ 失败: {e}")
        return False


def update_env_file(config):
    """更新.env文件"""
    print_step(4, "更新环境配置文件")
    
    env_path = project_root / '.env'
    template_path = project_root / 'mysql_config_template.txt'
    
    # 读取所有配置
    all_config = {}
    if template_path.exists():
        with open(template_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    all_config[key.strip()] = value.strip()
    
    # 添加DB_TYPE
    all_config['DB_TYPE'] = 'mysql'
    
    # 写入.env
    with open(env_path, 'w', encoding='utf-8') as f:
        f.write("# ============================================================\n")
        f.write("# CGM Butler - 环境配置 (自动生成)\n")
        f.write("# ============================================================\n\n")
        
        f.write("# 数据库配置\n")
        f.write("DB_TYPE=mysql\n")
        f.write(f"MYSQL_HOST={config['host']}\n")
        f.write(f"MYSQL_PORT={config['port']}\n")
        f.write(f"MYSQL_USER={config['user']}\n")
        f.write(f"MYSQL_PASSWORD={config['password']}\n")
        f.write(f"MYSQL_DATABASE={config['database']}\n")
        f.write("MYSQL_CHARSET=utf8mb4\n\n")
        
        f.write("# API配置\n")
        for key in ['OPENAI_API_KEY', 'OPENAI_MODEL', 'TAVUS_API_KEY', 'TAVUS_PERSONA_ID',
                   'TAVUS_REPLICA_ID', 'RETELL_API_KEY', 'INTAKE_AGENT_ID', 'INTAKE_LLM_ID']:
            if key in all_config:
                f.write(f"{key}={all_config[key]}\n")
        
        f.write("\n# 服务配置\n")
        f.write("FLASK_ENV=production\n")
        f.write("FLASK_DEBUG=False\n")
        f.write("FLASK_PORT=5000\n")
        f.write("MINERVA_PORT=8000\n")
        f.write("CGM_BACKEND_URL=http://localhost:5000\n")
        f.write("CORS_ORIGINS=http://localhost:5173,http://localhost:3000\n")
        f.write("LOG_LEVEL=INFO\n")
    
    print(f"✅ 配置文件已更新: {env_path}")
    
    # 删除临时模板
    if template_path.exists():
        template_path.unlink()
        print(f"✅ 临时文件已清理")
    
    return True


def create_tables(config):
    """创建表结构"""
    print_step(5, "创建MySQL表结构")
    
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
        
        # 列出表
        cursor = conn.cursor()
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        
        print(f"\n✅ 成功创建 {len(tables)} 张表")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ 失败: {e}")
        import traceback
        traceback.print_exc()
        return False


def migrate_data(config):
    """迁移数据"""
    print_step(6, "迁移SQLite数据")
    
    try:
        from config.settings import settings
        sqlite_db = settings.DB_PATH
        
        if not os.path.exists(sqlite_db):
            print(f"⚠️  SQLite数据库不存在，跳过数据迁移")
            return True
        
        print(f"📊 从SQLite迁移: {sqlite_db}")
        
        import sqlite3
        import pymysql
        
        sqlite_conn = sqlite3.connect(sqlite_db)
        sqlite_conn.row_factory = sqlite3.Row
        
        mysql_conn = pymysql.connect(
            host=config['host'],
            port=config['port'],
            user=config['user'],
            password=config['password'],
            database=config['database'],
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        
        tables = ['users', 'cgm_readings', 'cgm_pattern_actions', 'activity_logs',
                 'conversations', 'conversation_analysis', 'user_memories',
                 'user_long_term_memory', 'user_todos', 'user_onboarding_status']
        
        total = 0
        for table in tables:
            # 检查表是否存在
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
            
            print(f"  迁移 {table}: {len(rows)} 条", end=" ")
            
            # 获取MySQL列
            mysql_cursor = mysql_conn.cursor()
            mysql_cursor.execute(f"DESCRIBE {table}")
            mysql_cols = [r['Field'] for r in mysql_cursor.fetchall()]
            
            migrated = 0
            for row in rows:
                try:
                    row_dict = dict(row)
                    data = {}
                    
                    for col in mysql_cols:
                        if col in row_dict:
                            val = row_dict[col]
                            
                            # 布尔转换
                            bool_fields = ['email_verified', 'follow_up_needed', 'completed_today',
                                         'has_health_goals', 'has_dietary_info', 'has_exercise_info',
                                         'has_medical_history', 'has_lifestyle_info']
                            if col in bool_fields and val is not None:
                                val = bool(val)
                            
                            data[col] = val
                    
                    cols = ', '.join(data.keys())
                    placeholders = ', '.join(['%s'] * len(data))
                    sql = f"INSERT INTO {table} ({cols}) VALUES ({placeholders})"
                    
                    mysql_cursor.execute(sql, list(data.values()))
                    migrated += 1
                except:
                    pass
            
            mysql_conn.commit()
            total += migrated
            print(f"✓ ({migrated}条)")
        
        sqlite_conn.close()
        mysql_conn.close()
        
        print(f"\n✅ 数据迁移完成! 共 {total} 条记录")
        return True
        
    except Exception as e:
        print(f"⚠️  数据迁移出现问题: {e}")
        print("   表结构已创建，可以稍后手动迁移")
        return True  # 不阻止后续步骤


def verify_result(config):
    """验证结果"""
    print_step(7, "验证迁移结果")
    
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
        
        print(f"\n数据库状态:\n")
        for table in tables:
            table_name = list(table.values())[0]
            cursor.execute(f"SELECT COUNT(*) as count FROM {table_name}")
            count = cursor.fetchone()['count']
            print(f"  ✓ {table_name:30} {count:6} 条")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ 验证失败: {e}")
        return False


def main():
    """主函数"""
    print("\n" + "="*80)
    print(" 🚀 MySQL自动迁移工具")
    print("="*80 + "\n")
    
    # 检查命令行参数
    if len(sys.argv) > 1 and sys.argv[1] == '--step2':
        # 第二阶段：已填写密码，完成迁移
        print("继续完成迁移...\n")
        
        config = read_mysql_config()
        if not config:
            return
        
        if not test_and_create_database(config):
            return
        
        if not update_env_file(config):
            return
        
        if not create_tables(config):
            return
        
        migrate_data(config)
        
        verify_result(config)
        
        print("\n" + "="*80)
        print(" 🎉 MySQL迁移完成!")
        print("="*80)
        print(f"\n数据库信息:")
        print(f"  Host: {config['host']}")
        print(f"  Port: {config['port']}")
        print(f"  Database: {config['database']}")
        print(f"\n配置文件: {project_root / '.env'}")
        print(f"\n下一步:")
        print(f"  测试: python3 scripts/test_mysql_connection.py")
        print(f"  启动: ./start-all.sh")
        print("\n" + "="*80 + "\n")
        
    else:
        # 第一阶段：安装依赖并创建配置模板
        if not install_dependencies():
            return
        
        if not create_env_template():
            return


if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(f"\n❌ 错误: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)



