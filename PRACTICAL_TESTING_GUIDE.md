# Voice Call Context Design - 实际测试指南

## 📊 当前用户状态

你有 2 个现有用户：
1. **user_001 (John Doe)** - 6 次对话（老用户）
2. **user_38377a3b (Yijia Liu)** - 1 次对话（新用户）

这两个用户目前都**没有 onboarding 状态**，这意味着：
- 第一次 Voice Call 会被识别为 **onboarding**
- 系统会根据对话内容自动更新他们的状态
- 后续对话会根据完成度自动切换到 continuation 或 followup

---

## 🎯 实际测试方案

### 测试策略

我们将使用**真实的用户生命周期**来测试：

1. **user_38377a3b (Yijia)** - 模拟新用户的完整 Onboarding 流程
2. **user_001 (John)** - 模拟老用户的 Follow-up 流程

---

## 📋 测试场景 1: 新用户 Onboarding（Yijia）

### 目标
验证系统能够：
- 识别新用户（score = 0）
- 使用自然对话式 Onboarding
- 正确收集信息并更新状态
- 随着对话次数增加，自动切换 Call Type

### 测试步骤

#### 第 1 次对话：Onboarding 开始

**1. 启动服务**
```bash
./start-all.sh
```

**2. 查看当前状态（对话前）**
```bash
sqlite3 storage/databases/cgm_butler.db << 'SQL'
SELECT 
    user_id,
    completion_score,
    onboarding_stage
FROM user_onboarding_status 
WHERE user_id = 'user_38377a3b';
SQL
```

**预期:** 没有记录（或 score = 0）

**3. 发起 Voice Call**
- 在前端登录为 Yijia Liu (user_38377a3b)
- 点击 Voice Chat
- 观察 Minerva 日志

**4. 查看日志（实时）**
```bash
# 在另一个终端窗口
tail -f logs/minerva.log | grep -E "(Call Type|Onboarding status)"
```

**预期日志:**
```
📞 Call Type: onboarding (Score: 0%)
```

**5. 进行对话**

**Agent 开场白应该是:**
> "Hi Yijia! I'm Darcy, your CGM health coach. I'll help you manage your glucose through personalized nutrition and lifestyle guidance. To get started, what's your main health concern right now?"

**你可以这样回答（模拟真实对话）:**
```
You: "我最近血糖一直很高，有点担心。"

Agent 应该:
✅ 简短回应（2-3句话）
✅ 表示同理心
✅ 只问一个 follow-up 问题

例如: "I understand - that's a valid concern. How long has your glucose been high?"
```

**继续对话，自然地分享信息:**
- 你的担忧（concerns）
- 你的目标（goals）
- 你的饮食习惯（eating habits）

**注意观察:**
- ✅ Agent 每次只问一个问题
- ✅ Agent 回应简洁（2-3句话）
- ✅ Agent 表现出同理心
- ❌ Agent 不应该像清单一样机械地问问题

**6. 结束对话后检查状态**
```bash
sqlite3 storage/databases/cgm_butler.db << 'SQL'
-- 查看 onboarding 状态
SELECT 
    user_id,
    completion_score,
    onboarding_stage,
    concerns_collected,
    primary_concern,
    goals_set,
    primary_goal,
    eating_habits_collected
FROM user_onboarding_status 
WHERE user_id = 'user_38377a3b';

-- 查看对话记录
SELECT 
    conversation_id,
    conversation_type,
    started_at,
    ended_at,
    status
FROM conversations 
WHERE user_id = 'user_38377a3b'
ORDER BY started_at DESC 
LIMIT 1;

-- 查看记忆
SELECT 
    summary,
    key_topics,
    created_at
FROM user_memories 
WHERE user_id = 'user_38377a3b'
ORDER BY created_at DESC 
LIMIT 1;

-- 查看 TODOs
SELECT 
    title,
    category,
    health_benefit,
    time_of_day,
    target_count,
    status
FROM user_todos 
WHERE user_id = 'user_38377a3b'
ORDER BY created_at DESC;
SQL
```

**预期结果:**
- `completion_score`: 20-60（取决于你分享了多少信息）
- `onboarding_stage`: 'in_progress'
- `concerns_collected`: 1（如果你提到了担忧）
- `goals_set`: 0 或 1（取决于是否讨论了目标）
- 应该有对话记录、记忆和可能的 TODOs

---

#### 第 2 次对话：Onboarding Continuation

**等待几分钟后（或第二天）**

