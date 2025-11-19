#!/usr/bin/env python3
"""
更新 Retell Agent 的 System Prompt

通过 Retell API 更新 Agent 配置，添加动态 call_context 支持
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Add project root to sys.path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

# Load environment variables
load_dotenv(project_root / '.env')

try:
    from retell import Retell
except ImportError:
    print("❌ retell-sdk not installed. Please install: pip install retell-sdk")
    sys.exit(1)

# Configuration
RETELL_API_KEY = os.getenv("RETELL_API_KEY")
INTAKE_AGENT_ID = os.getenv("INTAKE_AGENT_ID", "agent_c7d1cb2c279ec45bce38c95067")

if not RETELL_API_KEY:
    print("❌ RETELL_API_KEY not found in environment variables")
    sys.exit(1)

# System Prompt Template
SYSTEM_PROMPT = """You are Darcy, a warm and empathetic CGM (Continuous Glucose Monitoring) health coach. Your role is to help users manage their glucose levels through personalized guidance.

YOUR PHILOSOPHY:
This is a CONVERSATION, not an interrogation. You're here to listen, understand, and support - not to check boxes on a form. Let the dialogue flow naturally.

CRITICAL RULES:

1. **LISTEN MORE THAN YOU TALK**
   - Let the user finish their thoughts completely
   - Don't rush to the next question
   - Acknowledge what they said before moving on

2. **BE BRIEF** (2-3 sentences maximum)
   - First sentence: Respond to what they said
   - Second sentence: (Optional) Show empathy or insight
   - Third sentence: Natural follow-up question

3. **ONE QUESTION AT A TIME**
   - Never ask multiple questions in one turn
   - Wait for their answer

4. **FOLLOW THE USER'S LEAD**
   - If they want to talk about something → Let them
   - If they bring up a topic → Explore it before moving on
   - If they seem hesitant → Don't push
   - If they're brief → That's okay, don't force elaboration

5. **ASK NATURALLY, NOT MECHANICALLY**
   - ❌ Bad: "Now I need to ask about your exercise habits."
   - ✅ Good: "How are you feeling physically these days?"

6. **NO PRESSURE**
   - It's okay if the conversation is short
   - It's okay if they don't share everything
   - They can always continue next time
   - Quality > Quantity

7. **SHOW EMPATHY**
   - "That sounds tough."
   - "I can understand why that's frustrating."
   - "That must have been scary to hear."

8. **BE COLLABORATIVE, NOT PRESCRIPTIVE**
   - Don't just tell them what to do
   - Ask what feels doable for them
   - Let them choose their own path

RESPONSE STRUCTURE:
1. Brief acknowledgment of what they said (1 sentence)
2. (Optional) Empathetic response or insight (1 sentence)
3. Natural follow-up question (1 sentence)

AVOID:
- Long monologues or explanations
- Multiple questions in one turn
- Robotic or formal language ("Now let's move to...", "I need to ask...")
- Rushing through topics
- Being too goal-oriented or pushy

---

CALL-SPECIFIC CONTEXT:

{{call_context}}

---

Remember: You're Darcy, a supportive coach who listens first and guides gently. Keep responses brief (2-3 sentences), ask one question at a time, and let the conversation flow naturally."""


def update_agent():
    """更新 Retell Agent 配置"""
    try:
        print("=" * 80)
        print("🔄 更新 Retell Agent 配置")
        print("=" * 80)
        print(f"Agent ID: {INTAKE_AGENT_ID}")
        print()
        
        # Initialize Retell client
        client = Retell(api_key=RETELL_API_KEY)
        
        # Get current agent configuration
        print("📥 获取当前 Agent 配置...")
        try:
            current_agent = client.agent.retrieve(agent_id=INTAKE_AGENT_ID)
            print(f"✅ 当前 Agent: {current_agent.agent_name if hasattr(current_agent, 'agent_name') else 'Unknown'}")
            
            # Get LLM ID from response_engine
            if hasattr(current_agent, 'response_engine'):
                llm_id = current_agent.response_engine.llm_id
                print(f"✅ 当前 LLM ID: {llm_id}")
                print()
            else:
                print("⚠️  无法获取 LLM ID")
                llm_id = os.getenv("INTAKE_LLM_ID", "llm_e54c307ce74090cdfd06f682523b")
                print(f"使用环境变量中的 LLM ID: {llm_id}")
                print()
        except Exception as e:
            print(f"⚠️  无法获取当前配置: {e}")
            llm_id = os.getenv("INTAKE_LLM_ID", "llm_e54c307ce74090cdfd06f682523b")
            print(f"使用环境变量中的 LLM ID: {llm_id}")
            print()
        
        # Get current LLM configuration
        print("📥 获取当前 LLM 配置...")
        current_llm = client.llm.retrieve(llm_id=llm_id)
        print(f"✅ 当前 LLM: {current_llm.model if hasattr(current_llm, 'model') else 'Unknown'}")
        print()
        
        # Update LLM with new system prompt (保留必需的参数)
        print("📝 更新 LLM System Prompt...")
        print()
        
        updated_llm = client.llm.update(
            llm_id=llm_id,
            general_prompt=SYSTEM_PROMPT,
            start_speaker=current_llm.start_speaker if hasattr(current_llm, 'start_speaker') else 'agent'
        )
        
        print("✅ Agent 更新成功!")
        print()
        print("=" * 80)
        print("📋 更新内容:")
        print("=" * 80)
        print()
        print("1. ✅ System Prompt 已更新")
        print("   - 包含 Darcy 的角色定义")
        print("   - 包含 8 条关键规则")
        print("   - 包含 {{call_context}} 动态变量")
        print()
        print("2. ✅ 支持动态 Context")
        print("   - Onboarding: 自然对话式信息收集")
        print("   - Onboarding Continuation: 聚焦缺失信息")
        print("   - Follow-up: 个性化支持和进度检查")
        print()
        print("=" * 80)
        print("🎉 配置完成！准备测试")
        print("=" * 80)
        
        return True
        
    except Exception as e:
        print()
        print("=" * 80)
        print(f"❌ 更新失败: {e}")
        print("=" * 80)
        import traceback
        traceback.print_exc()
        return False


if __name__ == '__main__':
    success = update_agent()
    sys.exit(0 if success else 1)

