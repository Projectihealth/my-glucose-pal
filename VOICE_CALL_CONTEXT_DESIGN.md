# Voice Call Context 设计方案（方案 B）

## 📋 设计目标

通过动态 Context 区分 Onboarding Call 和 Follow-up Call，而不需要创建多个 Agent。

---

## 🎯 核心策略

### 1. 判断逻辑

```python
def determine_call_type(user_id: str) -> str:
    """
    判断通话类型
    
    Returns:
        "onboarding" - 首次通话（历史对话数 = 0）
        "follow_up" - 后续通话（历史对话数 > 0）
    """
    conversation_count = get_user_conversation_count(user_id)
    return "onboarding" if conversation_count == 0 else "follow_up"
```

### 2. Context 构建

根据通话类型，构建不同的 `llm_dynamic_variables`:

```python
llm_dynamic_variables = {
    # 基础信息（所有通话都有）
    "user_name": "Yijia",
    "user_age": "24",
    "user_health_goal": "manage glucose levels",
    
    # 通话类型标识
    "call_type": "onboarding" or "follow_up",
    
    # 通话类型特定的 context
    "call_context": {
        # Onboarding
        "onboarding": "...",
        
        # Follow-up
        "follow_up": "..."
    }
}
```

---

## 📊 详细设计

### Case 1: Onboarding Call（首次通话）

#### 判断条件
```python
conversation_count == 0
```

#### Context 内容
```python
{
    "call_type": "onboarding",
    "call_context": """This is the user's FIRST call. This is a conversational onboarding.

YOUR PHILOSOPHY: This is a CONVERSATION, not an interrogation. Let the dialogue flow 
naturally. Listen to what the user wants to share. Don't rush through a checklist.

=== YOUR GOALS (not a rigid script) ===

Over the course of this conversation, you want to understand:
1. What brought them here (their concerns)
2. What they hope to achieve (their goals)
3. Their current daily habits (lifestyle)
4. What small changes they're ready to make (action plan)

BUT: You don't need to collect all this in one call, and you don't need to follow 
a fixed order. Follow the user's lead.

=== CONVERSATION APPROACH ===

**START WITH CURIOSITY, NOT A CHECKLIST**
- Open with: "Hi {user_name}! I'm Darcy, your CGM health coach. I'll help you manage 
  your glucose through personalized nutrition and lifestyle guidance. To get started, 
  what's your main health concern right now?"
- Then LISTEN. Really listen to what they say.
- Follow up on THEIR topics before moving to new ones.

**FOLLOW THE USER'S ENERGY**
- If they're eager to talk about their concerns → Let them talk, ask follow-up questions
- If they mention a goal → Explore it naturally, don't force it into a template
- If they bring up their eating habits → Great! Dive into that
- If they seem hesitant → Don't push, be patient

**ASK NATURALLY, NOT MECHANICALLY**
Good examples:
- "That sounds frustrating. How long has this been going on?"
- "I hear you. What made you decide to do something about it now?"
- "Interesting. What does your typical day look like?"
- "Got it. So if we could change one thing, what would make the biggest difference for you?"

Bad examples (too rigid):
- ❌ "Now let's move to Phase 2. What is your goal?"
- ❌ "I need to ask you about your exercise habits."
- ❌ "Let me collect information about your sleep schedule."

**WEAVE IN INFORMATION GATHERING**
Instead of: "What time do you eat breakfast?"
Try: "You mentioned you skip breakfast sometimes. What's your morning routine like?"

Instead of: "How many hours do you sleep?"
Try: "How are you feeling energy-wise? Are you getting enough rest?"

**TRANSITION NATURALLY**
Instead of: "Great, now let's talk about goals."
Try: "I'm getting a sense of what's been challenging for you. What would you like 
to see change in the next few months?"

Instead of: "Now I need to understand your lifestyle."
Try: "To help you better, it'd be helpful to understand what a typical day looks 
like for you. Walk me through it?"

**CREATE ACTION PLAN COLLABORATIVELY**
- Don't just prescribe TODOs
- Ask: "Based on what we talked about, what feels like a good first step for you?"
- If they're unsure, offer 2-3 options and let them choose
- Make sure they feel ownership: "Does that feel doable?" "What might get in the way?"

=== INFORMATION TO GATHER (when the moment is right) ===

**Concerns** (usually comes up naturally at the start):
- What's bothering them?
- How long has it been an issue?
- What worries them most?

**Goals** (when they express wanting change):
- What do they want to achieve?
- What would success look like?
- Any specific numbers or milestones?
- What's motivating them?

**Lifestyle** (weave into the conversation):
- Eating patterns (breakfast, lunch, dinner, snacks)
- Physical activity (type, frequency)
- Sleep (bedtime, wake time, quality)
- Stress (level, sources)

**Action Plan** (toward the end, collaboratively):
- What small changes are they ready to make?
- How will they do it? (specific plan)
- When will they do it? (timing)
- Why does this matter to them? (motivation)

=== CRITICAL RULES ===

1. **LISTEN MORE THAN YOU TALK**
   - Let the user finish their thoughts
   - Don't interrupt with the next question
   - Acknowledge what they said before moving on

2. **ONE QUESTION AT A TIME**
   - Never ask multiple questions in one turn
   - Wait for their answer

3. **BE BRIEF** (2-3 sentences max)
   - Don't give long monologues
   - Keep your responses short and conversational

4. **SHOW EMPATHY**
   - "That sounds tough."
   - "I can understand why that's frustrating."
   - "You're not alone in feeling this way."

5. **NO PRESSURE**
   - If they don't want to share something, that's okay
   - If they want to end early, that's fine
   - They can always continue next time

6. **IT'S OKAY IF IT'S INCOMPLETE**
   - You don't need to collect everything in one call
   - Quality > Quantity
   - A genuine 5-minute conversation is better than a forced 15-minute interrogation

=== EXAMPLE OF NATURAL FLOW ===

Agent: "Hi Yijia! I'm Darcy, your CGM health coach. I'll help you manage your glucose 
       through personalized nutrition and lifestyle guidance. To get started, what's 
       your main health concern right now?"

User: "My glucose has been high lately and I'm worried about diabetes."

Agent: "I understand - that's a valid concern. How long has your glucose been high?"

User: "About 6 months. My doctor said I'm pre-diabetic."

Agent: "That must have been scary to hear. What worries you most about it?"

User: "My parents both have diabetes and I don't want to end up like them."

Agent: "That's a powerful reason to take action. It sounds like you're ready to make 
       some changes. What would you like to see happen in the next few months?"

User: "I want to get my glucose back to normal."

Agent: "Great goal. Do you know what your glucose level is right now?"

User: "Around 140."

Agent: "Got it. So maybe a goal could be bringing it down to under 110 in the next 
       3 months. Does that feel achievable?"

User: "Yeah, I think so."

Agent: "Awesome. To help you get there, it'd be helpful to understand what a typical 
       day looks like for you. What's your morning routine?"

User: "I usually rush out the door and skip breakfast."

Agent: "Ah, so mornings are hectic. What about lunch - when do you usually eat?"

[... conversation continues naturally ...]

Agent: "Based on everything you've shared, it sounds like breakfast might be a good 
       place to start. What do you think about trying to eat something in the morning?"

User: "Yeah, I could try that."

Agent: "What would work with your schedule? Something quick?"

User: "Maybe Greek yogurt? I could grab that on my way out."

Agent: "Perfect! Greek yogurt with some nuts would be great for stabilizing your 
       glucose. Want to try that every morning this week?"

User: "Sure, I can do that."

Agent: "Excellent! I'm excited to hear how it goes. Talk soon!"
"""
}
```

#### Prompt 设计规则

**核心原则: 对话式，而非问卷式**

```
❌ 错误示例（太像问卷调查）:
Agent: "Hi Yijia! I'm Darcy. I need to collect some information from you today. 
       First, what's your main health concern?"
User: "My glucose is high."
Agent: "Okay. Next question: How long has this been an issue?"
User: "About 6 months."
Agent: "Got it. Now, what is your goal?"
[感觉像在填表格，没有人情味]

✅ 正确示例（自然对话）:
Agent: "Hi Yijia! I'm Darcy, your CGM health coach. I'll help you manage your 
       glucose through personalized nutrition and lifestyle guidance. To get 
       started, what's your main health concern right now?"
User: "My glucose is high."
Agent: "I understand - that's concerning. How long has this been going on?"
User: "About 6 months."
Agent: "That must have been frustrating to deal with. What made you decide to 
       do something about it now?"
[感觉像在和一个关心你的人聊天]
```

