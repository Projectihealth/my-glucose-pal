# Olivia 优化总结报告

## 📋 问题分析

### 1. **老用户仍然收到新用户开场白的问题**

#### 根本原因
代码虽然正确地为老用户选择了 `olivia_returning_user_prompt.txt`，但 **`begin_message` 没有被更新**。

**问题代码位置：** `apps/minerva/src/routers/intake_phone_agent/service.py` 第 655 行

```python
await update_llm_settings(
    llm_id=selected_llm_id,
    prompt_path=selected_prompt_path,
    use_default_begin_message=False  # ❌ 这导致 begin_message 不更新
)
```

**为什么会这样？**
- `use_default_begin_message=False` 意味着"不更新 begin_message"
- Retell LLM 保留了之前配置的 `begin_message`（新用户的完整介绍）
- 即使 `general_prompt` 更新为老用户版本，开场白仍然是新用户的

#### 修复方案
根据用户类型动态生成不同的 `begin_message`：

**新用户开场白：**
```
Hi Yijia! I'm Olivia, and I'm really glad you're here.

Managing health is hard. The numbers, the patterns, the "what should I eat?" questions - it can feel really lonely.

But here's what I want you to know: you don't have to do this alone anymore. I'm here to help you make sense of it all, to remember what matters to you, and to support you through the good days and the tough ones.

Not as an app. As a companion who actually gets it.

So... how are you feeling today?
```

**老用户开场白：**
```
Hey Yijia! Nice to talk with you again. How are you doing today?
```

---

### 2. **对话中发现的其他问题**

基于你提供的对话文本，发现以下需要优化的地方：

#### ❌ 问题 1: 信息过载 (Information Overload)

**对话片段：**
```
user: Can you tell me how is my CGM data performing?

agent: Yes! Your glucose is looking really good right now - you're at 109 mg/dL, which is in the normal range and stable.

Here's what stands out to me:

The good news: Your 24-hour average is 112.9 with 98% time in range - that's excellent control! Your overnight numbers are great at 99.3, and you're very stable with no low or high episodes in the past 24 hours.

One thing to watch: Your 7-day average went up about 6.5 points from last week. Not a huge jump, but worth paying attention to. I also notice lunch tends to run a bit higher at 131.9 compared to your other meals.

user: Overwhelming with me with all those data
user: You just put everything to me at once, and I don't know.
user: don't understand many things.
```

**问题：** Olivia 一次性抛出太多数据，用户明确表示"overwhelming"。

**优化方案：** 在 prompt 中添加"分层信息披露"策略：

```
Layer 1 (Start Simple):
- Share ONE key insight first
- Example: "Your glucose is 109 right now - looking good!"
- STOP and wait for their response

Layer 2 (If they want more):
- Add ONE more detail based on their question
- Ask if they want to know more

Layer 3 (Only if they ask):
- Share deeper patterns or comparisons
```

#### ❌ 问题 2: 频繁的空响应

**对话片段：**
```
user: Hello?
agent: .

user: Hi.
agent: .
```

**问题：** 多次出现 `agent: .` 的空响应，用户需要主动催促。

**可能原因：**
- LLM 生成延迟
- 系统没有正确处理空响应
- Retell 的语音识别可能有延迟

**优化方案：** 在 prompt 中添加明确指示：

```
🚨 NEVER Send Empty Responses:
- ALWAYS have substantive content in your response
- If you need a moment to think, use natural fillers: "Let me think about that..."
- If the user says "Hello?" or "Hi?" - they're waiting for you. Say something meaningful!
- ❌ NEVER respond with just "." or empty content
- ✅ ALWAYS respond with at least one complete sentence
```

#### ⚠️ 问题 3: 边界处理可以更温和

**对话片段：**
```
agent: But Yijia, I need to be real with you - I'm a health coach, not a career counselor. For the work situation, talking to a mentor or career advisor might help you more than I can.

What I can help with is managing the stress so it doesn't wreck your health. The sleep, the stress eating - that's where we can work together. Does that make sense?
```

**问题：** 虽然正确识别了超出职责范围的话题，但转换略显生硬。

**优化方案：** 使用"Acknowledge → Redirect → Offer"框架：

```
✅ GOOD: "That work situation sounds really frustrating - six months in limbo is tough. I'm not a career expert, but I can definitely help with how the stress is affecting your health. The stress eating, the sleep issues - that's where we can work together. Sound good?"
```

#### ❌ 问题 4: 目标调整不够灵活

**对话片段：**
```
user: The second one is not that manageable.

agent: Got it! Let's do the first and third then.
```

**问题：** 直接放弃目标，没有询问原因或提供替代方案。

**优化方案：** 使用协作式目标设定：

```
Step 1: Understand their capacity
- Ask: "What makes that one feel hard? Maybe we can adjust it?"

Step 2: Offer alternatives, not abandonment
- "The 8pm worry time feels hard? What about just 5 minutes before bed instead?"

Step 3: Build in flexibility
- "Let's try this for a week and see how it goes. We can always adjust!"
```

---

## 🔧 已实施的修复

### 1. 修复 `begin_message` 逻辑

