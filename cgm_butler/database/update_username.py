# update_username.py
# -*- coding: utf-8 -*-
"""更新数据库中的用户名"""
import sqlite3
import os

# 数据库路径
DB_PATH = os.path.join(os.path.dirname(__file__), 'cgm_butler.db')

def update_username():
    """将 user_001 的用户名从 Andres 改为 Julia"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    print("正在更新用户名...")
    print(f"数据库路径: {DB_PATH}")
    
    # 查看当前用户名
    cursor.execute('SELECT user_id, name FROM users WHERE user_id = ?', ('user_001',))
    current_user = cursor.fetchone()
    
    if current_user:
        print(f"当前用户名: {current_user[1]}")
    else:
        print("用户 user_001 不存在")
        conn.close()
        return
    
    # 更新用户名
    cursor.execute('''
        UPDATE users 
        SET name = 'Julia', updated_at = CURRENT_TIMESTAMP
        WHERE user_id = 'user_001'
    ''')
    
    conn.commit()
    
    # 验证更新
    cursor.execute('SELECT user_id, name FROM users WHERE user_id = ?', ('user_001',))
    updated_user = cursor.fetchone()
    
    print(f"✅ 用户名已更新: {updated_user[1]}")
    
    conn.close()

if __name__ == '__main__':
    update_username()