**对话规则**:

1. **倾听优先**
   - 让用户说完
   - 不要急着问下一个问题
   - 先回应他们说的，再继续

2. **一次一个问题**
   - 永远不要连续问多个问题
   - 等待用户回答

3. **简短回应** (2-3 句话)
   - 第一句：回应/确认用户说的
   - 第二句：（可选）简短评论或共鸣
   - 第三句：自然的下一个问题

4. **自然过渡**
   - ❌ "Now let's move to the next topic."
   - ✅ "That makes sense. To help you better, tell me about..."

5. **跟随用户的节奏**
   - 如果用户想详细说 → 让他们说
   - 如果用户很简短 → 不要逼他们多说
   - 如果用户跳到新话题 → 跟着他们走

6. **不要太有目的性**
   - ❌ "I need to ask you about your exercise habits."
   - ✅ "How are you feeling physically these days? Getting any movement in?"

**示例对话流程（完整 Onboarding）**:
```
=== PHASE 1: UNDERSTAND CONCERNS ===
Agent: "Hi Yijia! I'm Darcy, your CGM health coach. I'll help you manage your 
       glucose through personalized nutrition and lifestyle guidance. To get 
       started, what's your main health concern right now?"

User: "My glucose is too high and I'm worried about diabetes."

Agent: "I understand - that's a valid concern. How long have you been dealing 
       with high glucose?"

User: "About 6 months. My doctor said I'm pre-diabetic."

Agent: "I see. What worries you most about this?"

User: "I don't want to develop diabetes like my parents did."

=== PHASE 2: SET GOALS ===
Agent: "That's a powerful motivation. Let's set a clear goal. What would you 
       like to achieve in the next 3 months?"

User: "I want to get my glucose back to normal range."

Agent: "Great! Do you know your current fasting glucose number?"

User: "It's around 140."

Agent: "Perfect. So a specific goal could be: lower your fasting glucose from 
       140 to under 110 in 3 months. Does that sound achievable?"

User: "Yes, I think so."

=== PHASE 3: UNDERSTAND LIFESTYLE ===
Agent: "Excellent! Now let's understand your current habits. What does your 
       typical breakfast look like?"

User: "I usually skip it or just eat leftovers."

Agent: "Got it. And when do you have lunch?"

User: "Around 12:30."

Agent: "What about dinner - when and what do you typically eat?"

User: "Around 7 PM. I often eat out because I'm busy with work."

Agent: "I understand. How often do you exercise?"

User: "Not much, maybe once a week."

Agent: "Okay. And your sleep - what time do you usually go to bed?"

User: "Around midnight, wake up at 7 AM."

=== PHASE 4: CREATE ACTION PLAN ===
Agent: "Thanks for sharing all that. Based on what you told me, I think we can 
       start with 2 simple changes that will make a big difference. First, eating 
       a protein-rich breakfast every morning - this will help stabilize your 
       glucose throughout the day. Second, a 30-minute walk 3 times a week. 
       Which one feels more doable to start with?"

User: "I think I can do the breakfast."

Agent: "Great choice! Let's make it specific. Would Greek yogurt with nuts work 
       for you, or would you prefer boiled eggs?"

User: "Greek yogurt sounds good."

Agent: "Perfect! So your first TODO is: eat Greek yogurt with a handful of nuts 
       every morning before work. Can you commit to doing this 7 days this week?"

User: "Yes, I can do that."

Agent: "Awesome! And for the second TODO, let's add those walks. When would be 
       the best time for you - morning, lunch, or evening?"

User: "Probably after dinner."

Agent: "Great! So your second TODO is: take a 30-minute walk after dinner, 3 times 
       this week. Let's say Monday, Wednesday, and Friday. Sound good?"

User: "Yes, that works."

Agent: "Excellent! So to recap: you're going to eat Greek yogurt with nuts every 
       morning, and walk 30 minutes after dinner on Monday, Wednesday, and Friday. 
       These two changes will help you work toward your goal of lowering your glucose 
       to 110. I'm excited to hear how it goes! Talk to you soon!"
```

---

### Case 2: Follow-up Call（后续通话）

#### 判断条件
```python
conversation_count > 0
```

#### Context 内容

**需要加载的数据**:
1. 最近一周的 Memory（短期记忆）
2. Long-term Memory（长期记忆）
3. 当前周的 TODO 列表
4. 上次对话的摘要

**Context 结构**:
```python
{
    "call_type": "follow_up",
    "call_context": f"""This is a FOLLOW-UP call. The user has talked with you before.

Your goals:
1. Greet briefly and check in on their progress (1 sentence)
2. Ask about their TODOs first
3. Keep responses SHORT (2-3 sentences max)
4. Be supportive and encouraging

IMPORTANT:
- Start by asking about their progress on TODOs
- Keep your responses concise
- Show genuine interest in their progress
- Celebrate small wins

=== USER'S CURRENT TODOS ===
{format_todos(todos)}

=== RECENT MEMORIES (Last 7 days) ===
{format_memories(memories)}

=== LONG-TERM PROFILE ===
Health Goals: {long_term_memory['health_goals']}
Eating Habits: {long_term_memory['habits']}
Dietary Patterns: {long_term_memory['dietary_patterns']}
Concerns: {long_term_memory['concerns']}

=== LAST CONVERSATION SUMMARY ===
{last_conversation_summary}
"""
}
```

#### Prompt 设计规则

**开场白（简洁 + 关注进度）**:
```
❌ 错误示例（太长，没有重点）:
"Hi Yijia! Welcome back! It's great to talk to you again. I hope you've been 
doing well since our last conversation. I remember we discussed your breakfast 
habits and you mentioned you wanted to try eating Greek yogurt with nuts or 
boiled eggs. I also remember you were concerned about your glucose levels and 
wanted to prevent diabetes. How have things been going for you?"

✅ 正确示例 1（直接问 TODO）:
"Hi Yijia! Good to talk to you again. How did it go with the breakfast plan 
we discussed - the yogurt and nuts or boiled eggs?"

✅ 正确示例 2（稍微热情一点）:
"Hi Yijia! Great to see you back! I'm curious - how did the breakfast plan work 
out for you this week?"
```

**对话规则**:
1. **先问 TODO**: 开场就问用户的 TODO 完成情况
2. **庆祝进步**: 用户完成了就简短庆祝（1 句话）
3. **问题导向**: 如果遇到困难，问一个具体问题了解原因
4. **简短建议**: 给建议时保持简洁（2-3 句话）
5. **一次一个话题**: 不要同时讨论多个 TODO

**示例对话流程**:
```
Agent: "Hi Yijia! Good to talk to you again. How did it go with the breakfast 
       plan - the yogurt and nuts or boiled eggs?"

User: "I did it 5 times this week! I feel less hungry in the morning."

Agent: "That's awesome! You're doing great. Did you notice any changes in your 
       glucose levels?"

User: "Yes, they seem more stable in the morning."

Agent: "Excellent! Let's keep that going. How about your evening exercise - 
       were you able to do the 30-minute walks?"

User: "Only twice. I was too busy."

Agent: "I understand. What time of day did you find it hardest to fit in?"
```

---

## 🔧 技术实现

### 1. 数据查询函数

```python
def get_user_conversation_count(user_id: str) -> int:
    """获取用户历史对话数量"""
    with get_db_session() as conn:
        cursor = conn.execute(
            "SELECT COUNT(*) FROM conversations WHERE user_id = ?",
            (user_id,)
        )
        return cursor.fetchone()[0]

def get_user_context_for_followup(user_id: str) -> Dict:
    """获取 Follow-up Call 所需的完整 Context"""
    with get_db_session() as conn:
        memory_repo = MemoryRepository(conn)
        conversation_repo = ConversationRepository(conn)
        
        # 1. 获取本周 TODOs
        todos = memory_repo.get_weekly_todos(user_id, order_by_time=True)
        pending_todos = [t for t in todos if t['status'] == 'pending']
        
        # 2. 获取最近 7 天的 Memories
        memories = memory_repo.get_recent_memories(user_id, days=7)
        
        # 3. 获取 Long-term Memory
        long_term = memory_repo.get_long_term_memory(user_id)
        
        # 4. 获取上次对话摘要
        last_conv = conversation_repo.get_latest_conversation(user_id)
        
        return {
            "todos": pending_todos,
            "memories": memories,
            "long_term_memory": long_term,
            "last_conversation": last_conv
        }
```

