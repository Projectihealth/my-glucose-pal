# cgm_database.py
# -*- coding: utf-8 -*-
"""
CGM Butler 数据库工具类
提供便捷的数据库操作接口
"""
import sqlite3
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Optional, Tuple
import sys
import io
import os

# 设置 Windows 控制台输出编码
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')


DEFAULT_DB_PATH = os.getenv('CGM_DB_PATH', 'cgm_butler.db')


class CGMDatabase:
    """CGM Butler 数据库操作类"""
    
    def __init__(self, db_path: Optional[str] = None):
        """
        初始化数据库连接
        
        Args:
            db_path: 数据库文件路径
        """
        self.db_path = db_path or DEFAULT_DB_PATH
        self.conn = None
    
    def connect(self):
        """建立数据库连接"""
        self.conn = sqlite3.connect(self.db_path)
        self.conn.row_factory = sqlite3.Row  # 使查询结果可以通过列名访问
        self._ensure_activity_logs_table()
        return self.conn
    
    def close(self):
        """关闭数据库连接"""
        if self.conn:
            self.conn.close()
            self.conn = None
    
    def __enter__(self):
        """上下文管理器入口"""
        self.connect()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """上下文管理器出口"""
        self.close()

    # ============================================================
    # 日志记录辅助
    # ============================================================

    def _ensure_activity_logs_table(self):
        """创建活动日志表(如不存在)"""
        cursor = self.conn.cursor()
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS activity_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                category TEXT NOT NULL,
                title TEXT NOT NULL,
                note TEXT,
                timestamp_utc TEXT NOT NULL,
                day_utc TEXT NOT NULL,
                minutes_of_day_utc INTEGER NOT NULL,
                medication_name TEXT,
                dose TEXT,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        cursor.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_activity_logs_user_day
            ON activity_logs (user_id, day_utc, timestamp_utc DESC)
            """
        )
        self.conn.commit()

    @staticmethod
    def _normalise_timestamp_utc(timestamp_str: str) -> Tuple[str, str, int]:
        """将任意 ISO8601 字符串转换为标准 UTC 字段"""
        if not timestamp_str:
            raise ValueError("timestamp is required")

        cleaned = timestamp_str.replace("Z", "+00:00")
        dt = datetime.fromisoformat(cleaned)
        dt_utc = dt.astimezone(timezone.utc)
        timestamp_utc = dt_utc.isoformat().replace("+00:00", "Z")
        day = dt_utc.date().isoformat()
        minutes = dt_utc.hour * 60 + dt_utc.minute
        return timestamp_utc, day, minutes
    
    # ============================================================
    # 用户相关操作
    # ============================================================
    
    def get_user(self, user_id: str) -> Optional[Dict]:
        """
        获取用户信息
        
        Args:
            user_id: 用户ID
            
        Returns:
            用户信息字典,如果用户不存在返回 None
        """
        cursor = self.conn.cursor()
        cursor.execute('SELECT * FROM users WHERE user_id = ?', (user_id,))
        row = cursor.fetchone()
        return dict(row) if row else None
    
    def create_user(self, user_data: Dict) -> bool:
        """
        创建新用户
        
        Args:
            user_data: 用户信息字典
            
        Returns:
            创建成功返回 True,否则返回 False
        """
        try:
            cursor = self.conn.cursor()
            cursor.execute('''
                INSERT INTO users (
                    user_id, name, gender, date_of_birth, health_goal,
                    enrolled_at, conditions, cgm_device_type
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                user_data.get('user_id'),
                user_data.get('name'),
                user_data.get('gender'),
                user_data.get('date_of_birth'),
                user_data.get('health_goal'),
                user_data.get('enrolled_at', datetime.now().isoformat()),
                user_data.get('conditions'),
                user_data.get('cgm_device_type')
            ))
            self.conn.commit()
            return True
        except sqlite3.Error as e:
            print(f"创建用户失败: {e}")
            return False
    
    def update_user(self, user_id: str, updates: Dict) -> bool:
        """
        更新用户信息
        
        Args:
            user_id: 用户ID
            updates: 要更新的字段字典
            
        Returns:
            更新成功返回 True,否则返回 False
        """
        try:
            # 构建 UPDATE 语句
            set_clause = ', '.join([f"{key} = ?" for key in updates.keys()])
            values = list(updates.values()) + [user_id]
            
            cursor = self.conn.cursor()
            cursor.execute(f'''
                UPDATE users 
                SET {set_clause}, updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?
            ''', values)
            self.conn.commit()
            return True
        except sqlite3.Error as e:
            print(f"更新用户失败: {e}")
            return False
    
    # ============================================================
    # CGM 读数相关操作
    # ============================================================
    
    def add_cgm_reading(self, user_id: str, timestamp: str, glucose_value: int) -> bool:
        """
        添加 CGM 读数
        
        Args:
            user_id: 用户ID
            timestamp: 时间戳 (ISO 8601 格式)
            glucose_value: 血糖值 (mg/dL)
            
        Returns:
            添加成功返回 True,否则返回 False
        """
        try:
            cursor = self.conn.cursor()
            cursor.execute('''
                INSERT INTO cgm_readings (user_id, timestamp, glucose_value)
                VALUES (?, ?, ?)
            ''', (user_id, timestamp, glucose_value))
            self.conn.commit()
            return True
        except sqlite3.Error as e:
            print(f"添加 CGM 读数失败: {e}")
            return False
    
    def get_cgm_readings(
        self, 
        user_id: str, 
        start_time: Optional[str] = None,
        end_time: Optional[str] = None,
        limit: Optional[int] = None
    ) -> List[Dict]:
        """
        获取 CGM 读数
        
        Args:
            user_id: 用户ID
            start_time: 开始时间 (ISO 8601 格式),可选
            end_time: 结束时间 (ISO 8601 格式),可选
            limit: 返回记录数限制,可选
            
        Returns:
            CGM 读数列表
        """
        cursor = self.conn.cursor()
        
        query = 'SELECT * FROM cgm_readings WHERE user_id = ?'
        params = [user_id]
        
        if start_time:
            query += ' AND timestamp >= ?'
            params.append(start_time)
        
        if end_time:
            query += ' AND timestamp <= ?'
            params.append(end_time)
        
        query += ' ORDER BY timestamp DESC'
        
        if limit:
            query += ' LIMIT ?'
            params.append(limit)
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

    # ============================================================
    # 活动日志相关操作
    # ============================================================

    def add_activity_log(
        self,
        user_id: str,
        *,
        category: str,
        title: str,
        timestamp_utc: str,
        note: Optional[str] = None,
        medication_name: Optional[str] = None,
        dose: Optional[str] = None,
    ) -> Dict:
        """添加一条活动日志并返回创建的记录"""

        if category not in {"food", "lifestyle", "medication"}:
            raise ValueError("Invalid category")

        normalised_timestamp, day_utc, minutes = self._normalise_timestamp_utc(timestamp_utc)

        cursor = self.conn.cursor()
        cursor.execute(
            """
            INSERT INTO activity_logs (
                user_id,
                category,
                title,
                note,
                timestamp_utc,
                day_utc,
                minutes_of_day_utc,
                medication_name,
                dose
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                user_id,
                category,
                title,
                note,
                normalised_timestamp,
                day_utc,
                minutes,
                medication_name,
                dose,
            ),
        )
        self.conn.commit()
        inserted_id = cursor.lastrowid
        return self.get_activity_log_by_id(inserted_id)

    def get_activity_log_by_id(self, log_id: int) -> Dict:
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM activity_logs WHERE id = ?", (log_id,))
        row = cursor.fetchone()
        return dict(row) if row else {}

    def get_activity_logs(
        self,
        user_id: str,
        *,
        start_day: Optional[str] = None,
        end_day: Optional[str] = None,
        limit: Optional[int] = None,
    ) -> List[Dict]:
        """按用户获取活动日志，按时间倒序"""

        query = "SELECT * FROM activity_logs WHERE user_id = ?"
        params: List = [user_id]

        if start_day:
            query += " AND day_utc >= ?"
            params.append(start_day)

        if end_day:
            query += " AND day_utc <= ?"
            params.append(end_day)

        query += " ORDER BY timestamp_utc DESC"

        if limit:
            query += " LIMIT ?"
            params.append(limit)

        cursor = self.conn.cursor()
        cursor.execute(query, params)
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    
    def get_latest_reading(self, user_id: str) -> Optional[Dict]:
        """
        获取用户最新的 CGM 读数
        
        Args:
            user_id: 用户ID
            
        Returns:
            最新的 CGM 读数,如果没有返回 None
        """
        readings = self.get_cgm_readings(user_id, limit=1)
        return readings[0] if readings else None
    
    def get_glucose_statistics(
        self, 
        user_id: str,
        start_time: Optional[str] = None,
        end_time: Optional[str] = None
    ) -> Dict:
        """
        获取血糖统计信息
        
        Args:
            user_id: 用户ID
            start_time: 开始时间,可选
            end_time: 结束时间,可选
            
        Returns:
            统计信息字典 (min, max, avg, count)
        """
        cursor = self.conn.cursor()
        
        query = '''
            SELECT 
                MIN(glucose_value) as min_glucose,
                MAX(glucose_value) as max_glucose,
                AVG(glucose_value) as avg_glucose,
                COUNT(*) as count
            FROM cgm_readings
            WHERE user_id = ?
        '''
        params = [user_id]
        
        if start_time:
            query += ' AND timestamp >= ?'
            params.append(start_time)
        
        if end_time:
            query += ' AND timestamp <= ?'
            params.append(end_time)
        
        cursor.execute(query, params)
        row = cursor.fetchone()
        return dict(row) if row else {}
    
    def get_time_in_range(
        self,
        user_id: str,
        low_threshold: int = 70,
        high_threshold: int = 140,
        start_time: Optional[str] = None,
        end_time: Optional[str] = None
    ) -> float:
        """
        计算血糖在目标范围内的时间百分比 (Time In Range)
        
        Args:
            user_id: 用户ID
            low_threshold: 低阈值 (默认 70 mg/dL)
            high_threshold: 高阈值 (默认 140 mg/dL)
            start_time: 开始时间,可选
            end_time: 结束时间,可选
            
        Returns:
            在目标范围内的时间百分比 (0-100)
        """
        cursor = self.conn.cursor()
        
        query = '''
            SELECT 
                COUNT(CASE WHEN glucose_value BETWEEN ? AND ? THEN 1 END) * 100.0 / COUNT(*) as tir
            FROM cgm_readings
            WHERE user_id = ?
        '''
        params = [low_threshold, high_threshold, user_id]
        
        if start_time:
            query += ' AND timestamp >= ?'
            params.append(start_time)
        
        if end_time:
            query += ' AND timestamp <= ?'
            params.append(end_time)
        
        cursor.execute(query, params)
        row = cursor.fetchone()
        return row['tir'] if row and row['tir'] else 0.0
    
    def calculate_time_in_range(self, user_id: str, hours: int = 24) -> float:
        """
        计算最近 N 小时内的 Time In Range 百分比
        
        Args:
            user_id: 用户ID
            hours: 时间范围小时数，默认24
        
        Returns:
            在目标范围内的时间百分比 (0-100)
        """
        end_time = datetime.now().isoformat()
        start_time = (datetime.now() - timedelta(hours=hours)).isoformat()
        return self.get_time_in_range(user_id, start_time=start_time, end_time=end_time)
    
    # ============================================================
    # Pattern-Action 相关操作
    # ============================================================
    
    def get_pattern_actions(
        self,
        category: Optional[str] = None,
        min_priority: Optional[int] = None
    ) -> List[Dict]:
        """
        获取 Pattern-Action 映射
        
        Args:
            category: 类别筛选,可选
            min_priority: 最小优先级筛选,可选
            
        Returns:
            Pattern-Action 列表
        """
        cursor = self.conn.cursor()
        
        query = 'SELECT * FROM cgm_pattern_actions WHERE 1=1'
        params = []
        
        if category:
            query += ' AND category = ?'
            params.append(category)
        
        if min_priority:
            query += ' AND priority >= ?'
            params.append(min_priority)
        
        query += ' ORDER BY priority DESC, category'
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    
    def get_action_by_pattern(self, pattern_name: str) -> Optional[Dict]:
        """
        根据模式名称获取对应的行动建议
        
        Args:
            pattern_name: 模式名称
            
        Returns:
            行动建议字典,如果不存在返回 None
        """
        cursor = self.conn.cursor()
        cursor.execute(
            'SELECT * FROM cgm_pattern_actions WHERE pattern_name = ?',
            (pattern_name,)
        )
        row = cursor.fetchone()
        return dict(row) if row else None
    
    # ============================================================
    # 高级分析功能
    # ============================================================
    
    def detect_post_meal_spike(
        self,
        user_id: str,
        meal_time: str,
        window_hours: int = 2,
        spike_threshold: int = 50
    ) -> Tuple[bool, Dict]:
        """
        检测餐后血糖飙升
        
        Args:
            user_id: 用户ID
            meal_time: 用餐时间
            window_hours: 检测时间窗口 (小时)
            spike_threshold: 飙升阈值 (mg/dL)
            
        Returns:
            (是否检测到飙升, 详细信息字典)
        """
        cursor = self.conn.cursor()
        
        # 获取餐前血糖 (用餐前 15 分钟的平均值)
        meal_dt = datetime.fromisoformat(meal_time)
        pre_meal_start = (meal_dt - timedelta(minutes=15)).isoformat()
        
        cursor.execute('''
            SELECT AVG(glucose_value) as pre_meal_glucose
            FROM cgm_readings
            WHERE user_id = ? AND timestamp BETWEEN ? AND ?
        ''', (user_id, pre_meal_start, meal_time))
        
        pre_meal_row = cursor.fetchone()
        pre_meal_glucose = pre_meal_row['pre_meal_glucose'] if pre_meal_row else None
        
        if not pre_meal_glucose:
            return False, {'error': '无法获取餐前血糖'}
        
        # 获取餐后最高血糖
        post_meal_end = (meal_dt + timedelta(hours=window_hours)).isoformat()
        
        cursor.execute('''
            SELECT MAX(glucose_value) as peak_glucose, timestamp as peak_time
            FROM cgm_readings
            WHERE user_id = ? AND timestamp BETWEEN ? AND ?
        ''', (user_id, meal_time, post_meal_end))
        
        post_meal_row = cursor.fetchone()
        peak_glucose = post_meal_row['peak_glucose'] if post_meal_row else None
        
        if not peak_glucose:
            return False, {'error': '无法获取餐后血糖'}
        
        # 计算血糖上升幅度
        spike = peak_glucose - pre_meal_glucose
        has_spike = spike > spike_threshold
        
        return has_spike, {
            'pre_meal_glucose': pre_meal_glucose,
            'peak_glucose': peak_glucose,
            'spike': spike,
            'peak_time': post_meal_row['peak_time'],
            'threshold': spike_threshold
        }
    
    def get_daily_summary(self, user_id: str, date: str) -> Dict:
        """
        获取指定日期的血糖总结
        
        Args:
            user_id: 用户ID
            date: 日期 (YYYY-MM-DD 格式)
            
        Returns:
            日总结字典
        """
        start_time = f"{date} 00:00:00"
        end_time = f"{date} 23:59:59"
        
        # 基本统计
        stats = self.get_glucose_statistics(user_id, start_time, end_time)
        
        # Time In Range
        tir = self.get_time_in_range(user_id, start_time=start_time, end_time=end_time)
        
        # 读数数量
        readings = self.get_cgm_readings(user_id, start_time, end_time)
        
        return {
            'date': date,
            'reading_count': len(readings),
            'min_glucose': stats.get('min_glucose'),
            'max_glucose': stats.get('max_glucose'),
            'avg_glucose': stats.get('avg_glucose'),
            'time_in_range': tir
        }
    
    # ============================================================
    # 模式识别相关操作
    # ============================================================
    
    def get_user_patterns(
        self,
        user_id: str,
        pattern_type: Optional[str] = None,
        limit: Optional[int] = None
    ) -> List[Dict]:
        """
        获取用户的识别模式
        
        Args:
            user_id: 用户ID
            pattern_type: 模式类型筛选,可选
            limit: 返回记录数限制,可选
            
        Returns:
            识别模式列表
        """
        cursor = self.conn.cursor()
        
        query = 'SELECT * FROM user_patterns WHERE user_id = ?'
        params = [user_id]
        
        if pattern_type:
            query += ' AND pattern_type = ?'
            params.append(pattern_type)
        
        query += ' ORDER BY detected_at DESC'
        
        if limit:
            query += ' LIMIT ?'
            params.append(limit)
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    
    def get_latest_patterns(self, user_id: str, hours: int = 24) -> List[Dict]:
        """
        获取用户最近的识别模式
        
        Args:
            user_id: 用户ID
            hours: 时间范围 (小时)
            
        Returns:
            最近的识别模式列表
        """
        cursor = self.conn.cursor()
        
        cutoff_time = (datetime.now() - timedelta(hours=hours)).isoformat()
        
        cursor.execute('''
            SELECT * FROM user_patterns
            WHERE user_id = ? AND detected_at >= ?
            ORDER BY detected_at DESC
        ''', (user_id, cutoff_time))
        
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    
    def clear_old_patterns(self, user_id: str, days: int = 7) -> int:
        """
        清除用户的旧模式记录
        
        Args:
            user_id: 用户ID
            days: 保留天数 (删除超过此天数的记录)
            
        Returns:
            删除的记录数
        """
        cursor = self.conn.cursor()
        
        cutoff_time = (datetime.now() - timedelta(days=days)).isoformat()
        
        cursor.execute('''
            DELETE FROM user_patterns
            WHERE user_id = ? AND detected_at < ?
        ''', (user_id, cutoff_time))
        
        deleted_count = cursor.rowcount
        self.conn.commit()
        
        return deleted_count
    
    def get_pattern_summary(self, user_id: str, days: int = 7) -> Dict:
        """
        获取用户的模式识别总结
        
        Args:
            user_id: 用户ID
            days: 统计天数
            
        Returns:
            模式总结字典
        """
        cursor = self.conn.cursor()
        
        cutoff_time = (datetime.now() - timedelta(days=days)).isoformat()
        
        # 统计各类模式的数量
        cursor.execute('''
            SELECT 
                pattern_type,
                pattern_name,
                COUNT(*) as count,
                AVG(confidence) as avg_confidence,
                MAX(severity) as max_severity
            FROM user_patterns
            WHERE user_id = ? AND detected_at >= ?
            GROUP BY pattern_type, pattern_name
            ORDER BY count DESC
        ''', (user_id, cutoff_time))
        
        patterns = [dict(row) for row in cursor.fetchall()]
        
        # 统计总数
        cursor.execute('''
            SELECT COUNT(*) as total_patterns
            FROM user_patterns
            WHERE user_id = ? AND detected_at >= ?
        ''', (user_id, cutoff_time))
        
        total = cursor.fetchone()['total_patterns']
        
        # 统计高严重性模式
        cursor.execute('''
            SELECT COUNT(*) as high_severity_count
            FROM user_patterns
            WHERE user_id = ? AND detected_at >= ? AND severity = 'high'
        ''', (user_id, cutoff_time))
        
        high_severity = cursor.fetchone()['high_severity_count']
        
        return {
            'user_id': user_id,
            'days': days,
            'total_patterns': total,
            'high_severity_patterns': high_severity,
            'pattern_breakdown': patterns
        }
    
    def get_all_users(self) -> List[Dict]:
        """
        获取所有用户列表
        
        Returns:
            用户列表
        """
        cursor = self.conn.cursor()
        cursor.execute('SELECT user_id, name, conditions FROM users ORDER BY user_id')
        rows = cursor.fetchall()
        return [dict(row) for row in rows]