**文件：** `apps/minerva/src/routers/intake_phone_agent/service.py`

**修改内容：**
```python
# 步骤 5.5: 根据用户类型选择对应的prompt并更新LLM
selected_begin_message = None  # 根据用户类型动态设置开场白

if agent_preference == 'oliver':
    # Oliver暂时还用旧的prompt
    selected_prompt_path = OLIVIA_PROMPT_PATH
    selected_llm_id = OLIVER_LLM_ID
    selected_begin_message = None  # 使用默认文件
else:
    # Olivia根据新/老用户选择不同的prompt和开场白
    if is_new_user:
        selected_prompt_path = OLIVIA_NEW_USER_PROMPT_PATH
        # 新用户：使用完整的介绍开场白
        first_name = user_name.split()[0] if user_name else "there"
        selected_begin_message = f"""Hi {first_name}! I'm Olivia, and I'm really glad you're here.

Managing health is hard. The numbers, the patterns, the "what should I eat?" questions - it can feel really lonely.

But here's what I want you to know: you don't have to do this alone anymore. I'm here to help you make sense of it all, to remember what matters to you, and to support you through the good days and the tough ones.

Not as an app. As a companion who actually gets it.

So... how are you feeling today?"""
        logger.info(f"==== Using NEW USER prompt for Olivia with full introduction")
    else:
        selected_prompt_path = OLIVIA_RETURNING_USER_PROMPT_PATH
        # 老用户：使用简短的欢迎回来开场白
        first_name = user_name.split()[0] if user_name else "there"
        selected_begin_message = f"Hey {first_name}! Nice to talk with you again. How are you doing today?"
        logger.info(f"==== Using RETURNING USER prompt for Olivia with casual greeting")
    selected_llm_id = INTAKE_LLM_ID

# 动态更新LLM的prompt和begin_message
logger.info(f"==== Updating LLM {selected_llm_id} with prompt: {selected_prompt_path}")
try:
    await update_llm_settings(
        llm_id=selected_llm_id,
        prompt_path=selected_prompt_path,
        begin_message=selected_begin_message,  # ✅ 传入动态生成的开场白
        use_default_begin_message=(selected_begin_message is None)  # 只有 Oliver 使用默认文件
    )
except Exception as e:
    logger.error(f"==== Failed to update LLM settings: {e}")
```

### 2. 优化 `olivia_returning_user_prompt.txt`

**文件：** `apps/minerva/src/routers/intake_phone_agent/prompts/olivia_returning_user_prompt.txt`

**添加的优化：**

#### A. 分层信息披露策略
```markdown
## 🚨 CRITICAL: AVOID INFORMATION OVERLOAD

**When sharing CGM data, use the "Layered Approach":**

Layer 1 (Start Simple):
- Share ONE key insight first
- Example: "Your glucose is 109 right now - looking good!"
- STOP and wait for their response

Layer 2 (If they want more):
- Add ONE more detail based on their question
- Ask if they want to know more

Layer 3 (Only if they ask):
- Share deeper patterns or comparisons
```

#### B. 禁止空响应
```markdown
### 🚨 NEVER Send Empty Responses:
- ALWAYS have substantive content in your response
- If you need a moment to think, use natural fillers: "Let me think about that..."
- If the user says "Hello?" or "Hi?" - they're waiting for you. Say something meaningful!
- ❌ NEVER respond with just "." or empty content
- ✅ ALWAYS respond with at least one complete sentence
```

#### C. 协作式目标设定
```markdown
### 4. Goal Setting & Action Plans

**Step 1: Understand their capacity**
- If they say something is "not manageable" - ask why!
  - ❌ BAD: "Got it! Let's drop that one then."
  - ✅ GOOD: "What makes that one feel hard? Maybe we can adjust it?"

**Step 2: Offer alternatives, not abandonment**
- If they can't do a goal, suggest modifications
- Example: "The 8pm worry time feels hard? What about just 5 minutes before bed instead?"

**Step 3: Keep it simple and achievable**
- Start with 1-2 goals maximum
- Make them specific and measurable

**Step 4: Build in flexibility**
- "Let's try this for a week and see how it goes. We can always adjust!"
```

#### D. 更温和的边界处理
```markdown
## BOUNDARIES & SCOPE

**When user asks about topics OUTSIDE your scope:**

Use the "Acknowledge → Redirect → Offer" framework:

1. Acknowledge - Show you heard them
2. Redirect - Gently clarify your role
3. Offer - Bring it back to health impact

**Examples:**

Career stress:
✅ GOOD: "That work situation sounds really frustrating - six months in limbo is tough. I'm not a career expert, but I can definitely help with how the stress is affecting your health. The stress eating, the sleep issues - that's where we can work together. Sound good?"

Skin/acne issues:
✅ GOOD: "I hear you - sudden acne is stressful! For skin stuff, a dermatologist would know best. But stress and diet can definitely affect your skin, so the changes we're making might help. Let's focus on managing the stress and see if that helps?"
```

---

## 🧪 测试验证

### 测试脚本
创建了 `apps/minerva/test_begin_message_fix.py` 用于验证修复。