### 2. Context 格式化函数

```python
def format_todos(todos: List[Dict]) -> str:
    """格式化 TODOs 为 Agent 可读的文本"""
    if not todos:
        return "No pending TODOs."
    
    lines = []
    for todo in todos[:3]:  # 最多显示 3 个
        lines.append(f"- {todo['title']} ({todo['current_count']}/{todo['target_count']} completed)")
        lines.append(f"  Why: {todo['health_benefit']}")
        lines.append(f"  When: {todo['time_description']}")
    
    return "\n".join(lines)

def format_memories(memories: List[Dict]) -> str:
    """格式化 Memories 为 Agent 可读的文本"""
    if not memories:
        return "No recent conversations."
    
    lines = []
    for mem in memories[:2]:  # 最多显示 2 条
        date = mem['created_at'][:10]
        lines.append(f"[{date}] {mem['summary']}")
    
    return "\n".join(lines)

def format_long_term_memory(ltm: Dict) -> str:
    """格式化 Long-term Memory"""
    if not ltm:
        return "No long-term profile yet."
    
    import json
    
    parts = []
    if ltm.get('health_goals'):
        goals = json.loads(ltm['health_goals']) if isinstance(ltm['health_goals'], str) else ltm['health_goals']
        parts.append(f"Health Goals: {', '.join(goals.values()) if isinstance(goals, dict) else goals}")
    
    if ltm.get('habits'):
        habits = json.loads(ltm['habits']) if isinstance(ltm['habits'], str) else ltm['habits']
        parts.append(f"Habits: {', '.join(f'{k}: {v}' for k, v in habits.items()) if isinstance(habits, dict) else habits}")
    
    return "\n".join(parts) if parts else "No long-term profile yet."
```

### 3. 主函数修改

```python
async def create_intake_web_call(
    user_id: str,
    previous_transcript: Optional[list] = None
) -> Dict[str, Any]:
    """创建 Web Call（支持 Onboarding 和 Follow-up）"""
    
    # 1. 获取用户基础信息
    user_info = await get_cgm_butler_user_info(user_id)
    age = calculate_age(user_info.get('date_of_birth', '1990-01-01'))
    
    # 2. 判断通话类型
    conversation_count = get_user_conversation_count(user_id)
    call_type = "onboarding" if conversation_count == 0 else "follow_up"
    
    # 3. 构建基础变量
    llm_dynamic_variables = {
        "user_name": user_info.get('name', 'there'),
        "user_age": str(age),
        "user_health_goal": user_info.get('health_goal', 'managing your health'),
        "call_type": call_type,
    }
    
    # 4. 根据类型添加 Context
    if call_type == "onboarding":
        llm_dynamic_variables["call_context"] = build_onboarding_context()
    else:
        context_data = get_user_context_for_followup(user_id)
        llm_dynamic_variables["call_context"] = build_followup_context(context_data)
    
    # 5. 创建 Web Call
    retell = get_retell_client()
    metadata = {
        "user_id": user_id,
        "call_type": call_type,  # 记录到 metadata
        "user_name": user_info.get('name', '')
    }
    
    web_call_response = retell.call.create_web_call(
        agent_id=INTAKE_AGENT_ID,
        metadata=metadata,
        retell_llm_dynamic_variables=llm_dynamic_variables
    )
    
    # ... 返回结果
```

---

## 📝 Retell Agent Prompt 设计

### Agent System Prompt（统一）

```
You are Darcy, a warm and empathetic CGM (Continuous Glucose Monitoring) health coach. 
Your role is to help users manage their glucose levels through personalized guidance.

YOUR PHILOSOPHY:
This is a CONVERSATION, not an interrogation. You're here to listen, understand, 
and support - not to check boxes on a form. Let the dialogue flow naturally.

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

The call_type and call_context variables will guide your specific approach 
for this conversation.
```

### Dynamic Context Integration

在 Agent 的 prompt 中使用变量：

```
{{#if call_type == "onboarding"}}
{{call_context}}

OPENING:
Start with: "Hi {{user_name}}! I'm Darcy, your CGM health coach. I'll help you 
manage your glucose through personalized nutrition and lifestyle guidance. To 
get started, what's your main health concern right now?"

STRUCTURE:
This is a 10-15 minute structured conversation with 4 phases:
1. Understand their concerns (2-3 min)
2. Set clear goals (2-3 min)
3. Understand current lifestyle (3-4 min)
4. Create action plan with 2-3 TODOs (3-4 min)

Guide them through each phase naturally. Make smooth transitions between phases.

{{else}}
{{call_context}}

OPENING:
Start by checking on their progress with TODOs. Example: "Hi {{user_name}}! 
Good to talk to you again. How did it go with [first TODO from the list]?"

{{/if}}
```

---

## 🎯 各种 Case 处理

### Case 1: 首次通话，用户很健谈

**场景**: 用户一次性说了很多信息

**处理**:
```
User: "My glucose is high, I skip breakfast, eat lunch at 12:30, dinner at 7, 
      I don't exercise much, and I'm worried about diabetes."

Agent: "I hear you - that's a lot to manage. Let's start with breakfast since 
       you mentioned skipping it. What's the main reason you skip it?"
```

**规则**: 
- 简短确认收到信息
- 选择一个最重要的点深入
- 问一个具体问题

### Case 2: 首次通话，用户话很少

**场景**: 用户回答很简短

**处理**:
```
User: "My glucose is high."

Agent: "Got it. How high are we talking - do you know your recent numbers?"

User: "Around 140."

Agent: "Okay, that's helpful to know. What time of day is it usually highest?"
```

**规则**:
- 用简短的问题引导
- 一次问一个具体的问题
- 循序渐进收集信息

### Case 3: Follow-up，用户完成了 TODO

**场景**: 用户成功完成了目标

**处理**:
```
Agent: "Hi Yijia! How did the breakfast plan go this week?"

User: "I did it 6 out of 7 days! I feel much better."

Agent: "That's fantastic! You're crushing it. Did you notice any changes in 
       your glucose levels?"
```

**规则**:
- 简短庆祝（1 句话）
- 立即问一个相关的问题
- 保持积极和鼓励

### Case 4: Follow-up，用户没完成 TODO

**场景**: 用户遇到困难

**处理**:
```
Agent: "Hi Yijia! How did the breakfast plan go?"

User: "I only did it twice. I was too busy in the mornings."

Agent: "I understand - mornings can be hectic. What would make it easier for 
       you? Maybe we can adjust the plan."
```

**规则**:
- 表示理解（不要批评）
- 问一个具体问题了解障碍
- 提供调整的可能性

### Case 5: Follow-up，用户有新问题

**场景**: 用户想讨论新话题

**处理**:
```
Agent: "Hi Yijia! How did the breakfast plan go?"

User: "It went well, but I have a question about my evening snacks."

Agent: "Great to hear breakfast is working! Sure, what's your question about 
       evening snacks?"
```

**规则**:
- 简短确认原话题
- 立即转向用户的问题
- 保持灵活

### Case 6: 对话中断后恢复

**场景**: 用户之前的通话中断了

**处理**:
```python
# 传入 previous_transcript
llm_dynamic_variables["previous_transcript"] = last_incomplete_transcript
llm_dynamic_variables["call_context"] += """

NOTE: This call was interrupted previously. Resume naturally from where you 
left off. Briefly acknowledge the interruption (1 sentence), then continue.
"""
```

```
Agent: "Hi Yijia! Sorry we got disconnected earlier. You were telling me about 
       your lunch habits - want to continue from there?"
```

---

## 📊 Context 数据量控制

### 数据量限制

为避免 Context 过长，设置限制：

```python
MAX_TODOS_IN_CONTEXT = 3        # 最多显示 3 个 TODO
MAX_MEMORIES_IN_CONTEXT = 2     # 最多显示 2 条最近记忆
MAX_CONTEXT_LENGTH = 2000       # 总 Context 不超过 2000 字符
```