**1. 查看当前状态**
```bash
sqlite3 storage/databases/cgm_butler.db << 'SQL'
SELECT 
    user_id,
    completion_score,
    onboarding_stage,
    concerns_collected,
    goals_set,
    eating_habits_collected,
    exercise_habits_collected,
    sleep_habits_collected,
    todos_created
FROM user_onboarding_status 
WHERE user_id = 'user_38377a3b';
SQL
```

**假设 score = 40**（已收集 concerns + 部分 goals）

**2. 发起第二次 Voice Call**

**3. 观察日志**
```bash
tail -f logs/minerva.log | grep "Call Type"
```

**预期日志:**
```
📞 Call Type: onboarding_continuation (Score: 40%)
```

**4. 验证 Agent 开场白**

**Agent 应该:**
> "Good to talk to you again! Last time we discussed your high blood sugar concern. How has that been going?"

**关键验证点:**
- ✅ Agent 提到了之前的对话
- ✅ Agent 引用了你之前提到的信息（如 "high blood sugar"）
- ❌ Agent 不应该重新问已经知道的信息

**5. 进行对话**

**Agent 应该聚焦于缺失的信息:**
- 如果还没讨论 goals → 询问目标
- 如果还没讨论 exercise → 询问运动习惯
- 如果还没讨论 sleep → 询问睡眠
- 如果还没创建 TODOs → 讨论行动计划

**你可以这样回答:**
```
Agent: "What are you hoping to achieve with your health in the next few months?"

You: "我希望在 3 个月内把 A1C 降到 6.5 以下。"

Agent 应该:
✅ 承认这个目标
✅ 可能问一些细节
✅ 然后转向其他缺失的信息（如运动、睡眠）
```

**6. 结束对话后检查状态**
```bash
sqlite3 storage/databases/cgm_butler.db << 'SQL'
SELECT 
    user_id,
    completion_score,
    onboarding_stage,
    concerns_collected,
    goals_set,
    eating_habits_collected,
    exercise_habits_collected,
    sleep_habits_collected,
    todos_created,
    initial_todos_count
FROM user_onboarding_status 
WHERE user_id = 'user_38377a3b';
SQL
```

**预期结果:**
- `completion_score`: 应该增加（如 40 → 70）
- 新收集的字段应该被标记为 1
- 可能有新的 TODOs

---

#### 第 3 次对话：完成 Onboarding 或 Follow-up

**如果 score ≥ 80，进入 Follow-up 模式**

**1. 查看状态**
```bash
sqlite3 storage/databases/cgm_butler.db << 'SQL'
SELECT 
    user_id,
    completion_score,
    onboarding_stage
FROM user_onboarding_status 
WHERE user_id = 'user_38377a3b';
SQL
```

**假设 score = 85**

**2. 发起第三次 Voice Call**

**3. 观察日志**
```
📞 Call Type: followup (Score: 85%)
```

**4. 验证 Agent 开场白**

**Agent 应该:**
> "Hey Yijia! How have things been going?"

或

> "Good to hear from you! How did the breakfast routine go this week?"

**关键验证点:**
- ✅ Agent 更加轻松、个性化
- ✅ Agent 可能直接询问 TODOs 进度
- ✅ Agent 像老朋友一样
- ❌ Agent 不应该再收集基础信息

**5. 进行对话**

**Agent 应该:**
- 检查 TODOs 进度
- 询问是否有新的关注点
- 提供支持和鼓励
- 根据你的反馈调整计划

**你可以这样回答:**
```
Agent: "How did the breakfast routine go this week?"

You: "我这周吃了 5 天早餐，有 2 天忘了。"

Agent 应该:
✅ 庆祝进步（"That's great progress! 5 out of 7 is excellent!"）
✅ 询问障碍（"What got in the way on those 2 days?"）
✅ 提供支持（"What would help you hit 7 out of 7?"）
❌ 不应该批评或责备
```

---

## 📋 测试场景 2: 老用户 Follow-up（John）

### 目标
验证系统能够为已有对话历史的用户提供个性化支持

### 测试步骤

#### 准备：为 John 设置 Onboarding 完成状态

