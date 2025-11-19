# add_test_users.py
# -*- coding: utf-8 -*-
"""
Script to add test user accounts for account switching testing
"""
import sqlite3
from datetime import datetime
import sys
import io

# 设置 Windows 控制台输出编码
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def add_test_users():
    """添加4个测试用户账号：ella, tiantuo, tina, jack"""
    # 使用实际的数据库路径
    db_path = '/Users/yijialiu/Desktop/my-glucose-pal/storage/databases/cgm_butler.db'
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    print(f"连接到数据库: {db_path}")

    print("正在添加测试用户...")

    test_users = [
        {
            'user_id': 'ella',
            'name': 'Ella Zhang',
            'gender': 'female',
            'date_of_birth': '1990-03-15',
            'health_goal': 'Optimize post-meal glucose control',
            'conditions': 'Pre-diabetes',
            'cgm_device_type': 'Dexcom G7',
        },
        {
            'user_id': 'tiantuo',
            'name': 'Tiantuo Liu',
            'gender': 'male',
            'date_of_birth': '1988-07-22',
            'health_goal': 'Reduce glucose variability and improve TIR',
            'conditions': 'Type 1 Diabetes',
            'cgm_device_type': 'FreeStyle Libre 3',
        },
        {
            'user_id': 'tina',
            'name': 'Tina Chen',
            'gender': 'female',
            'date_of_birth': '1995-11-08',
            'health_goal': 'Manage gestational diabetes during pregnancy',
            'conditions': 'Gestational Diabetes',
            'cgm_device_type': 'Dexcom G6',
        },
        {
            'user_id': 'jack',
            'name': 'Jack Wilson',
            'gender': 'male',
            'date_of_birth': '1982-05-30',
            'health_goal': 'Maintain stable glucose levels and increase activity',
            'conditions': 'Type 2 Diabetes',
            'cgm_device_type': 'Dexcom G7',
        },
    ]

    for user in test_users:
        try:
            cursor.execute('''
            INSERT OR REPLACE INTO users (
                user_id, name, gender, date_of_birth, health_goal,
                enrolled_at, conditions, cgm_device_type, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                user['user_id'],
                user['name'],
                user['gender'],
                user['date_of_birth'],
                user['health_goal'],
                datetime.now().isoformat(),
                user['conditions'],
                user['cgm_device_type'],
                datetime.now().isoformat(),
                datetime.now().isoformat()
            ))
            print(f"[完成] 已添加用户: {user['user_id']} - {user['name']}")
        except Exception as e:
            print(f"[错误] 添加用户 {user['user_id']} 失败: {e}")

    conn.commit()

    # 验证添加的用户
    print("\n正在验证添加的用户...")
    cursor.execute('SELECT user_id, name, conditions FROM users ORDER BY user_id')
    all_users = cursor.fetchall()

    print(f"\n数据库中的所有用户 (共 {len(all_users)} 个):")
    print("-" * 80)
    for user_id, name, conditions in all_users:
        print(f"  {user_id:<15} | {name:<20} | {conditions}")
    print("-" * 80)

    conn.close()
    print("\n✓ 测试用户添加完成！")

if __name__ == '__main__':
    add_test_users()