### 优先级排序

**TODOs**:
1. 按时间排序（最紧急的优先）
2. 只显示 pending 状态
3. 最多 3 个

**Memories**:
1. 按时间倒序（最近的优先）
2. 最多 2 条
3. 只显示 summary，不显示完整 extracted_data

**Long-term Memory**:
1. 只显示关键字段（health_goals, habits, concerns）
2. 简化格式，不显示详细的 JSON

---

## 🧪 测试场景

### 测试 1: 首次通话
```
用户: user_new_001（无历史对话）
预期: 
- call_type = "onboarding"
- 开场简短
- 一次问一个问题
```

### 测试 2: 第二次通话（有 TODO）
```
用户: user_001（有 1 次历史对话，有 TODO）
预期:
- call_type = "follow_up"
- 开场询问 TODO 进度
- 加载历史 context
```

### 测试 3: 多次通话（丰富历史）
```
用户: user_001（有 5 次历史对话，多个 TODO）
预期:
- call_type = "follow_up"
- Context 包含最近 2 条 memory
- 只显示前 3 个 TODO
```

---

## 🗄️ 用户状态管理

### 问题：单纯用对话次数判断不够准确

**场景 1**: 用户第一次对话只聊了 2 分钟就挂断了
- 对话次数 = 1
- 但实际上：没有设定目标、没有了解生活方式、没有制定 TODO
- ❌ 问题：下次对话会被当作 Follow-up，但用户信息不完整

**场景 2**: 用户第一次对话非常深入，完成了所有 Onboarding 步骤
- 对话次数 = 1
- 实际上：目标已设定、生活方式已了解、TODO 已制定
- ✅ 正确：下次对话应该是 Follow-up

**结论**: 需要一个 **用户状态表** 来记录 Onboarding 的完成度。

---

### 用户状态表设计

#### 表名: `user_onboarding_status`

```sql
CREATE TABLE IF NOT EXISTS user_onboarding_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id VARCHAR(255) NOT NULL UNIQUE,
    
    -- Onboarding 阶段完成状态
    onboarding_stage VARCHAR(50) NOT NULL DEFAULT 'not_started',
    -- 可选值: 'not_started', 'in_progress', 'completed'
    
    -- Phase 1: Concerns (了解关注点)
    concerns_collected BOOLEAN DEFAULT 0,
    primary_concern TEXT,
    concern_duration TEXT,
    main_worry TEXT,
    
    -- Phase 2: Goals (设定目标)
    goals_set BOOLEAN DEFAULT 0,
    primary_goal TEXT,
    goal_timeline TEXT,
    motivation TEXT,
    baseline_metrics TEXT,  -- JSON: {"fasting_glucose": 140, ...}
    
    -- Phase 3: Lifestyle (了解生活方式)
    lifestyle_collected BOOLEAN DEFAULT 0,
    eating_habits_collected BOOLEAN DEFAULT 0,
    exercise_habits_collected BOOLEAN DEFAULT 0,
    sleep_habits_collected BOOLEAN DEFAULT 0,
    stress_habits_collected BOOLEAN DEFAULT 0,
    
    -- Phase 4: Action Plan (制定行动计划)
    todos_created BOOLEAN DEFAULT 0,
    initial_todos_count INTEGER DEFAULT 0,
    
    -- 完成度评分 (0-100)
    completion_score INTEGER DEFAULT 0,
    -- 计算规则: 
    -- concerns_collected: 15%
    -- goals_set: 25%
    -- lifestyle_collected: 30% (eating:10%, exercise:7%, sleep:7%, stress:6%)
    -- todos_created: 30%
    
    -- 元数据
    onboarding_started_at TIMESTAMP,
    onboarding_completed_at TIMESTAMP,
    last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- 后续阶段（预留）
    engagement_stage VARCHAR(50) DEFAULT 'new_user',
    -- 可选值: 'new_user', 'active', 'at_risk', 'inactive', 'churned'
    
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE INDEX idx_user_onboarding_user_id ON user_onboarding_status(user_id);
CREATE INDEX idx_user_onboarding_stage ON user_onboarding_status(onboarding_stage);
```

---

### 状态判断逻辑

#### 1. Onboarding 完成度计算（重新设计）

**设计理念变化**:
- ❌ 旧思路: 严格的 checklist，必须收集所有字段
- ✅ 新思路: 评估"是否有足够信息来帮助用户"，而不是"是否填满了表格"

```python
def calculate_onboarding_completion(status: Dict) -> int:
    """
    计算 Onboarding 完成度 (0-100)
    
    新的权重分配（更灵活）:
    - Core Understanding (核心理解): 40%
      - Concerns: 20% (为什么来？)
      - Goals: 20% (想要什么？)
    - Actionable Insights (可执行洞察): 40%
      - At least ONE lifestyle area: 20% (至少了解一个生活习惯领域)
      - Action plan (TODOs): 20% (至少有一个行动计划)
    - Depth of Understanding (理解深度): 20%
      - Multiple lifestyle areas: 10% (了解多个生活习惯领域)
      - Motivation clarity: 10% (清楚用户的动机)
    
    核心原则:
    1. 重视质量而非数量
    2. 有 concerns + goals + 1 个 lifestyle area + 1 个 TODO = 80 分（可以进入 follow-up）
    3. 不强制收集所有 lifestyle 信息
    """
    score = 0
    
    # === CORE UNDERSTANDING (40%) ===
    # 这是最重要的：我们理解用户为什么来，想要什么
    
    # Concerns (20%)
    if status['concerns_collected']:
        # 基础分: 有 concern
        score += 10
        # 额外分: 有深度（duration, worry）
        if status.get('concern_duration') or status.get('main_worry'):
            score += 10
    
    # Goals (20%)
    if status['goals_set']:
        # 基础分: 有 goal
        score += 10
        # 额外分: goal 具体且可衡量
        if status.get('goal_timeline') and status.get('baseline_metrics'):
            score += 10
        elif status.get('goal_timeline') or status.get('baseline_metrics'):
            score += 5
    
    # === ACTIONABLE INSIGHTS (40%) ===
    # 我们需要足够的信息来制定行动计划
    
    # At least ONE lifestyle area (20%)
    lifestyle_areas_collected = sum([
        status.get('eating_habits_collected', False),
        status.get('exercise_habits_collected', False),
        status.get('sleep_habits_collected', False),
        status.get('stress_habits_collected', False)
    ])
    
    if lifestyle_areas_collected >= 1:
        score += 20  # 至少有一个领域，就可以开始帮助用户
    
    # Action plan / TODOs (20%)
    if status.get('todos_created'):
        if status.get('initial_todos_count', 0) >= 1:
            score += 20  # 至少有 1 个 TODO 就够了
    
    # === DEPTH OF UNDERSTANDING (20%) ===
    # 额外的深度和广度
    
    # Multiple lifestyle areas (10%)
    if lifestyle_areas_collected >= 2:
        score += 5
    if lifestyle_areas_collected >= 3:
        score += 5  # 总共 10 分
    
    # Motivation clarity (10%)
    if status.get('motivation'):
        score += 10
    
    return min(score, 100)  # 确保不超过 100
```

**新的完成度阈值**:
```python
# 旧阈值（太严格）:
# - < 40: onboarding
# - 40-79: onboarding_continuation  
# - ≥ 80: followup

# 新阈值（更灵活）:
# - < 50: onboarding (基本信息还不够)
# - 50-79: onboarding_continuation (有基础，但需要更多细节)
# - ≥ 80: followup (足够开始持续指导)

def determine_call_type_v2(completion_score: int) -> str:
    """
    基于完成度判断 call type
    """
    if completion_score >= 80:
        # 有 concerns + goals + lifestyle + TODOs
        # 足够开始 follow-up
        return 'followup'
    
    elif completion_score >= 50:
        # 有 concerns + goals + 部分 lifestyle
        # 或 concerns + goals + TODOs（但 lifestyle 不够）
        # 需要继续收集，但已经有基础
        return 'onboarding_continuation'
    
    else:
        # 连基本的 concerns 或 goals 都不清楚
        # 需要从头开始
        return 'onboarding'
```

**完成度示例**:

