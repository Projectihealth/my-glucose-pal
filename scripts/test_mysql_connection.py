#!/usr/bin/env python3
"""
快速测试MySQL连接

使用方法:
    python scripts/test_mysql_connection.py
"""

import sys
import os
from pathlib import Path

# 添加项目根目录到路径
project_root = Path(__file__).parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

from config.settings import settings


def main():
    print("=" * 80)
    print("MySQL连接测试")
    print("=" * 80)
    
    # 显示配置
    print("\n📋 当前配置:")
    print(f"  数据库类型: {settings.DB_TYPE}")
    print(f"  MySQL Host: {settings.MYSQL_HOST}")
    print(f"  MySQL Port: {settings.MYSQL_PORT}")
    print(f"  MySQL User: {settings.MYSQL_USER}")
    print(f"  MySQL Database: {settings.MYSQL_DATABASE}")
    print("=" * 80)
    
    if settings.DB_TYPE.lower() != 'mysql':
        print(f"\n⚠️  当前配置使用的是 '{settings.DB_TYPE}'，不是 MySQL")
        print("   如需测试MySQL，请在 .env 文件中设置: DB_TYPE=mysql")
        return
    
    # 测试连接
    print("\n🔌 测试MySQL连接...")
    
    try:
        from shared.database.mysql_connection import MySQLConnection
        
        if MySQLConnection.test_connection():
            print("\n" + "=" * 80)
            print("✅ MySQL连接测试成功!")
            print("=" * 80)
            
            # 测试数据库操作
            print("\n📊 测试数据库操作...")
            with MySQLConnection.get_db_session() as conn:
                cursor = conn.cursor()
                
                # 列出所有表
                cursor.execute("SHOW TABLES")
                tables = cursor.fetchall()
                
                if tables:
                    print(f"\n数据库中的表 ({len(tables)}张):")
                    for table in tables:
                        table_name = list(table.values())[0]
                        
                        # 获取表的记录数
                        cursor.execute(f"SELECT COUNT(*) as count FROM {table_name}")
                        count_result = cursor.fetchone()
                        count = count_result['count']
                        
                        print(f"  - {table_name:30} ({count:5} 条记录)")
                else:
                    print("\n⚠️  数据库中没有表。请先运行迁移脚本创建表结构。")
                    print("   命令: python scripts/migrate_sqlite_to_mysql.py")
            
            print("\n" + "=" * 80)
            print("✅ 所有测试通过！")
            print("=" * 80)
            
            print("\n📚 下一步:")
            print("  1. 如果数据库中没有表，运行: python shared/database/mysql_schema.py")
            print("  2. 迁移SQLite数据到MySQL: python scripts/migrate_sqlite_to_mysql.py")
            print("  3. 启动应用: ./start-all.sh")
            
        else:
            print("\n❌ MySQL连接失败")
            print("\n请检查:")
            print("  1. MySQL服务是否运行")
            print("  2. .env 文件中的MySQL配置是否正确")
            print("  3. 网络连接是否正常")
            print("  4. MySQL用户权限是否正确")
            
    except ImportError as e:
        print(f"\n❌ 缺少依赖: {e}")
        print("\n请安装MySQL依赖:")
        print("  pip install pymysql cryptography")
        
    except Exception as e:
        print(f"\n❌ 测试失败: {e}")
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    main()