**1. 手动创建 John 的 onboarding 状态（模拟已完成）**
```bash
sqlite3 storage/databases/cgm_butler.db << 'SQL'
-- 创建完成的 onboarding 状态
INSERT INTO user_onboarding_status (
    user_id,
    onboarding_stage,
    completion_score,
    concerns_collected,
    primary_concern,
    goals_set,
    primary_goal,
    eating_habits_collected,
    exercise_habits_collected,
    sleep_habits_collected,
    todos_created,
    initial_todos_count,
    onboarding_completed_at
) VALUES (
    'user_001',
    'completed',
    100,
    1,
    'Managing diabetes and weight',
    1,
    'Lower A1C to 6.5 and lose 10 pounds',
    1,
    1,
    1,
    1,
    3,
    datetime('now')
);

-- 添加一些 TODOs
INSERT INTO user_todos (
    user_id,
    conversation_id,
    title,
    category,
    health_benefit,
    time_of_day,
    time_description,
    target_count,
    current_count,
    status
) VALUES 
(
    'user_001',
    'conv_john_1',
    '每天早上 7 点前吃早餐（鸡蛋+全麦面包）',
    'diet',
    '稳定上午血糖，避免午餐前低血糖',
    '06:30-07:00',
    '起床后',
    7,
    4,
    'pending'
),
(
    'user_001',
    'conv_john_1',
    '每周运动 3 次，每次 30 分钟（快走）',
    'exercise',
    '提高胰岛素敏感性，帮助控制血糖和体重',
    '18:00-19:00',
    '晚饭后',
    3,
    1,
    'pending'
),
(
    'user_001',
    'conv_john_1',
    '每晚 10:30 前上床睡觉',
    'sleep',
    '改善睡眠质量，帮助血糖调节和体重管理',
    '22:00-22:30',
    '睡前',
    7,
    5,
    'pending'
);

-- 添加一些记忆
INSERT INTO user_memories (
    user_id,
    conversation_id,
    channel,
    summary,
    key_topics,
    created_at
) VALUES (
    'user_001',
    'conv_john_1',
    'retell_voice',
    'John 提到他早上经常因为赶时间跳过早餐，导致上午血糖不稳定。我们讨论了简单的早餐方案，他承诺尝试提前准备鸡蛋和全麦面包。他还提到想通过运动和饮食控制来减重，目标是 3 个月内减 10 磅。',
    '["早餐习惯", "血糖管理", "减重目标", "运动计划"]',
    datetime('now', '-3 days')
);
SQL
```

**2. 验证状态**
```bash
sqlite3 storage/databases/cgm_butler.db << 'SQL'
SELECT 
    user_id,
    completion_score,
    onboarding_stage,
    primary_concern,
    primary_goal
FROM user_onboarding_status 
WHERE user_id = 'user_001';

SELECT 
    title,
    target_count,
    current_count,
    status
FROM user_todos 
WHERE user_id = 'user_001';
SQL
```

#### 第 1 次 Voice Call（Follow-up 模式）

**1. 发起 Voice Call**
- 在前端登录为 John Doe (user_001)
- 点击 Voice Chat

**2. 观察日志**
```bash
tail -f logs/minerva.log | grep "Call Type"
```

**预期日志:**
```
📞 Call Type: followup (Score: 100%)
```

**3. 验证 Agent 开场白**

**Agent 应该:**
> "Hey John! How have things been going?"

或

> "Good to hear from you! How did the breakfast routine go this week?"

**关键验证点:**
- ✅ Agent 直接切入主题
- ✅ Agent 可能提到 TODOs（早餐、运动、睡眠）
- ✅ Agent 像老朋友一样，不再收集基础信息

**4. 进行对话**

**测试对话示例:**
```
Agent: "How did the breakfast routine go this week?"

You: "I managed to eat breakfast 4 out of 7 days. The other days I was running late."

Agent 应该:
✅ "That's good progress! 4 out of 7 is a solid start."
✅ "What usually makes you run late on those mornings?"
✅ 提供支持和建议

You: "Usually when I stay up late the night before."

Agent 应该:
✅ 连接到睡眠 TODO
✅ "I see. How's the bedtime routine going? You mentioned trying to sleep by 10:30."
```

**5. 结束对话后检查状态**
```bash
sqlite3 storage/databases/cgm_butler.db << 'SQL'
-- 查看新的记忆
SELECT 
    summary,
    created_at
FROM user_memories 
WHERE user_id = 'user_001'
ORDER BY created_at DESC 
LIMIT 1;

-- 查看 TODOs（应该没有新增，除非讨论了新的行动计划）
SELECT 
    title,
    target_count,
    current_count,
    status,
    created_at
FROM user_todos 
WHERE user_id = 'user_001'
ORDER BY created_at DESC;
SQL
```

---

## 🔍 关键验证点总结

### 对于 Yijia (新用户)

| 对话次数 | 预期 Call Type | 预期 Score | 验证重点 |
|---------|---------------|-----------|---------|
| 第 1 次 | onboarding | 0 → 30-60 | 自然对话式信息收集 |
| 第 2 次 | onboarding_continuation | 40-70 | 不重复已知信息 |
| 第 3 次 | followup (如果 ≥80) | 80-100 | 个性化支持 |

### 对于 John (老用户)