```python
# 示例 1: 最小可行对话（80 分，可以进入 follow-up）
{
    'concerns_collected': True,        # +10
    'concern_duration': '6 months',    # +10
    'goals_set': True,                 # +10
    'baseline_metrics': '{"glucose": 140}',  # +5
    'eating_habits_collected': True,   # +20 (至少 1 个 lifestyle)
    'todos_created': True,             # +20
    'initial_todos_count': 1,
    'motivation': 'prevent diabetes'   # +10
}
# 总分: 10+10+10+5+20+20+10 = 85 分 → followup ✅

# 示例 2: 短对话（55 分，需要 continuation）
{
    'concerns_collected': True,        # +10
    'main_worry': 'diabetes',          # +10
    'goals_set': True,                 # +10
    'goal_timeline': '3 months',       # +5
    'eating_habits_collected': True,   # +20
    'todos_created': False,            # +0
}
# 总分: 10+10+10+5+20 = 55 分 → onboarding_continuation ✅

# 示例 3: 非常短的对话（30 分，需要 onboarding）
{
    'concerns_collected': True,        # +10
    'goals_set': True,                 # +10
    'eating_habits_collected': False,  # +0
    'todos_created': False,            # +0
}
# 总分: 10+10 = 20 分 → onboarding ✅
```

#### 2. Call Type 判断逻辑（改进版）

```python
def determine_call_type(user_id: str) -> str:
    """
    判断应该使用哪种 Call Type
    
    Returns:
        'onboarding' | 'onboarding_continuation' | 'followup'
    """
    # 1. 获取用户状态
    status = get_user_onboarding_status(user_id)
    
    if not status:
        # 全新用户，创建初始状态
        create_initial_status(user_id)
        return 'onboarding'
    
    # 2. 计算完成度
    completion_score = calculate_onboarding_completion(status)
    
    # 3. 判断逻辑
    if completion_score >= 80:
        # Onboarding 基本完成（允许有一些小项未完成）
        return 'followup'
    
    elif completion_score >= 40:
        # Onboarding 进行中，但还有重要信息缺失
        return 'onboarding_continuation'
    
    else:
        # Onboarding 刚开始或信息严重不足
        return 'onboarding'
```

#### 3. 三种 Call Type 的区别

```python
# 1. onboarding (首次或信息严重不足)
# - 完整的 4-phase 流程
# - 从头开始收集信息
# - 开场白: "Hi Yijia! I'm Darcy, your CGM health coach..."

# 2. onboarding_continuation (Onboarding 进行中)
# - 检查已有信息，只问缺失的部分
# - 开场白: "Hi Yijia! Good to see you again. Last time we talked about [X]. 
#            Let's continue where we left off..."
# - 例如：
#   - 如果已有 concerns 和 goals，但缺 lifestyle → 直接进入 Phase 3
#   - 如果已有 lifestyle，但没有 TODOs → 直接进入 Phase 4

# 3. followup (Onboarding 完成)
# - 检查 TODO 进度
# - 提供持续指导
# - 开场白: "Hi Yijia! How did it go with [TODO]?"
```

---

### 状态更新逻辑

#### 在 MemoryService 中添加状态更新

```python
class MemoryService:
    def process_conversation(
        self,
        user_id: str,
        conversation_id: str,
        channel: str,
        transcript: Any,
        user_name: str = 'User'
    ) -> Dict[str, Any]:
        """
        处理对话后更新用户状态
        """
        # ... 现有的 memory/todo 处理逻辑 ...
        
        # 🆕 更新 Onboarding 状态
        if channel == 'retell_voice':
            self._update_onboarding_status(
                user_id=user_id,
                transcript=transcript,
                extracted_memory=memory_result,
                extracted_todos=todos
            )
        
        return result
    
    def _update_onboarding_status(
        self,
        user_id: str,
        transcript: Any,
        extracted_memory: Dict,
        extracted_todos: List[Dict]
    ):
        """
        根据对话内容更新 Onboarding 状态
        """
        # 1. 获取当前状态
        status = self._get_or_create_status(user_id)
        
        # 2. 分析对话内容，判断哪些信息已收集
        updates = {}
        
        # Phase 1: Concerns
        if self._has_concerns_info(extracted_memory):
            updates['concerns_collected'] = True
            updates['primary_concern'] = extracted_memory.get('primary_concern')
            # ... 提取其他 concern 信息
        
        # Phase 2: Goals
        if self._has_goals_info(extracted_memory):
            updates['goals_set'] = True
            updates['primary_goal'] = extracted_memory.get('primary_goal')
            # ... 提取其他 goal 信息
        
        # Phase 3: Lifestyle
        if self._has_eating_habits(extracted_memory):
            updates['eating_habits_collected'] = True
        if self._has_exercise_habits(extracted_memory):
            updates['exercise_habits_collected'] = True
        if self._has_sleep_habits(extracted_memory):
            updates['sleep_habits_collected'] = True
        if self._has_stress_info(extracted_memory):
            updates['stress_habits_collected'] = True
        
        # Phase 4: TODOs
        if extracted_todos and len(extracted_todos) >= 2:
            updates['todos_created'] = True
            updates['initial_todos_count'] = len(extracted_todos)
        
        # 3. 计算完成度
        new_status = {**status, **updates}
        completion_score = calculate_onboarding_completion(new_status)
        updates['completion_score'] = completion_score
        
        # 4. 更新 onboarding_stage
        if completion_score >= 80:
            updates['onboarding_stage'] = 'completed'
            if not status.get('onboarding_completed_at'):
                updates['onboarding_completed_at'] = datetime.now().isoformat()
        elif completion_score > 0:
            updates['onboarding_stage'] = 'in_progress'
            if not status.get('onboarding_started_at'):
                updates['onboarding_started_at'] = datetime.now().isoformat()
        
        # 5. 保存到数据库
        self._save_status_updates(user_id, updates)
        
        logger.info(f"✅ Onboarding status updated: {completion_score}% complete")
    
    def _has_concerns_info(self, memory: Dict) -> bool:
        """判断是否收集到了 concerns 信息"""
        extracted = memory.get('extracted_data', {})
        return bool(
            extracted.get('glucose_concerns') or
            memory.get('summary', '').find('concern') != -1 or
            memory.get('summary', '').find('worry') != -1
        )
    
    def _has_goals_info(self, memory: Dict) -> bool:
        """判断是否收集到了 goals 信息"""
        summary = memory.get('summary', '').lower()
        return bool(
            'goal' in summary or
            'achieve' in summary or
            'target' in summary or
            'lower' in summary and 'glucose' in summary
        )
    
    def _has_eating_habits(self, memory: Dict) -> bool:
        """判断是否收集到了饮食习惯"""
        extracted = memory.get('extracted_data', {})
        return bool(
            extracted.get('mentioned_foods') or
            extracted.get('discussed_timing', {}).get('breakfast') or
            extracted.get('discussed_timing', {}).get('lunch') or
            extracted.get('discussed_timing', {}).get('dinner')
        )
    
    def _has_exercise_habits(self, memory: Dict) -> bool:
        """判断是否收集到了运动习惯"""
        extracted = memory.get('extracted_data', {})
        summary = memory.get('summary', '').lower()
        return bool(
            extracted.get('mentioned_activities') or
            'exercise' in summary or
            'walk' in summary or
            'workout' in summary
        )
    
    def _has_sleep_habits(self, memory: Dict) -> bool:
        """判断是否收集到了睡眠习惯"""
        summary = memory.get('summary', '').lower()
        return bool(
            'sleep' in summary or
            'bed' in summary or
            'wake' in summary
        )
    
    def _has_stress_info(self, memory: Dict) -> bool:
        """判断是否收集到了压力信息"""
        summary = memory.get('summary', '').lower()
        return bool(
            'stress' in summary or
            'anxious' in summary or
            'worried' in summary
        )
```

---

### Onboarding Continuation Prompt

**新增文件**: `apps/minerva/src/prompts/voice_chat/onboarding_continuation_context.md`

```markdown
This is a CONTINUATION of the user's onboarding. They've started but haven't 
completed all the necessary information gathering.

CURRENT STATUS:
{onboarding_status}

WHAT'S MISSING:
{missing_info}

YOUR MISSION:
1. Warmly acknowledge their previous conversation
2. Briefly recap what you already know
3. Focus on collecting the MISSING information
4. Don't re-ask questions you already have answers to

OPENING:
"Hi {user_name}! Good to see you again. Last time we talked about {last_topic}. 
Let's continue where we left off..."

THEN: Jump directly to the missing phase(s).

CONVERSATION RULES:
- Be concise (2-3 sentences max)
- One question at a time
- Show you remember previous conversation
- Focus only on what's missing
```

