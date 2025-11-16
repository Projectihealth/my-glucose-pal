# setup_database.py
# -*- coding: utf-8 -*-
import sqlite3
from datetime import datetime, timedelta
import random
import sys
import io

# 设置 Windows 控制台输出编码
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def create_database():
    """创建 CGM Butler 数据库并填充初始数据"""
    conn = sqlite3.connect('cgm_butler.db')
    cursor = conn.cursor()
    
    print("正在创建数据库表...")
    
    # 1. 创建用户表
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        user_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        gender TEXT,
        date_of_birth TEXT,
        health_goal TEXT,
        enrolled_at TEXT,
        conditions TEXT,
        cgm_device_type TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # 2. 创建 CGM 读数表
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS cgm_readings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        glucose_value INTEGER NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
    )
    ''')
    
    # 为 CGM 读数表创建索引以提高查询性能
    cursor.execute('''
    CREATE INDEX IF NOT EXISTS idx_user_timestamp 
    ON cgm_readings(user_id, timestamp)
    ''')
    
    # 3. 创建 CGM Pattern 和 Action 映射表
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS cgm_pattern_actions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pattern_name TEXT NOT NULL,
        pattern_description TEXT,
        category TEXT,
        action_title TEXT NOT NULL,
        action_detail TEXT,
        priority INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    print("[完成] 数据库表创建完成")
    print("\n正在插入测试数据...")
    
    # 插入测试用户
    cursor.execute('''
    INSERT OR REPLACE INTO users (
        user_id, name, gender, date_of_birth, health_goal, 
        enrolled_at, conditions, cgm_device_type, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        'user_001',
        'John Doe',
        'male',
        '1985-06-15',
        'Maintain stable glucose levels and reduce HbA1c',
        datetime.now().isoformat(),
        'Type 2 Diabetes',
        'Dexcom G7',
        datetime.now().isoformat(),
        datetime.now().isoformat()
    ))
    
    print("[完成] 用户数据插入完成")
    
    # 生成模拟 CGM 数据（最近 7 天）
    print("\n正在生成 CGM 读数数据...")
    base_time = datetime.now() - timedelta(days=7)
    cgm_data = []
    
    for day in range(7):
        for hour in range(24):
            for minute in range(0, 60, 5):  # 每5分钟一个读数
                timestamp = base_time + timedelta(days=day, hours=hour, minutes=minute)
                
                # 模拟血糖波动
                base_glucose = 100
                
                # 早餐后波动 (7-9点)
                if 7 <= hour <= 9:
                    base_glucose = 130 + (hour - 7) * 10
                # 午餐后波动 (12-14点)
                elif 12 <= hour <= 14:
                    base_glucose = 140 + (hour - 12) * 5
                # 晚餐后波动 (18-20点)
                elif 18 <= hour <= 20:
                    base_glucose = 135 + (hour - 18) * 8
                # 夜间 (22-6点)
                elif hour >= 22 or hour <= 6:
                    base_glucose = 95
                
                # 添加随机波动
                glucose = base_glucose + random.randint(-15, 20)
                
                # 确保血糖值在合理范围内
                glucose = max(70, min(200, glucose))
                
                cgm_data.append((
                    'user_001', 
                    timestamp.isoformat(), 
                    glucose,
                    datetime.now().isoformat()
                ))
    
    cursor.executemany(
        'INSERT INTO cgm_readings (user_id, timestamp, glucose_value, created_at) VALUES (?, ?, ?, ?)',
        cgm_data
    )
    
    print(f"[完成] CGM 读数数据插入完成: {len(cgm_data)} 条记录")
    
    # 插入 pattern-action 映射数据
    print("\n正在插入 Pattern-Action 映射数据...")
    actions = [
        # 饮食相关
        ('post_meal_spike', 
         'Glucose rises >50mg/dL within 2 hours after meal', 
         'diet', 
         'Reduce refined carbohydrates', 
         'Try replacing white rice with brown rice or quinoa. Pair carbs with protein and healthy fats.', 
         5),
        
        ('frequent_highs', 
         'Glucose >180mg/dL for more than 3 hours daily', 
         'diet', 
         'Review portion sizes', 
         'Consider reducing portion sizes by 20-25%. Focus on non-starchy vegetables.', 
         4),
        
        # 运动相关
        ('afternoon_spike', 
         'Glucose elevation between 2-5 PM', 
         'exercise', 
         'Take a post-lunch walk', 
         'A 15-20 minute walk after lunch can help reduce afternoon glucose spikes.', 
         4),
        
        ('morning_high', 
         'Fasting glucose >110mg/dL consistently', 
         'exercise', 
         'Try morning exercise', 
         'Light exercise like 10-15 minutes of stretching or yoga before breakfast may help.', 
         3),
        
        # 睡眠相关
        ('night_variability', 
         'Glucose fluctuates >30mg/dL during sleep hours', 
         'sleep', 
         'Adjust dinner timing', 
         'Try eating dinner 3-4 hours before bedtime. Avoid late-night snacks.', 
         3),
        
        ('dawn_phenomenon', 
         'Glucose rises 20+ mg/dL between 4-8 AM without eating', 
         'sleep', 
         'Evening protein snack', 
         'A small protein-rich snack before bed may help stabilize morning glucose.', 
         2),
        
        # 其他
        ('stress_spikes', 
         'Unexplained glucose rises during typical stress periods', 
         'other', 
         'Practice stress management', 
         'Try 5-10 minutes of deep breathing or meditation during stressful times.', 
         3),
        
        ('stable_range', 
         'Glucose stays 70-140mg/dL for >80% of the day', 
         'other', 
         'Maintain current habits', 
         'Great job! Your current routine is working well. Keep it up!', 
         1),
    ]
    
    cursor.executemany(
        '''INSERT INTO cgm_pattern_actions 
        (pattern_name, pattern_description, category, action_title, action_detail, priority) 
        VALUES (?, ?, ?, ?, ?, ?)''',
        actions
    )
    
    print(f"[完成] Pattern-Action 映射数据插入完成: {len(actions)} 条记录")
    
    # 提交更改
    conn.commit()
    
    # 显示统计信息
    print("\n" + "="*60)
    print("数据库创建成功!")
    print("="*60)
    
    # 统计用户数
    cursor.execute('SELECT COUNT(*) FROM users')
    user_count = cursor.fetchone()[0]
    print(f"[用户] 用户数量: {user_count}")
    
    # 统计 CGM 读数
    cursor.execute('SELECT COUNT(*) FROM cgm_readings')
    reading_count = cursor.fetchone()[0]
    print(f"[CGM] CGM 读数: {reading_count} 条记录")
    
    # 统计 Pattern-Action 映射
    cursor.execute('SELECT COUNT(*) FROM cgm_pattern_actions')
    action_count = cursor.fetchone()[0]
    print(f"[Action] Pattern-Action 映射: {action_count} 条记录")
    
    # 显示最近的几条 CGM 读数
    print("\n最近 5 条 CGM 读数:")
    cursor.execute('''
        SELECT timestamp, glucose_value 
        FROM cgm_readings 
        WHERE user_id = 'user_001'
        ORDER BY timestamp DESC 
        LIMIT 5
    ''')
    recent_readings = cursor.fetchall()
    for reading in recent_readings:
        print(f"   {reading[0]}: {reading[1]} mg/dL")
    
    # 显示按类别分组的 action 数量
    print("\nAction 类别统计:")
    cursor.execute('''
        SELECT category, COUNT(*) as count
        FROM cgm_pattern_actions
        GROUP BY category
        ORDER BY count DESC
    ''')
    category_stats = cursor.fetchall()
    for category, count in category_stats:
        print(f"   {category}: {count} 条")
    
    print("="*60)
    
    conn.close()

if __name__ == '__main__':
    create_database()

