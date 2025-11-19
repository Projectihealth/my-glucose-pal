"""
验证 MySQL 字符串字段长度

检查现有数据中是否有超过 VARCHAR 长度限制的字段
"""

import sys
import os
from typing import Dict, List

# 添加项目根目录到路径
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

from shared.database.mysql_connection import MySQLConnection


# 定义所有 VARCHAR 字段的长度限制
VARCHAR_LIMITS = {
    'users': {
        'user_id': 50,
        'name': 200,
        'email': 255,
        'password_hash': 255,
        'gender': 20,
        'health_goal': 500,
        'conditions': 500,
        'cgm_device_type': 100,
    },
    'conversations': {
        'conversation_id': 100,
        'user_id': 50,
        'conversation_type': 20,
        'conversation_name': 200,
        'tavus_conversation_id': 100,
        'tavus_conversation_url': 500,
        'tavus_replica_id': 50,
        'tavus_persona_id': 50,
        'retell_call_id': 100,
        'retell_agent_id': 100,
        'call_status': 50,
        'call_type': 50,
        'disconnection_reason': 200,
        'recording_url': 500,
        'status': 20,
        'shutdown_reason': 200,
    },
    'user_todos': {
        'user_id': 50,
        'conversation_id': 100,
        'category': 50,
        'priority': 20,
        'recommendation_tag': 50,
        'status': 20,
    },
    'todo_checkins': {
        'user_id': 50,
    },
    'user_onboarding_status': {
        'user_id': 50,
        'onboarding_stage': 50,
        'engagement_stage': 50,
    },
}


def check_string_lengths(table_name: str, field_limits: Dict[str, int]) -> List[Dict]:
    """检查表中字段是否超过长度限制"""
    issues = []

    try:
        with MySQLConnection.get_db_session() as conn:
            cursor = conn.cursor()

            for field, max_length in field_limits.items():
                query = f"""
                SELECT {field}, LENGTH({field}) as len
                FROM {table_name}
                WHERE LENGTH({field}) > %s
                LIMIT 5
                """

                cursor.execute(query, (max_length,))
                results = cursor.fetchall()

                if results:
                    for row in results:
                        issues.append({
                            'table': table_name,
                            'field': field,
                            'max_length': max_length,
                            'actual_length': row['len'],
                            'value_preview': row[field][:100] if row[field] else None
                        })

    except Exception as e:
        print(f"⚠️  无法检查表 {table_name}: {e}")

    return issues


def main():
    """验证所有表的字符串长度"""
    print("=" * 60)
    print("验证 MySQL 字符串字段长度")
    print("=" * 60)

    all_issues = []

    for table_name, field_limits in VARCHAR_LIMITS.items():
        print(f"\n检查表: {table_name}")
        issues = check_string_lengths(table_name, field_limits)

        if issues:
            print(f"  ❌ 发现 {len(issues)} 个超长字段")
            for issue in issues:
                print(f"     - {issue['field']}: {issue['actual_length']} > {issue['max_length']}")
                print(f"       预览: {issue['value_preview']}")
            all_issues.extend(issues)
        else:
            print(f"  ✅ 所有字段长度正常")

    print("\n" + "=" * 60)
    if all_issues:
        print(f"❌ 总计发现 {len(all_issues)} 个超长字段")
        print("=" * 60)

        print("\n建议:")
        print("1. 检查这些数据是否合理")
        print("2. 考虑增加 VARCHAR 长度或使用 TEXT 类型")
        print("3. 清理或截断不合理的数据")
        return False
    else:
        print("✅ 所有字段长度都在限制范围内")
        print("=" * 60)
        return True


if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