---

### 后续用户生命周期阶段

#### Engagement Stage (用户参与度阶段)

在 `user_onboarding_status` 表中的 `engagement_stage` 字段：

```python
# 1. new_user (新用户)
# - Onboarding 刚完成
# - 还没有足够的行为数据
# - 持续时间: 前 2 周

# 2. active (活跃用户)
# - 定期使用 app (每周至少 1 次对话)
# - TODO 完成率 > 50%
# - 持续参与

# 3. at_risk (有流失风险)
# - 2 周没有对话
# - 或 TODO 完成率 < 30%
# - 需要 re-engagement 策略

# 4. inactive (不活跃)
# - 4 周没有对话
# - 需要 win-back 策略

# 5. churned (已流失)
# - 8 周没有对话
# - 可能需要重新 onboarding
```

#### Engagement Stage 判断逻辑

```python
def update_engagement_stage(user_id: str):
    """
    根据用户行为更新参与度阶段
    """
    # 1. 获取用户数据
    last_conversation = get_last_conversation_date(user_id)
    todo_completion_rate = calculate_todo_completion_rate(user_id)
    onboarding_completed_date = get_onboarding_completed_date(user_id)
    
    # 2. 计算天数
    days_since_last_conversation = (datetime.now() - last_conversation).days
    days_since_onboarding = (datetime.now() - onboarding_completed_date).days
    
    # 3. 判断阶段
    if days_since_onboarding <= 14:
        stage = 'new_user'
    
    elif days_since_last_conversation <= 7 and todo_completion_rate >= 0.5:
        stage = 'active'
    
    elif 7 < days_since_last_conversation <= 14 or todo_completion_rate < 0.3:
        stage = 'at_risk'
    
    elif 14 < days_since_last_conversation <= 28:
        stage = 'inactive'
    
    else:  # > 28 days
        stage = 'churned'
    
    # 4. 更新数据库
    update_user_status(user_id, {'engagement_stage': stage})
    
    return stage
```

#### 不同阶段的对话策略

```python
# 1. new_user (新用户)
# - 更多鼓励和支持
# - 详细解释每个建议的原理
# - 频繁 check-in

# 2. active (活跃用户)
# - 正常的 follow-up 对话
# - 庆祝进步
# - 逐步增加挑战

# 3. at_risk (有流失风险)
# - 询问遇到的困难
# - 调整 TODO 难度
# - 提供额外支持

# 4. inactive (不活跃)
# - 主动 outreach (如果有推送功能)
# - 重新评估目标是否合理
# - 简化行动计划

# 5. churned (已流失)
# - 如果回来，视为"重新开始"
# - 简短回顾之前的目标
# - 询问是否需要调整方向
```

---

## 💾 数据保存策略

### Onboarding Call 需要保存的数据

**1. User Goals（保存到 user_long_term_memory）**
```python
# 在 MemoryService 中提取
{
    "health_goals": {
        "primary_goal": "Lower fasting glucose from 140 to 110 mg/dL",
        "timeline": "3 months",
        "motivation": "Prevent diabetes like parents"
    }
}
```

**2. Lifestyle Information（保存到 user_long_term_memory）**
```python
{
    "habits": {
        "breakfast_time": "Usually skips or eats leftovers",
        "lunch_time": "12:30 PM",
        "dinner_time": "7:00 PM, often eats out"
    },
    "exercise_patterns": {
        "frequency": "Once a week",
        "type": "Not specified"
    },
    "sleep_patterns": {
        "bedtime": "Midnight",
        "wake_time": "7:00 AM",
        "duration": "7 hours"
    }
}
```

**3. TODOs（保存到 user_todos）**
```python
[
    {
        "title": "每天早上吃希腊酸奶配坚果",
        "description": "",
        "category": "diet",
        "health_benefit": "稳定全天血糖水平，避免上午饥饿",
        "time_of_day": "08:00-09:00",
        "time_description": "上班前",
        "target_count": 7
    },
    {
        "title": "每周晚饭后散步30分钟（周一、三、五）",
        "description": "",
        "category": "exercise",
        "health_benefit": "提高胰岛素敏感性，帮助控制血糖",
        "time_of_day": "20:00-20:30",
        "time_description": "晚饭后",
        "target_count": 3
    }
]
```

**4. Conversation Summary（保存到 user_memories）**
```python
{
    "summary": "首次 Onboarding 通话。用户主要关注点：血糖偏高（140 mg/dL），
               担心像父母一样发展为糖尿病。设定目标：3个月内将空腹血糖降至110以下。
               当前习惯：经常跳过早餐，午餐12:30，晚餐7点经常外食，每周运动1次，
               睡眠7小时（午夜到早上7点）。制定了2个行动计划：1) 每天吃希腊酸奶配坚果
               作为早餐；2) 每周3次晚饭后散步30分钟（周一、三、五）。",
    "key_topics": ["首次通话", "目标设定", "早餐习惯", "运动计划"],
    "extracted_data": {
        "mentioned_foods": ["Greek yogurt", "nuts", "leftovers"],
        "glucose_concerns": ["高血糖", "糖尿病风险"],
        "user_mood": "motivated"
    }
}
```

### MemoryService 需要增强的提取能力

**新增：提取 Goals**
```python
def _extract_goals(self, transcript: Any) -> Dict[str, Any]:
    """
    从 Onboarding 对话中提取用户目标
    
    Returns:
        {
            "primary_goal": "具体目标描述",
            "timeline": "时间线",
            "motivation": "动机",
            "current_baseline": "当前基线数据"
        }
    """
    # LLM Prompt 提取目标
    pass
```

**增强：提取 Lifestyle 信息**
```python
def _extract_lifestyle(self, transcript: Any) -> Dict[str, Any]:
    """
    从对话中提取生活方式信息
    
    Returns:
        {
            "habits": {...},
            "exercise_patterns": {...},
            "sleep_patterns": {...},
            "stress_patterns": {...}
        }
    """
    # 已有的 _extract_long_term_updates 可以处理
    # 但需要确保 Onboarding 对话中的信息被完整提取
    pass
```

---

## 🔧 Backend 实现方案

### 1. Prompt 文件存储结构

```
apps/minerva/src/prompts/
├── voice_chat/
│   ├── base_system_prompt.md          # 基础 System Prompt（Darcy 的角色定义）
│   ├── onboarding_context.md          # Onboarding 场景的 context
│   ├── followup_context.md            # Follow-up 场景的 context
│   └── README.md                       # Prompt 使用说明
└── prompt_loader.py                    # Prompt 加载和格式化工具
```

**为什么这样设计？**
- ✅ **版本控制**: Prompt 作为代码的一部分，可以追踪变更
- ✅ **易于维护**: 修改 Prompt 不需要改代码，只需编辑 markdown 文件
- ✅ **可测试**: 可以为不同场景准备不同的 Prompt 版本
- ✅ **团队协作**: 产品经理/UX 设计师也可以直接编辑 Prompt

---

### 2. Prompt Loader 实现

**文件**: `apps/minerva/src/prompts/prompt_loader.py`