| 对话次数 | 预期 Call Type | 预期 Score | 验证重点 |
|---------|---------------|-----------|---------|
| 第 1 次 | followup | 100 | 检查 TODOs 进度 |
| 第 2 次 | followup | 100 | 持续支持和调整 |

---

## 📊 实时监控命令

**在测试过程中，打开多个终端窗口:**

**终端 1: 服务日志**
```bash
tail -f logs/minerva.log | grep -E "(Call Type|Onboarding status|Memory processing)"
```

**终端 2: 数据库监控**
```bash
# 创建一个监控脚本
cat > monitor_status.sh << 'SCRIPT'
#!/bin/bash
while true; do
    clear
    echo "=== Onboarding Status ==="
    sqlite3 storage/databases/cgm_butler.db << 'SQL'
SELECT 
    user_id,
    completion_score,
    onboarding_stage,
    concerns_collected,
    goals_set,
    eating_habits_collected,
    todos_created
FROM user_onboarding_status 
WHERE user_id IN ('user_001', 'user_38377a3b');
SQL
    echo ""
    echo "=== Recent Conversations ==="
    sqlite3 storage/databases/cgm_butler.db << 'SQL'
SELECT 
    user_id,
    conversation_type,
    started_at,
    status
FROM conversations 
WHERE user_id IN ('user_001', 'user_38377a3b')
ORDER BY started_at DESC 
LIMIT 5;
SQL
    sleep 5
done
SCRIPT

chmod +x monitor_status.sh
./monitor_status.sh
```

---

## ✅ 成功标准

### Yijia 的测试成功标准

**第 1 次对话后:**
- [ ] 日志显示 `Call Type: onboarding (Score: 0%)`
- [ ] Agent 使用自然对话式开场
- [ ] Agent 每次只问一个问题
- [ ] `completion_score` > 0
- [ ] 至少有 1 个字段被标记为收集（concerns/goals/eating_habits）
- [ ] 有对话记录和记忆

**第 2 次对话后:**
- [ ] 日志显示 `Call Type: onboarding_continuation`
- [ ] Agent 提到之前的对话
- [ ] Agent 不重复已知信息
- [ ] `completion_score` 增加
- [ ] 新的字段被标记为收集

**第 3 次对话后（如果 score ≥ 80）:**
- [ ] 日志显示 `Call Type: followup`
- [ ] Agent 更加个性化
- [ ] Agent 检查 TODOs 进度
- [ ] `onboarding_stage` = 'completed'

### John 的测试成功标准

**第 1 次对话后:**
- [ ] 日志显示 `Call Type: followup (Score: 100%)`
- [ ] Agent 直接询问 TODOs 进度
- [ ] Agent 提到之前的对话和目标
- [ ] Agent 提供支持和鼓励
- [ ] 有新的记忆记录

---

## 🐛 如果出现问题

### 问题 1: Call Type 始终是 onboarding

**可能原因:**
- `user_onboarding_status` 表没有记录
- `completion_score` 没有正确计算

**解决方法:**
```bash
# 检查状态
sqlite3 storage/databases/cgm_butler.db << 'SQL'
SELECT * FROM user_onboarding_status WHERE user_id = 'user_38377a3b';
SQL

# 如果没有记录，检查日志
grep "Onboarding status updated" logs/minerva.log
```

### 问题 2: Agent 对话不符合预期

**可能原因:**
- Retell LLM 配置未生效
- `call_context` 变量未传递

**解决方法:**
```bash
# 检查 LLM 配置
python3 << 'PYEOF'
import os
from retell import Retell
from dotenv import load_dotenv

load_dotenv()
client = Retell(api_key=os.getenv("RETELL_API_KEY"))
llm = client.llm.retrieve(llm_id="llm_e54c307ce74090cdfd06f682523b")

print("General Prompt 包含 call_context:")
print("{{call_context}}" in llm.general_prompt)
PYEOF

# 检查动态变量
grep "call_context" logs/minerva.log
```

---

## 🚀 开始测试

```bash
# 1. 启动服务
./start-all.sh

# 2. 打开监控（新终端）
tail -f logs/minerva.log | grep "Call Type"

# 3. 打开前端
open http://localhost:5173

# 4. 开始第一个测试（Yijia - 新用户）
# 登录为 Yijia Liu (user_38377a3b)
# 点击 Voice Chat

# 5. 进行真实对话，观察 Agent 行为

# 6. 结束后检查数据库
sqlite3 storage/databases/cgm_butler.db << 'SQL'
SELECT * FROM user_onboarding_status WHERE user_id = 'user_38377a3b';
SQL
```

祝测试顺利！🎉

