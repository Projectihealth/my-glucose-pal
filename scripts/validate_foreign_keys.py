"""
验证外键约束数据一致性

检查是否有孤立记录（外键引用不存在的记录）
"""

import sys
import os

# 添加项目根目录到路径
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

from shared.database.mysql_connection import MySQLConnection


# 定义所有外键关系
FOREIGN_KEYS = [
    {
        'child_table': 'cgm_readings',
        'child_column': 'user_id',
        'parent_table': 'users',
        'parent_column': 'user_id'
    },
    {
        'child_table': 'cgm_pattern_actions',
        'child_column': 'user_id',
        'parent_table': 'users',
        'parent_column': 'user_id'
    },
    {
        'child_table': 'activity_logs',
        'child_column': 'user_id',
        'parent_table': 'users',
        'parent_column': 'user_id'
    },
    {
        'child_table': 'conversations',
        'child_column': 'user_id',
        'parent_table': 'users',
        'parent_column': 'user_id'
    },
    {
        'child_table': 'conversation_analysis',
        'child_column': 'conversation_id',
        'parent_table': 'conversations',
        'parent_column': 'conversation_id'
    },
    {
        'child_table': 'user_memories',
        'child_column': 'user_id',
        'parent_table': 'users',
        'parent_column': 'user_id'
    },
    {
        'child_table': 'user_memories',
        'child_column': 'conversation_id',
        'parent_table': 'conversations',
        'parent_column': 'conversation_id'
    },
    {
        'child_table': 'user_long_term_memory',
        'child_column': 'user_id',
        'parent_table': 'users',
        'parent_column': 'user_id'
    },
    {
        'child_table': 'user_todos',
        'child_column': 'user_id',
        'parent_table': 'users',
        'parent_column': 'user_id'
    },
    {
        'child_table': 'user_todos',
        'child_column': 'conversation_id',
        'parent_table': 'conversations',
        'parent_column': 'conversation_id'
    },
    {
        'child_table': 'todo_checkins',
        'child_column': 'user_id',
        'parent_table': 'users',
        'parent_column': 'user_id'
    },
    {
        'child_table': 'todo_checkins',
        'child_column': 'todo_id',
        'parent_table': 'user_todos',
        'parent_column': 'id'
    },
    {
        'child_table': 'user_onboarding_status',
        'child_column': 'user_id',
        'parent_table': 'users',
        'parent_column': 'user_id'
    },
]


def check_orphan_records(fk_info):
    """检查孤立记录"""
    try:
        with MySQLConnection.get_db_session() as conn:
            cursor = conn.cursor()

            # 查找子表中存在但父表中不存在的记录
            query = f"""
            SELECT COUNT(*) as orphan_count
            FROM {fk_info['child_table']} c
            LEFT JOIN {fk_info['parent_table']} p
                ON c.{fk_info['child_column']} = p.{fk_info['parent_column']}
            WHERE c.{fk_info['child_column']} IS NOT NULL
                AND p.{fk_info['parent_column']} IS NULL
            """

            cursor.execute(query)
            result = cursor.fetchone()
            orphan_count = result['orphan_count']

            if orphan_count > 0:
                # 获取具体的孤立记录示例
                sample_query = f"""
                SELECT c.{fk_info['child_column']} as orphan_value
                FROM {fk_info['child_table']} c
                LEFT JOIN {fk_info['parent_table']} p
                    ON c.{fk_info['child_column']} = p.{fk_info['parent_column']}
                WHERE c.{fk_info['child_column']} IS NOT NULL
                    AND p.{fk_info['parent_column']} IS NULL
                LIMIT 5
                """
                cursor.execute(sample_query)
                samples = cursor.fetchall()

                return {
                    'has_orphans': True,
                    'count': orphan_count,
                    'samples': [s['orphan_value'] for s in samples]
                }

            return {'has_orphans': False, 'count': 0}

    except Exception as e:
        return {'error': str(e)}


def main():
    """验证所有外键约束"""
    print("=" * 60)
    print("验证外键约束数据一致性")
    print("=" * 60)

    total_issues = 0
    issues_list = []

    for fk in FOREIGN_KEYS:
        print(f"\n检查: {fk['child_table']}.{fk['child_column']} "
              f"-> {fk['parent_table']}.{fk['parent_column']}")

        result = check_orphan_records(fk)

        if 'error' in result:
            print(f"  ⚠️  检查失败: {result['error']}")
        elif result['has_orphans']:
            print(f"  ❌ 发现 {result['count']} 条孤立记录")
            print(f"     示例值: {result['samples']}")
            total_issues += result['count']
            issues_list.append({
                'fk': fk,
                'count': result['count'],
                'samples': result['samples']
            })
        else:
            print(f"  ✅ 数据一致性正常")

    print("\n" + "=" * 60)
    if total_issues > 0:
        print(f"❌ 总计发现 {total_issues} 条孤立记录")
        print("=" * 60)

        print("\n⚠️  警告: 存在外键约束冲突的数据")
        print("这些记录在 SQLite 中可能被允许，但在 MySQL 中会导致问题。")
        print("\n建议:")
        print("1. 清理孤立记录（推荐）")
        print("2. 在迁移前修复数据一致性")
        print("3. 如果数据重要，考虑将外键设为 NULL 或创建占位记录")

        return False
    else:
        print("✅ 所有外键约束数据一致性正常")
        print("=" * 60)
        return True


if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