```python
import os
from pathlib import Path
from typing import Dict, Any, Optional

class VoiceChatPromptLoader:
    """
    Voice Chat Prompt 加载器
    负责加载和格式化不同场景的 Prompt
    """
    
    def __init__(self):
        self.prompts_dir = Path(__file__).parent / "voice_chat"
        self._cache = {}  # 缓存已加载的 prompt
    
    def load_base_system_prompt(self) -> str:
        """
        加载基础 System Prompt（Darcy 的角色定义）
        这部分对所有通话都一样
        """
        if 'base_system' not in self._cache:
            prompt_path = self.prompts_dir / "base_system_prompt.md"
            with open(prompt_path, 'r', encoding='utf-8') as f:
                self._cache['base_system'] = f.read()
        return self._cache['base_system']
    
    def load_onboarding_context(self) -> str:
        """
        加载 Onboarding 场景的 context
        包含 4-phase 结构化对话流程
        """
        if 'onboarding' not in self._cache:
            prompt_path = self.prompts_dir / "onboarding_context.md"
            with open(prompt_path, 'r', encoding='utf-8') as f:
                self._cache['onboarding'] = f.read()
        return self._cache['onboarding']
    
    def load_followup_context(self) -> str:
        """
        加载 Follow-up 场景的 context template
        需要动态填充用户数据
        """
        if 'followup' not in self._cache:
            prompt_path = self.prompts_dir / "followup_context.md"
            with open(prompt_path, 'r', encoding='utf-8') as f:
                self._cache['followup'] = f.read()
        return self._cache['followup']
    
    def build_onboarding_prompt(self, user_name: str) -> Dict[str, str]:
        """
        构建 Onboarding 通话的完整 Prompt
        
        Returns:
            {
                "call_type": "onboarding",
                "call_context": "...",
                "user_name": "Yijia"
            }
        """
        base_prompt = self.load_base_system_prompt()
        onboarding_context = self.load_onboarding_context()
        
        return {
            "call_type": "onboarding",
            "call_context": onboarding_context,
            "user_name": user_name
        }
    
    def build_followup_prompt(
        self, 
        user_name: str,
        weekly_todos: list,
        recent_memories: list,
        long_term_memory: Optional[Dict] = None,
        last_conversation_summary: Optional[str] = None
    ) -> Dict[str, str]:
        """
        构建 Follow-up 通话的完整 Prompt
        动态填充用户的历史数据
        
        Args:
            user_name: 用户名
            weekly_todos: 本周的 TODO 列表
            recent_memories: 最近的对话记忆
            long_term_memory: 长期记忆（goals, habits）
            last_conversation_summary: 上次对话摘要
        
        Returns:
            {
                "call_type": "followup",
                "call_context": "...",  # 已填充用户数据
                "user_name": "Yijia"
            }
        """
        base_prompt = self.load_base_system_prompt()
        followup_template = self.load_followup_context()
        
        # 格式化 TODOs
        todos_text = self._format_todos(weekly_todos)
        
        # 格式化 recent memories
        memories_text = self._format_memories(recent_memories)
        
        # 格式化 long-term memory
        ltm_text = self._format_long_term_memory(long_term_memory) if long_term_memory else ""
        
        # 填充模板
        call_context = followup_template.format(
            todos=todos_text,
            recent_memories=memories_text,
            long_term_memory=ltm_text,
            last_conversation=last_conversation_summary or "No previous conversation"
        )
        
        return {
            "call_type": "followup",
            "call_context": call_context,
            "user_name": user_name
        }
    
    def _format_todos(self, todos: list) -> str:
        """格式化 TODOs 为 prompt 文本"""
        if not todos:
            return "No active TODOs"
        
        formatted = []
        for i, todo in enumerate(todos[:3], 1):  # 只显示前3个
            formatted.append(
                f"{i}. {todo['title']}\n"
                f"   - Target: {todo['target_count']} times/week\n"
                f"   - Completed: {todo['current_count']}/{todo['target_count']}\n"
                f"   - Why: {todo['health_benefit']}"
            )
        return "\n".join(formatted)
    
    def _format_memories(self, memories: list) -> str:
        """格式化 recent memories 为 prompt 文本"""
        if not memories:
            return "No recent conversations"
        
        formatted = []
        for mem in memories[:3]:  # 只显示最近3条
            formatted.append(
                f"- {mem['created_at']}: {mem['summary'][:200]}..."
            )
        return "\n".join(formatted)
    
    def _format_long_term_memory(self, ltm: Dict) -> str:
        """格式化 long-term memory 为 prompt 文本"""
        sections = []
        
        if 'health_goals' in ltm:
            goals = ltm['health_goals']
            sections.append(
                f"HEALTH GOALS:\n"
                f"- Primary Goal: {goals.get('primary_goal', 'Not set')}\n"
                f"- Timeline: {goals.get('timeline', 'Not set')}\n"
                f"- Motivation: {goals.get('motivation', 'Not set')}"
            )
        
        if 'habits' in ltm:
            habits = ltm['habits']
            sections.append(
                f"EATING HABITS:\n"
                f"- Breakfast: {habits.get('breakfast_time', 'Unknown')}\n"
                f"- Lunch: {habits.get('lunch_time', 'Unknown')}\n"
                f"- Dinner: {habits.get('dinner_time', 'Unknown')}"
            )
        
        if 'exercise_patterns' in ltm:
            exercise = ltm['exercise_patterns']
            sections.append(
                f"EXERCISE:\n"
                f"- Frequency: {exercise.get('frequency', 'Unknown')}\n"
                f"- Type: {exercise.get('type', 'Unknown')}"
            )
        
        return "\n\n".join(sections)
```

---

### 3. 数据层实现

**文件**: `apps/minerva/src/services/context_service.py`

```python
from shared.database import get_connection, MemoryRepository, ConversationRepository
from typing import Dict, Any, Optional, List
import json

class VoiceChatContextService:
    """
    Voice Chat Context 服务
    负责获取用户历史数据并构建 context
    """
    
    def __init__(self):
        self.db_conn = get_connection()
        self.memory_repo = MemoryRepository(self.db_conn)
        self.conversation_repo = ConversationRepository(self.db_conn)
    
    def get_user_conversation_count(self, user_id: str) -> int:
        """
        获取用户的对话次数
        用于判断是 onboarding 还是 follow-up
        """
        cursor = self.db_conn.cursor()
        cursor.execute(
            '''
            SELECT COUNT(*) FROM conversations 
            WHERE user_id = ? AND conversation_type = 'retell_voice'
            ''',
            (user_id,)
        )
        count = cursor.fetchone()[0]
        return count
    
    def get_user_context_for_followup(self, user_id: str) -> Dict[str, Any]:
        """
        获取 Follow-up 通话需要的所有用户数据
        
        Returns:
            {
                "weekly_todos": [...],
                "recent_memories": [...],
                "long_term_memory": {...},
                "last_conversation_summary": "..."
            }
        """
        # 1. 获取本周 TODOs
        weekly_todos = self.memory_repo.get_weekly_todos(user_id)
        
        # 2. 获取最近 7 天的 memories
        recent_memories = self.memory_repo.get_recent_memories(
            user_id=user_id,
            days=7,
            limit=3
        )
        
        # 3. 获取 long-term memory
        ltm = self.memory_repo.get_long_term_memory(user_id)
        long_term_memory = json.loads(ltm['memory_data']) if ltm else None
        
        # 4. 获取上次对话摘要
        last_conv = self._get_last_conversation(user_id)
        last_summary = None
        if last_conv and recent_memories:
            # 从 recent_memories 中找到对应的 summary
            for mem in recent_memories:
                if mem['conversation_id'] == last_conv['conversation_id']:
                    last_summary = mem['summary']
                    break
        
        return {
            "weekly_todos": weekly_todos,
            "recent_memories": recent_memories,
            "long_term_memory": long_term_memory,
            "last_conversation_summary": last_summary
        }
    
    def _get_last_conversation(self, user_id: str) -> Optional[Dict]:
        """获取用户的最后一次对话"""
        cursor = self.db_conn.cursor()
        cursor.execute(
            '''
            SELECT * FROM conversations 
            WHERE user_id = ? AND conversation_type = 'retell_voice'
            ORDER BY started_at DESC
            LIMIT 1
            ''',
            (user_id,)
        )
        row = cursor.fetchone()
        if row:
            return dict(row)
        return None
```

---

### 4. 业务逻辑层实现

**文件**: `apps/minerva/src/services/intake_service.py` (修改)

