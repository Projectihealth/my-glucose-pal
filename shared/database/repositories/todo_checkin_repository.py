"""
Todo Checkin Repository

Tracks daily check‑ins for weekly habits (user_todos) and provides
weekly completion statistics used by the dashboard and Olivia coach.
"""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Dict, List

from .base import BaseRepository


class TodoCheckinRepository(BaseRepository):
    """Repository for todo_checkins table."""

    def create(self, user_id: str, todo_id: int, checkin_date: str) -> int:
        """
        Create a check‑in record for a given todo on a specific date.

        Args:
            user_id: 用户 ID
            todo_id: TODO 记录 ID (user_todos.id)
            checkin_date: 打勾日期，格式 YYYY-MM-DD（本地日期）

        Returns:
            新创建的 check‑in 记录 ID
        """
        self.execute(
            """
            INSERT INTO todo_checkins (user_id, todo_id, checkin_date)
            VALUES (?, ?, ?)
            """,
            (user_id, todo_id, checkin_date),
        )
        self.commit()
        return self.cursor.lastrowid

    def get_weekly_completion(self, user_id: str, week_start: str) -> Dict:
        """
        获取某个用户在指定周内的完成情况统计。

        统计逻辑（与 scripts/test_mysql_compatibility_fixes.py 中的断言保持一致）：
        - week_start 为该周周一（YYYY-MM-DD）
        - 统计 7 天（周一到周日）
        - 对于每一天：
            - total: 该周内属于该用户的 TODO 数量（user_todos.week_start = week_start）
            - completed: 在该日期有 check‑in 的不同 TODO 数量（按 todo_id 去重）
            - rate: completed / total 的百分比 (0-100)，整数
        - week_average: 7 天 rate 的平均值（四舍五入）
        """
        # 解析周起始日期
        try:
            start_date = datetime.strptime(week_start, "%Y-%m-%d").date()
        except ValueError:
            # 如果传入格式不对，退回到当前周的周一
            today = datetime.now().date()
            start_date = today - timedelta(days=today.weekday())
            week_start = start_date.isoformat()

        # 计算本周 TODO 总数（所有天共享同一个 total）
        total_row = self.fetchone(
            """
            SELECT COUNT(*) AS total
            FROM user_todos
            WHERE user_id = ? AND week_start = ?
            """,
            (user_id, week_start),
        )
        total_todos = int(total_row["total"]) if total_row and total_row.get("total") is not None else 0

        days: List[Dict] = []

        for i in range(7):
            day_date = start_date + timedelta(days=i)
            day_str = day_date.isoformat()
            day_label = day_date.strftime("%a")  # Mon, Tue, ...

            # 统计当天完成的 TODO 数量（按 todo_id 去重）
            completed_row = self.fetchone(
                """
                SELECT COUNT(DISTINCT todo_id) AS completed
                FROM todo_checkins
                WHERE user_id = ? AND checkin_date = ?
                """,
                (user_id, day_str),
            )
            completed = (
                int(completed_row["completed"])
                if completed_row and completed_row.get("completed") is not None
                else 0
            )

            if total_todos > 0:
                rate = round(completed * 100 / total_todos)
            else:
                rate = 0

            days.append(
                {
                    "date": day_str,
                    "day_label": day_label,
                    "completed": completed,
                    "total": total_todos,
                    "rate": rate,
                }
            )

        # 计算周平均完成率
        if days:
            week_average = round(sum(d["rate"] for d in days) / len(days))
        else:
            week_average = 0

        return {
            "user_id": user_id,
            "week_start": week_start,
            "days": days,
            "week_average": week_average,
        }

"""
Todo Check-in Repository

负责按天记录 todo 的打勾情况，并提供按周的聚合统计。
"""

from datetime import datetime, timedelta
from typing import Dict, List

from .base import BaseRepository


