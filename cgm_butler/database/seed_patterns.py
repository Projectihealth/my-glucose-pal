#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
填充示例模式数据到 user_patterns 表
"""

import sqlite3
import os
import json
from datetime import datetime, timedelta

def seed_patterns(db_path=None):
    """
    添加示例模式数据
    
    Args:
        db_path: 数据库路径，如果为None则使用默认路径
    """
    if db_path is None:
        db_path = os.path.join(os.path.dirname(__file__), 'cgm_butler.db')
    
    print(f"正在连接数据库: {db_path}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # 生成最近7天的示例模式
        patterns = []
        now = datetime.now()
        
        # 模式 1: 餐后血糖峰值 (今天早上)
        patterns.append({
            'user_id': 'user_001',
            'pattern_name': 'post_meal_spike',
            'pattern_description': 'Glucose rose from 95 to 165 mg/dL within 1.5 hours after breakfast',
            'severity': 'medium',
            'category': 'meal',
            'detected_at': (now - timedelta(hours=2)).isoformat(),
            'start_time': (now - timedelta(hours=3)).isoformat(),
            'end_time': (now - timedelta(hours=2)).isoformat(),
            'confidence': 0.9,
            'metadata': json.dumps({
                'meal_type': 'breakfast',
                'glucose_start': 95,
                'glucose_peak': 165,
                'rise_rate': '35 mg/dL per hour'
            })
        })
        
        # 模式 2: 午后低血糖 (昨天)
        patterns.append({
            'user_id': 'user_001',
            'pattern_name': 'afternoon_dip',
            'pattern_description': 'Glucose dropped to 68 mg/dL around 3 PM',
            'severity': 'medium',
            'category': 'time_of_day',
            'detected_at': (now - timedelta(days=1, hours=9)).isoformat(),
            'start_time': (now - timedelta(days=1, hours=10)).isoformat(),
            'end_time': (now - timedelta(days=1, hours=8)).isoformat(),
            'confidence': 0.85,
            'metadata': json.dumps({
                'lowest_glucose': 68,
                'time_of_day': '15:00'
            })
        })
        
        # 模式 3: 黎明现象 (今天早上)
        patterns.append({
            'user_id': 'user_001',
            'pattern_name': 'dawn_phenomenon',
            'pattern_description': 'Glucose rose from 98 to 125 mg/dL between 5-7 AM without eating',
            'severity': 'low',
            'category': 'time_of_day',
            'detected_at': (now - timedelta(hours=5)).isoformat(),
            'start_time': (now - timedelta(hours=7)).isoformat(),
            'end_time': (now - timedelta(hours=5)).isoformat(),
            'confidence': 0.95,
            'metadata': json.dumps({
                'glucose_start': 98,
                'glucose_end': 125,
                'rise_amount': 27
            })
        })
        
        # 模式 4: 高血糖变异性 (过去24小时)
        patterns.append({
            'user_id': 'user_001',
            'pattern_name': 'high_variability',
            'pattern_description': 'Glucose fluctuated between 75 and 180 mg/dL over the past 24 hours',
            'severity': 'medium',
            'category': 'variability',
            'detected_at': (now - timedelta(hours=1)).isoformat(),
            'start_time': (now - timedelta(days=1)).isoformat(),
            'end_time': now.isoformat(),
            'confidence': 0.88,
            'metadata': json.dumps({
                'glucose_min': 75,
                'glucose_max': 180,
                'coefficient_of_variation': 32
            })
        })
        
        # 模式 5: 持续高血糖 (昨天晚上)
        patterns.append({
            'user_id': 'user_001',
            'pattern_name': 'sustained_hyperglycemia',
            'pattern_description': 'Glucose remained above 180 mg/dL for 3.5 hours after dinner',
            'severity': 'high',
            'category': 'level',
            'detected_at': (now - timedelta(days=1, hours=4)).isoformat(),
            'start_time': (now - timedelta(days=1, hours=6)).isoformat(),
            'end_time': (now - timedelta(days=1, hours=3)).isoformat(),
            'confidence': 0.92,
            'metadata': json.dumps({
                'duration_hours': 3.5,
                'average_glucose': 195,
                'peak_glucose': 210
            })
        })
        
        # 插入数据
        for pattern in patterns:
            cursor.execute('''
                INSERT INTO user_patterns 
                (user_id, pattern_name, pattern_description, severity, category, 
                 detected_at, start_time, end_time, confidence, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                pattern['user_id'],
                pattern['pattern_name'],
                pattern['pattern_description'],
                pattern['severity'],
                pattern['category'],
                pattern['detected_at'],
                pattern['start_time'],
                pattern['end_time'],
                pattern['confidence'],
                pattern['metadata']
            ))
        
        conn.commit()
        
        print(f"✅ 成功插入 {len(patterns)} 条模式记录!")
        print("\n插入的模式:")
        for i, pattern in enumerate(patterns, 1):
            print(f"  {i}. {pattern['pattern_name']}: {pattern['pattern_description'][:60]}...")
        
    except Exception as e:
        print(f"❌ 错误: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == '__main__':
    print("="*60)
    print("填充示例模式数据")
    print("="*60)
    print()
    
    seed_patterns()
    
    print()
    print("="*60)
    print("数据填充完成!")
    print("="*60)