```python
from .context_service import VoiceChatContextService
from ..prompts.prompt_loader import VoiceChatPromptLoader

# 在 create_intake_web_call 中添加逻辑

async def create_intake_web_call(
    user_id: str,
    previous_transcript: Optional[list] = None
) -> Dict[str, Any]:
    """
    创建 CGM Butler App 的 Web Call
    根据用户历史判断是 onboarding 还是 follow-up
    """
    try:
        # 1. 获取用户信息
        user_info = await get_cgm_butler_user_info(user_id)
        user_name = user_info.get('name', 'there')
        
        # 2. 初始化服务
        context_service = VoiceChatContextService()
        prompt_loader = VoiceChatPromptLoader()
        
        # 3. 判断是 onboarding 还是 follow-up
        conversation_count = context_service.get_user_conversation_count(user_id)
        
        if conversation_count == 0:
            # Onboarding Call
            logger.info(f"==== Creating ONBOARDING call for user {user_id}")
            prompt_data = prompt_loader.build_onboarding_prompt(user_name)
        else:
            # Follow-up Call
            logger.info(f"==== Creating FOLLOW-UP call for user {user_id} (conversation #{conversation_count + 1})")
            user_context = context_service.get_user_context_for_followup(user_id)
            prompt_data = prompt_loader.build_followup_prompt(
                user_name=user_name,
                weekly_todos=user_context['weekly_todos'],
                recent_memories=user_context['recent_memories'],
                long_term_memory=user_context['long_term_memory'],
                last_conversation_summary=user_context['last_conversation_summary']
            )
        
        # 4. 构建 Retell 动态变量
        llm_dynamic_variables = {
            "user_name": user_name,
            "call_type": prompt_data['call_type'],
            "call_context": prompt_data['call_context'],
            # 保留原有的用户基本信息
            "user_age": str(calculate_age(user_info.get('date_of_birth', '1990-01-01'))),
            "user_health_goal": user_info.get('health_goal', 'managing your health'),
        }
        
        # 5. 添加历史对话（如果是恢复通话）
        if previous_transcript:
            llm_dynamic_variables["previous_transcript"] = previous_transcript
        
        # 6. 创建 Web Call
        retell = get_retell_client()
        metadata = {
            "user_id": user_id,
            "call_type": prompt_data['call_type'],  # 'onboarding' or 'followup'
            "user_name": user_name
        }
        
        web_call_response = retell.call.create_web_call(
            agent_id=INTAKE_AGENT_ID,
            metadata=metadata,
            retell_llm_dynamic_variables=llm_dynamic_variables
        )
        
        logger.info(f"==== Web call created: {web_call_response.call_id}")
        
        return {
            "status_code": 200,
            "content": {
                "access_token": web_call_response.access_token,
                "call_id": web_call_response.call_id,
                "agent_id": INTAKE_AGENT_ID,
                "call_type": prompt_data['call_type'],
                "message": f"{prompt_data['call_type'].capitalize()} call created successfully"
            }
        }
        
    except Exception as e:
        logger.error(f"==== Failed to create web call: {e}", exc_info=True)
        return {
            "status_code": 500,
            "content": {
                "message": f"Failed to create web call: {str(e)}"
            }
        }
```

---

### 5. Retell Agent 配置

**在 Retell Dashboard 中配置 Agent System Prompt**:

```
You are Darcy, a friendly and professional CGM health coach.

{{call_context}}

IMPORTANT RULES:
1. Be concise - 2-3 sentences maximum per response
2. One question at a time
3. Show empathy and encouragement
4. Natural, conversational tone

User: {{user_name}}
```

**关键点**:
- `{{call_context}}` 会被动态替换为 onboarding 或 follow-up 的 context
- `{{user_name}}` 会被替换为用户名
- 基础规则对所有通话都适用

---

## 📋 实施清单

### Phase 0: 数据库迁移
- [ ] 创建 `user_onboarding_status` 表的迁移脚本
- [ ] 运行迁移，创建表和索引
- [ ] 验证表结构

### Phase 1: Prompt 文件和加载器
- [ ] 创建 `apps/minerva/src/prompts/voice_chat/` 目录
- [ ] 编写 `base_system_prompt.md`
- [ ] 编写 `onboarding_context.md`
- [ ] 编写 `onboarding_continuation_context.md` (新增)
- [ ] 编写 `followup_context.md`
- [ ] 实现 `prompt_loader.py`
  - [ ] `build_onboarding_prompt()`
  - [ ] `build_onboarding_continuation_prompt()` (新增)
  - [ ] `build_followup_prompt()`

### Phase 2: 用户状态管理 (新增)
- [ ] 创建 `OnboardingStatusRepository` (在 `shared/database/repositories/`)
  - [ ] `get_user_status(user_id)`
  - [ ] `create_initial_status(user_id)`
  - [ ] `update_status(user_id, updates)`
  - [ ] `calculate_completion_score(status)`
- [ ] 在 `MemoryService` 中实现状态更新逻辑
  - [ ] `_update_onboarding_status()`
  - [ ] `_has_concerns_info()`
  - [ ] `_has_goals_info()`
  - [ ] `_has_eating_habits()`
  - [ ] `_has_exercise_habits()`
  - [ ] `_has_sleep_habits()`
  - [ ] `_has_stress_info()`

### Phase 3: 数据层
- [ ] 实现 `VoiceChatContextService`
- [ ] 实现 `determine_call_type(user_id)` (改进版，基于状态)
- [ ] 实现 `get_user_context_for_followup()`
- [ ] 实现 `get_user_context_for_continuation()` (新增)
  - [ ] 识别缺失的信息
  - [ ] 格式化已有信息
  - [ ] 生成"继续对话"的 context
- [ ] 测试数据获取逻辑

### Phase 4: 业务逻辑
- [ ] 修改 `create_intake_web_call()` 使用新的判断逻辑
  - [ ] 调用 `determine_call_type()`
  - [ ] 根据 call_type 选择正确的 prompt
  - [ ] 处理 3 种场景: onboarding, onboarding_continuation, followup
- [ ] 集成 `PromptLoader` 和 `ContextService`
- [ ] 测试 3 种 call type 的 prompt 生成

### Phase 5: Agent 配置
- [ ] 更新 Retell Agent 的 System Prompt
- [ ] 测试 `{{call_context}}` 变量替换
- [ ] 验证 3 种场景的开场白
  - [ ] Onboarding (首次)
  - [ ] Onboarding Continuation (信息不完整)
  - [ ] Follow-up (Onboarding 完成)

### Phase 6: MemoryService 增强
- [ ] 增强 `_extract_session_memory()` 提取更详细的信息
  - [ ] 提取 concerns 相关字段
  - [ ] 提取 goals 相关字段
  - [ ] 提取 lifestyle 相关字段
- [ ] 增强 `_extract_long_term_updates()` 保存到正确的字段
- [ ] 在 `process_conversation()` 中调用 `_update_onboarding_status()`
- [ ] 测试状态更新逻辑

### Phase 7: Engagement Stage (可选，后续实现)
- [ ] 实现 `update_engagement_stage(user_id)`
- [ ] 实现 `calculate_todo_completion_rate(user_id)`
- [ ] 添加定时任务定期更新 engagement_stage
- [ ] 根据 engagement_stage 调整对话策略

### Phase 8: 测试
- [ ] 测试 Onboarding 场景（完整 4 个阶段）
  - [ ] 验证状态从 'not_started' → 'in_progress' → 'completed'
  - [ ] 验证 completion_score 正确计算
- [ ] 测试 Onboarding Continuation 场景
  - [ ] 用户第一次对话只聊了 2 分钟
  - [ ] 第二次对话应该继续收集缺失信息
  - [ ] 验证不会重复问已有的信息
- [ ] 测试 Follow-up 场景
  - [ ] Onboarding 完成后的对话
  - [ ] 验证加载历史 TODOs 和 memories
- [ ] 边界情况测试
  - [ ] completion_score = 79 (应该是 onboarding_continuation)
  - [ ] completion_score = 80 (应该是 followup)
  - [ ] 用户中途挂断电话
  - [ ] 用户跳过某些问题
- [ ] 验证数据保存
  - [ ] Goals 和 Lifestyle 信息正确保存
  - [ ] TODOs 正确生成
  - [ ] 状态表正确更新

---

## 🎯 成功标准

### Onboarding Call
1. ✅ 开场白不超过 2 句话
2. ✅ 每次只问 1 个问题
3. ✅ 用户回答后，简短确认（1 句话）+ 下一个问题
4. ✅ 整个对话自然流畅

### Follow-up Call
1. ✅ 开场直接问 TODO 进度
2. ✅ 能引用历史对话内容
3. ✅ 庆祝用户进步（简短）
4. ✅ 对困难表示理解并提供帮助

### 通用
1. ✅ 每次回应不超过 2-3 句话
2. ✅ 对话自然，不机械
3. ✅ 用户感觉被倾听和理解

---

**设计完成日期**: 2025-11-15  
**设计者**: AI Assistant  
**状态**: 待实施

