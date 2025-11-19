#!/usr/bin/env python3
"""
测试脚本：更新 Retell LLM 设置

使用方法：
    python test_update_llm.py
"""

import asyncio
import sys
import os

# 添加父目录到 Python 路径
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))

from cgm_butler.minerva.intake_phone_agent.service import update_llm_settings, load_prompt_from_file


async def test_load_prompt():
    """测试加载 prompt 文件"""
    print("=" * 60)
    print("测试 1: 加载 prompt 文件")
    print("=" * 60)

    try:
        prompt = load_prompt_from_file()
        print(f"✅ 成功加载 prompt，长度: {len(prompt)} 字符")
        print(f"前 100 字符: {prompt[:100]}...")
        return True
    except Exception as e:
        print(f"❌ 加载 prompt 失败: {e}")
        return False


async def test_update_llm():
    """测试更新 LLM 设置"""
    print("\n" + "=" * 60)
    print("测试 2: 更新 LLM 设置")
    print("=" * 60)

    try:
        result = await update_llm_settings()
        print(f"✅ 成功更新 LLM 设置")
        print(f"结果: {result}")
        return True
    except Exception as e:
        print(f"❌ 更新 LLM 设置失败: {e}")
        import traceback
        traceback.print_exc()
        return False


async def test_custom_begin_message():
    """测试自定义开场白"""
    print("\n" + "=" * 60)
    print("测试 3: 更新自定义开场白")
    print("=" * 60)

    custom_message = "Hey! This is Olivia, your health coach. How can I help you today?"

    try:
        result = await update_llm_settings(begin_message=custom_message)
        print(f"✅ 成功更新自定义开场白")
        print(f"结果: {result}")
        return True
    except Exception as e:
        print(f"❌ 更新自定义开场白失败: {e}")
        import traceback
        traceback.print_exc()
        return False


async def main():
    """运行所有测试"""
    print("\n🚀 开始测试 LLM 更新功能\n")

    # 检查环境变量
    print("检查环境变量...")
    retell_api_key = os.getenv("RETELL_API_KEY")
    llm_id = os.getenv("INTAKE_LLM_ID")

    if not retell_api_key:
        print("❌ 缺少环境变量: RETELL_API_KEY")
        print("请在 .env 文件中设置 RETELL_API_KEY")
        return

    if not llm_id:
        print("⚠️  未设置 INTAKE_LLM_ID，将使用默认值")
    else:
        print(f"✅ INTAKE_LLM_ID: {llm_id}")

    print(f"✅ RETELL_API_KEY: {retell_api_key[:20]}...")

    # 运行测试
    results = []

    # 测试 1: 加载 prompt
    results.append(await test_load_prompt())

    # 测试 2: 更新 LLM（使用默认设置）
    if results[0]:
        results.append(await test_update_llm())

    # 测试 3: 更新自定义开场白（可选）
    # 取消注释以下行来测试自定义开场白
    # if results[0]:
    #     results.append(await test_custom_begin_message())

    # 总结
    print("\n" + "=" * 60)
    print("测试总结")
    print("=" * 60)

    passed = sum(results)
    total = len(results)

    print(f"通过: {passed}/{total}")

    if passed == total:
        print("✅ 所有测试通过！")
    else:
        print("❌ 部分测试失败，请检查日志")


if __name__ == "__main__":
    asyncio.run(main())