class TodoCheckinRepository(BaseRepository):
    """Repository for todo check-in operations."""

    def create(
        self,
        user_id: str,
        todo_id: int,
        checkin_date: str | None = None,
        created_at: str | None = None,
    ) -> int:
        """
        创建一条新的 check-in 记录。

        Args:
            user_id: 用户 ID
            todo_id: TODO ID
            checkin_date: 打勾所属日期 (YYYY-MM-DD)，默认今天
            created_at: 创建时间，默认当前时间
        """
        if not checkin_date:
            checkin_date = datetime.now().date().isoformat()
        if not created_at:
            created_at = datetime.now().isoformat()

        self.execute(
            """
            INSERT INTO todo_checkins (
                user_id, todo_id, checkin_date, created_at
            ) VALUES (?, ?, ?, ?)
            """,
            (user_id, todo_id, checkin_date, created_at),
        )
        self.commit()
        return self.cursor.lastrowid

    def get_weekly_completion(
        self,
        user_id: str,
        week_start: str,
    ) -> Dict:
        """
        获取某一周（7天）的完成情况统计。

        统计逻辑：
        - 先取出该用户在该周的所有 todos（按 user_todos.week_start 过滤）
        - 在 todo_checkins 里统计每一天打勾过的「不同 todo 数量」
        - daily.completed = 当天至少 check-in 一次的 todo 数量
        - daily.total = 该周 todo 总数
        - daily.rate = completed / total
        """
        # 解析 week_start 并计算 week_end
        week_start_date = datetime.fromisoformat(week_start).date()
        week_end_date = week_start_date + timedelta(days=6)

        week_start_str = week_start_date.isoformat()
        week_end_str = week_end_date.isoformat()

        # 1. 取出该周的 todos
        todos = self.fetchall(
            """
            SELECT id
            FROM user_todos
            WHERE user_id = ? AND week_start = ?
            """,
            (user_id, week_start_str),
        )

        todo_ids = [t["id"] for t in todos]
        total_todos = len(todo_ids)

        # 如果这一周没有 todo，直接返回空结构
        if not todo_ids:
            days: List[Dict] = []
            for offset in range(7):
                day_date = (week_start_date + timedelta(days=offset)).isoformat()
                day_label = (week_start_date + timedelta(days=offset)).strftime("%a")
                days.append(
                    {
                        "date": day_date,
                        "day_label": day_label,
                        "completed": 0,
                        "total": 0,
                        "rate": 0,
                    }
                )

            return {
                "user_id": user_id,
                "week_start": week_start_str,
                "days": days,
                "week_average": 0,
            }

        # 2. 查询这一周的 check-in 记录
        placeholders = ", ".join([self.placeholder] * len(todo_ids))
        query = f"""
        SELECT todo_id, checkin_date
        FROM todo_checkins
        WHERE user_id = ? 
          AND checkin_date BETWEEN ? AND ?
          AND todo_id IN ({placeholders})
        """
        params = [user_id, week_start_str, week_end_str] + todo_ids
        rows = self.fetchall(query, tuple(params))

        # 3. 聚合到每天：去重 todo_id，避免一天多次打勾重复计数
        daily_completed: Dict[str, set] = {}
        for row in rows:
            raw_date = row["checkin_date"]
            if hasattr(raw_date, "isoformat"):
                day_str = raw_date.isoformat()
            else:
                day_str = str(raw_date)

            day_str = day_str.split("T")[0]  # 兼容 DATETIME

            if day_str not in daily_completed:
                daily_completed[day_str] = set()
            daily_completed[day_str].add(row["todo_id"])

        # 4. 生成 7 天的结果
        days: List[Dict] = []
        rates: List[int] = []

        for offset in range(7):
            date_obj = week_start_date + timedelta(days=offset)
            day_date = date_obj.isoformat()
            day_label = date_obj.strftime("%a")

            completed = (
                len(daily_completed.get(day_date, set())) if total_todos > 0 else 0
            )
            total = total_todos
            rate = int(round((completed / total) * 100)) if total > 0 else 0
            rates.append(rate)

            days.append(
                {
                    "date": day_date,
                    "day_label": day_label,
                    "completed": completed,
                    "total": total,
                    "rate": rate,
                }
            )

        week_average = int(round(sum(rates) / len(rates))) if rates else 0

        return {
            "user_id": user_id,
            "week_start": week_start_str,
            "days": days,
            "week_average": week_average,
        }


