# ============================================================
# 使用示例
# ============================================================

def example_usage():
    """使用示例"""
    
    # 使用上下文管理器自动管理连接
    with CGMDatabase() as db:
        # 获取用户信息
        user = db.get_user('user_001')
        if user:
            print(f"用户: {user['name']}")
            print(f"健康目标: {user['health_goal']}")
        
        # 获取最新读数
        latest = db.get_latest_reading('user_001')
        if latest:
            print(f"\n最新血糖: {latest['glucose_value']} mg/dL")
            print(f"时间: {latest['timestamp']}")
        
        # 获取统计信息
        stats = db.get_glucose_statistics('user_001')
        print(f"\n血糖统计:")
        print(f"  最低: {stats['min_glucose']} mg/dL")
        print(f"  最高: {stats['max_glucose']} mg/dL")
        print(f"  平均: {stats['avg_glucose']:.1f} mg/dL")
        print(f"  记录数: {stats['count']}")
        
        # 计算 Time In Range
        tir = db.get_time_in_range('user_001')
        print(f"\nTime In Range (70-140 mg/dL): {tir:.1f}%")
        
        # 获取高优先级建议
        actions = db.get_pattern_actions(min_priority=4)
        print(f"\n高优先级建议 ({len(actions)} 条):")
        for action in actions:
            print(f"  [{action['category']}] {action['action_title']}")


if __name__ == '__main__':
    example_usage()