**运行方式：**
```bash
cd /Users/yijialiu/Desktop/my-glucose-pal
python -m apps.minerva.test_begin_message_fix
```

### 手动测试步骤

1. **重启 Minerva 服务**
   ```bash
   cd /Users/yijialiu/Desktop/my-glucose-pal
   ./stop-all.sh
   ./start-all.sh
   ```

2. **在前端启动语音通话**
   - 使用 `user_38377a3b` (Yijia Liu - 老用户)
   - 观察 Olivia 的开场白

3. **预期结果**
   - ✅ 老用户应该听到: "Hey Yijia! Nice to talk with you again. How are you doing today?"
   - ❌ 不应该听到完整的新用户介绍

4. **检查日志**
   ```bash
   tail -f /Users/yijialiu/Desktop/my-glucose-pal/logs/minerva.log
   ```
   
   应该看到：
   ```
   INFO:src.services.intake_service:==== User type: is_new_user=false, has_history=True, score=70
   INFO:src.services.intake_service:==== Using RETURNING USER prompt for Olivia with casual greeting
   INFO:src.services.intake_service:==== Updating LLM llm_e54c307ce74090cdfd06f682523b with prompt: .../olivia_returning_user_prompt.txt
   INFO:src.services.intake_service:==== Using custom begin_message: Hey Yijia! Nice to talk with you again...
   INFO:src.services.intake_service:==== LLM settings updated successfully
   ```

---

## 📊 优化效果对比

### Before (优化前)

**开场白：**
```
❌ 老用户仍然收到新用户的完整介绍：
"Hi Yijia Liu! I'm Olivia, and I'm really glad you're here.
Managing health is hard. The numbers, the patterns..."
```

**CGM 数据分享：**
```
❌ 信息过载：
"Your glucose is 109 mg/dL, which is normal and stable. Your 24-hour average is 112.9 with 98% time in range. Your overnight numbers are 99.3, and you're very stable with no low or high episodes. Your 7-day average went up 6.5 points from last week. Lunch runs higher at 131.9..."

用户反应: "Overwhelming with me with all those data"
```

**目标调整：**
```
❌ 直接放弃：
User: "The second one is not manageable."
Agent: "Got it! Let's do the first and third then."
```

### After (优化后)

**开场白：**
```
✅ 老用户收到简短的欢迎：
"Hey Yijia! Nice to talk with you again. How are you doing today?"
```

**CGM 数据分享：**
```
✅ 分层披露：
"Your glucose is 109 right now - looking good! Want to hear about your overall trends?"
[等待用户回应]
"Your 24h average is 112.9 with 98% time in range. The main thing I notice is lunch tends to run higher. What do you usually eat for lunch?"
```

**目标调整：**
```
✅ 协作调整：
User: "The second one is not manageable."
Agent: "What makes that one feel hard? Maybe we can adjust it? Like instead of 8pm, what about doing it right before bed - just 5 minutes?"
```

---

## 🎯 关键改进点总结

| 问题 | 原因 | 解决方案 | 状态 |
|------|------|----------|------|
| 老用户收到新用户开场白 | `begin_message` 未更新 | 动态生成不同的 `begin_message` | ✅ 已修复 |
| 信息过载 | 一次性抛出所有数据 | 分层信息披露策略 | ✅ 已优化 |
| 空响应 | LLM 生成空内容 | 明确禁止空响应 | ✅ 已优化 |
| 边界处理生硬 | 直接拒绝话题 | "Acknowledge → Redirect → Offer" 框架 | ✅ 已优化 |
| 目标调整不灵活 | 直接放弃目标 | 协作式目标设定 | ✅ 已优化 |

---

## 📝 后续建议

### 1. 监控和迭代
- 收集用户反馈，特别是关于开场白和信息量的反馈
- 监控日志，确认 `begin_message` 更新成功率
- 跟踪空响应的发生频率

### 2. 进一步优化方向
- **个性化开场白：** 根据用户的活跃 todos 或最近话题定制开场白
  - 例如: "Hey Yijia! How's that protein-first lunch goal going?"
- **智能信息量控制：** 根据用户的历史反应动态调整信息详细程度
- **更好的错误处理：** 如果 LLM 更新失败，使用备用方案

### 3. 需要关注的边缘情况
- 新用户第一次通话后立即第二次通话（可能还被判定为新用户）
- 用户切换 agent (Olivia ↔ Oliver) 时的 prompt 和 begin_message
- 长时间未使用后再次使用（是否仍算老用户？）

---

## 🔗 相关文件

- **Service 层：** `apps/minerva/src/routers/intake_phone_agent/service.py`
- **Returning User Prompt：** `apps/minerva/src/routers/intake_phone_agent/prompts/olivia_returning_user_prompt.txt`
- **New User Prompt：** `apps/minerva/src/routers/intake_phone_agent/prompts/olivia_new_user_prompt.txt`
- **测试脚本：** `apps/minerva/test_begin_message_fix.py`
- **日志文件：** `logs/minerva.log`

---

**最后更新：** 2025-12-03
**修复者：** AI Assistant
**测试状态：** ⏳ 待用户验证


