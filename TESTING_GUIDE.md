# Voice Call Context Design - 测试指南

## ✅ 配置完成

Retell Agent 已通过代码成功配置！

- ✅ LLM System Prompt 已更新
- ✅ 包含 `{{call_context}}` 动态变量
- ✅ 支持 3 种 Call Type (Onboarding / Continuation / Follow-up)

---

## 🧪 测试准备

### 1. 启动所有服务

```bash
cd /Users/yijialiu/Desktop/my-glucose-pal
./start-all.sh
```

**验证服务启动:**
- ✅ Frontend: http://localhost:5173
- ✅ Backend (Flask): http://localhost:5000
- ✅ Minerva (FastAPI): http://localhost:8080

### 2. 准备测试用户

你需要 3 个不同状态的用户来测试 3 种场景：

| 用户类型 | User ID | Completion Score | Call Type | 说明 |
|---------|---------|------------------|-----------|------|
| 新用户 | `test_user_new` | 0 | onboarding | 首次对话 |
| 部分完成 | `test_user_partial` | 50-79 | onboarding_continuation | 已有部分信息 |
| 已完成 | `test_user_complete` | ≥80 | followup | 完成 Onboarding |

**创建测试用户（如果需要）:**

```bash
# 方法 1: 通过前端注册
# 访问 http://localhost:5173 并注册新用户

# 方法 2: 直接在数据库中创建（用于测试）
sqlite3 storage/databases/cgm_butler.db << 'SQL'
-- 创建新用户
INSERT INTO users (user_id, name, date_of_birth, health_goal) 
VALUES ('test_user_new', 'Test User New', '1990-01-01', 'Managing glucose levels');

-- 创建部分完成用户
INSERT INTO users (user_id, name, date_of_birth, health_goal) 
VALUES ('test_user_partial', 'Test User Partial', '1990-01-01', 'Managing glucose levels');

-- 创建已完成用户
INSERT INTO users (user_id, name, date_of_birth, health_goal) 
VALUES ('test_user_complete', 'Test User Complete', '1990-01-01', 'Managing glucose levels');

-- 为部分完成用户设置状态（score = 60）
INSERT INTO user_onboarding_status (
    user_id, onboarding_stage, completion_score,
    concerns_collected, primary_concern,
    goals_set, primary_goal,
    eating_habits_collected
) VALUES (
    'test_user_partial', 'in_progress', 60,
    1, 'High blood sugar',
    1, 'Lower A1C',
    1
);

-- 为已完成用户设置状态（score = 100）
INSERT INTO user_onboarding_status (
    user_id, onboarding_stage, completion_score,
    concerns_collected, primary_concern,
    goals_set, primary_goal,
    eating_habits_collected, exercise_habits_collected,
    todos_created, initial_todos_count
) VALUES (
    'test_user_complete', 'completed', 100,
    1, 'High blood sugar',
    1, 'Lower A1C to 6.5',
    1, 1,
    1, 2
);
SQL
```

---

## 📋 测试场景

### 场景 1: Onboarding（新用户首次对话）

**目标:** 验证 Agent 使用自然对话式 Onboarding

**测试步骤:**

1. **启动 Voice Call**
   ```bash
   # 在前端点击 Voice Chat
   # 或使用 user_id: test_user_new
   ```

2. **验证 Agent 开场白**
   - ✅ 应该简洁友好（不超过 2-3 句话）
   - ✅ 应该介绍自己是 Darcy
   - ✅ 应该说明是 CGM health coach
   - ❌ 不应该有长篇大论
   - ❌ 不应该立即进入"第一阶段"之类的机械式流程

   **期望开场白示例:**
   > "Hi there! I'm Darcy, your CGM health coach. I'll help you manage your glucose through personalized nutrition and lifestyle guidance. To get started, what's your main health concern right now?"

3. **验证对话流程**
   
   **测试对话示例:**
   
   ```
   User: "My glucose has been high lately."
   
   Agent 应该:
   ✅ 简短回应（2-3句话）
   ✅ 表示同理心
   ✅ 只问一个follow-up问题
   
   期望回应:
   "I understand - that's a valid concern. How long has your glucose been high?"
   
   ❌ 不应该:
   - 问多个问题
   - 给出医疗建议
   - 立即转到下一个话题
   ```

4. **验证信息收集**
   
   Agent 应该自然地收集以下信息（不需要按顺序）:
   - [ ] Concerns（用户的担忧）
   - [ ] Goals（用户的目标）
   - [ ] Eating habits（饮食习惯）
   - [ ] Exercise habits（运动习惯）
   - [ ] Sleep habits（睡眠习惯）
   - [ ] Stress levels（压力水平）
   
   **关键验证点:**
   - ✅ 跟随用户的节奏
   - ✅ 不急躁
   - ✅ 每次只问一个问题
   - ✅ 表现出同理心

5. **结束对话后验证数据**
   
   ```bash
   # 检查 Onboarding 状态
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
   WHERE user_id = 'test_user_new';
   SQL
   ```
   
   **期望结果:**
   - `completion_score`: 应该 > 0（取决于收集了多少信息）
   - `onboarding_stage`: 'in_progress' 或 'completed'
   - 相应的字段应该被标记为 1

6. **检查日志**
   
   在 Minerva 日志中查找:
   ```
   📞 Call Type: onboarding (Score: 0%)
   ```

---

### 场景 2: Onboarding Continuation（部分完成用户）

**目标:** 验证 Agent 聚焦于缺失信息，不重复已知信息

**测试步骤:**

1. **启动 Voice Call**
   ```bash
   # 使用 user_id: test_user_partial
   ```

2. **验证 Agent 开场白**
   
   **期望开场白:**
   > "Good to talk to you again! Last time we discussed your high blood sugar concern. How has that been going?"
   
   - ✅ 应该提到之前的对话
   - ✅ 应该引用已知信息（如 "high blood sugar"）
   - ❌ 不应该重新问已经知道的信息

3. **验证对话流程**
   
   **测试对话示例:**
   
   ```
   Agent: "Last time you mentioned your goal to lower A1C. Have you had more thoughts on that?"
   
   User: "Yes, I want to get it down to 6.5 in 3 months."
   
   Agent 应该:
   ✅ 承认新信息
   ✅ 然后转向缺失的信息（如运动习惯、睡眠等）
   
   ❌ 不应该:
   - 重新问 concerns（已知）
   - 重新问 goals（已知）
   - 重新问 eating habits（已知）
   ```

4. **验证缺失信息识别**
   
   Agent 应该聚焦于:
   - [ ] Exercise habits（如果未收集）
   - [ ] Sleep habits（如果未收集）
   - [ ] Stress levels（如果未收集）
   - [ ] TODOs（如果未创建）

5. **结束对话后验证数据**
   
   ```bash
   sqlite3 storage/databases/cgm_butler.db << 'SQL'
   SELECT 
       user_id,
       completion_score,
       onboarding_stage,
       exercise_habits_collected,
       sleep_habits_collected,
       stress_habits_collected,
       todos_created
   FROM user_onboarding_status 
   WHERE user_id = 'test_user_partial';
   SQL
   ```
   
   **期望结果:**
   - `completion_score`: 应该增加（如 60 → 80）
   - 新收集的字段应该被标记为 1

6. **检查日志**
   
   ```
   📞 Call Type: onboarding_continuation (Score: 60%)
   ```

---

### 场景 3: Follow-up（已完成 Onboarding 的用户）

**目标:** 验证 Agent 提供个性化支持，检查 TODOs 进度

**测试步骤:**

1. **准备测试数据**
   
   ```bash
   # 为 test_user_complete 添加一些 TODOs 和记忆
   sqlite3 storage/databases/cgm_butler.db << 'SQL'
   -- 添加 TODO
   INSERT INTO user_todos (
       user_id, conversation_id, title, category,
       health_benefit, time_of_day, time_description,
       target_count, current_count, status
   ) VALUES (
       'test_user_complete', 'test_conv_1', 
       '每天上班前吃营养早餐（希腊酸奶+坚果）',
       'diet',
       '减少饥饿导致的血糖降低，稳定上午血糖水平',
       '09:00-10:00', '上班前',
       7, 3, 'pending'
   );
   
   -- 添加记忆
   INSERT INTO user_memories (
       user_id, conversation_id, channel, summary
   ) VALUES (
       'test_user_complete', 'test_conv_1', 'retell_voice',
       '用户提到早上经常跳过早餐，导致上午血糖偏低。我们讨论了简单的早餐方案，包括希腊酸奶配坚果或提前煮好的鸡蛋。用户承诺每天上班前吃早餐。'
   );
   SQL
   ```

2. **启动 Voice Call**
   ```bash
   # 使用 user_id: test_user_complete
   ```

3. **验证 Agent 开场白**
   
   **期望开场白:**
   > "Hey Test User Complete! How have things been going?"
   
   或
   
   > "Good to hear from you! How are you feeling?"
   
   - ✅ 应该更加轻松、个性化
   - ✅ 应该像老朋友一样
   - ❌ 不应该再收集基础信息

4. **验证对话流程**
   
   **测试对话示例:**
   
   ```
   Agent: "How did the breakfast routine go this week?"
   
   User: "I've been eating breakfast 5 out of 7 days."
   
   Agent 应该:
   ✅ 庆祝进步（"That's great progress!"）
   ✅ 询问障碍（"What got in the way on the other days?"）
   ✅ 提供支持（"What would help you hit 7 out of 7?"）
   
   ❌ 不应该:
   - 批评或责备
   - 重新收集 Onboarding 信息
   - 忽略 TODOs
   ```

5. **验证个性化内容**
   
   Agent 应该:
   - [ ] 提到之前的对话（"Last time you mentioned..."）
   - [ ] 检查 TODOs 进度
   - [ ] 根据用户档案提供建议
   - [ ] 询问是否有新的关注点

6. **结束对话后验证数据**
   
   ```bash
   # 检查 TODOs 是否更新
   sqlite3 storage/databases/cgm_butler.db << 'SQL'
   SELECT 
       title,
       target_count,
       current_count,
       status
   FROM user_todos 
   WHERE user_id = 'test_user_complete'
   ORDER BY created_at DESC
   LIMIT 5;
   SQL
   ```

7. **检查日志**
   
   ```
   📞 Call Type: followup (Score: 100%)
   ```

---

## 🔍 边界情况测试

### 测试 1: Score = 49 vs 50

**目标:** 验证阈值判断

```bash
# 创建 score = 49 的用户
sqlite3 storage/databases/cgm_butler.db << 'SQL'
INSERT INTO user_onboarding_status (user_id, completion_score) 
VALUES ('test_score_49', 49);
SQL

# 创建 score = 50 的用户
sqlite3 storage/databases/cgm_butler.db << 'SQL'
INSERT INTO user_onboarding_status (user_id, completion_score) 
VALUES ('test_score_50', 50);
SQL
```

**验证:**
- `test_score_49` → Call Type 应该是 `onboarding`
- `test_score_50` → Call Type 应该是 `onboarding_continuation`

### 测试 2: Score = 79 vs 80

```bash
# 创建 score = 79 的用户
sqlite3 storage/databases/cgm_butler.db << 'SQL'
INSERT INTO user_onboarding_status (user_id, completion_score) 
VALUES ('test_score_79', 79);
SQL

# 创建 score = 80 的用户
sqlite3 storage/databases/cgm_butler.db << 'SQL'
INSERT INTO user_onboarding_status (user_id, completion_score) 
VALUES ('test_score_80', 80);
SQL
```

**验证:**
- `test_score_79` → Call Type 应该是 `onboarding_continuation`
- `test_score_80` → Call Type 应该是 `followup`

### 测试 3: 中途挂断

**目标:** 验证数据正确保存

1. 开始 Voice Call
2. 聊几句后挂断
3. 检查数据库中是否有记录
4. 再次发起 Call，验证 Agent 是否记得之前的对话

---

## 📊 数据验证

### 验证 Conversations 表

```bash
sqlite3 storage/databases/cgm_butler.db << 'SQL'
SELECT 
    conversation_id,
    user_id,
    conversation_type,
    started_at,
    ended_at,
    status,
    LENGTH(transcript) as transcript_length
FROM conversations 
ORDER BY started_at DESC 
LIMIT 5;
SQL
```

### 验证 User Memories 表

```bash
sqlite3 storage/databases/cgm_butler.db << 'SQL'
SELECT 
    user_id,
    channel,
    SUBSTR(summary, 1, 100) as summary_preview,
    created_at
FROM user_memories 
ORDER BY created_at DESC 
LIMIT 5;
SQL
```

### 验证 User TODOs 表

```bash
sqlite3 storage/databases/cgm_butler.db << 'SQL'
SELECT 
    user_id,
    title,
    category,
    health_benefit,
    time_of_day,
    target_count,
    current_count,
    status
FROM user_todos 
ORDER BY created_at DESC 
LIMIT 5;
SQL
```

### 验证 Onboarding Status 表

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
    stress_habits_collected,
    todos_created
FROM user_onboarding_status 
ORDER BY last_updated_at DESC 
LIMIT 5;
SQL
```

---

## 🐛 故障排查

### 问题 1: Call Context 未生效

**症状:** Agent 的对话没有体现 Onboarding / Follow-up 的区别

**排查步骤:**

1. **检查 Minerva 日志**
   ```bash
   # 查找 Call Type 日志
   grep "📞 Call Type" logs/minerva.log
   ```
   
   应该看到类似:
   ```
   📞 Call Type: onboarding (Score: 0%)
   ```

2. **检查 `llm_dynamic_variables`**
   
   在 `intake_service.py` 的日志中应该看到 `call_context` 被添加

3. **验证 Retell LLM 配置**
   ```bash
   python3 << 'PYEOF'
   import os
   from retell import Retell
   from dotenv import load_dotenv
   
   load_dotenv()
   client = Retell(api_key=os.getenv("RETELL_API_KEY"))
   llm = client.llm.retrieve(llm_id="llm_e54c307ce74090cdfd06f682523b")
   
   print("General Prompt 前100字符:")
   print(llm.general_prompt[:100] if hasattr(llm, 'general_prompt') else "No prompt")
   PYEOF
   ```

### 问题 2: 完成度计算不准确

**症状:** 用户明明聊了很多，但 completion_score 还是很低

**排查步骤:**

1. **检查提取的记忆**
   ```bash
   sqlite3 storage/databases/cgm_butler.db << 'SQL'
   SELECT 
       user_id,
       summary,
       key_topics,
       extracted_data
   FROM user_memories 
   WHERE user_id = 'test_user_new'
   ORDER BY created_at DESC 
   LIMIT 1;
   SQL
   ```

2. **检查关键词匹配**
   
   在 `onboarding_extractors.py` 中添加调试日志:
   ```python
   print(f"DEBUG: summary = {summary}")
   print(f"DEBUG: keyword_matches = {keyword_matches}")
   ```

3. **手动测试完成度计算**
   ```bash
   python3 << 'PYEOF'
   import sys
   sys.path.insert(0, '/Users/yijialiu/Desktop/my-glucose-pal')
   
   from shared.database.repositories.onboarding_utils import calculate_onboarding_completion
   
   # 测试状态
   status = {
       'concerns_collected': 1,
       'primary_concern': 'High blood sugar',
       'goals_set': 1,
       'primary_goal': 'Lower A1C',
       'eating_habits_collected': 1,
       'todos_created': 1,
       'initial_todos_count': 2
   }
   
   score = calculate_onboarding_completion(status)
   print(f"Completion Score: {score}")
   PYEOF
   ```

### 问题 3: 状态更新失败

**症状:** 对话结束后，`user_onboarding_status` 表没有更新

**排查步骤:**

1. **检查 MemoryService 日志**
   ```bash
   grep "Onboarding status updated" logs/minerva.log
   ```
   
   应该看到:
   ```
   ✅ Onboarding status updated for test_user_new: 60% complete
   ```

2. **检查 channel 类型**
   
   只有 `channel == 'retell_voice'` 才会更新 Onboarding 状态
   
   在 `intake_router.py` 中验证:
   ```python
   logger.info(f"Channel: {channel}")
   ```

3. **检查数据库事务**
   
   确保 `self.db_conn.commit()` 被调用

---

## ✅ 测试清单

### Onboarding 场景
- [ ] Agent 开场白简洁友好
- [ ] 每次只问一个问题
- [ ] 表现出同理心
- [ ] 自然收集信息（不机械）
- [ ] 完成度正确计算
- [ ] 数据正确保存到数据库
- [ ] 日志显示 `Call Type: onboarding`

### Onboarding Continuation 场景
- [ ] Agent 提到之前的对话
- [ ] 不重复已知信息
- [ ] 聚焦于缺失信息
- [ ] 完成度增加
- [ ] 日志显示 `Call Type: onboarding_continuation`

### Follow-up 场景
- [ ] Agent 更加个性化
- [ ] 提到用户档案和历史
- [ ] 检查 TODOs 进度
- [ ] 提供支持和鼓励
- [ ] 日志显示 `Call Type: followup`

### 边界情况
- [ ] Score = 49 → onboarding
- [ ] Score = 50 → onboarding_continuation
- [ ] Score = 79 → onboarding_continuation
- [ ] Score = 80 → followup
- [ ] 中途挂断数据正确保存

### 数据验证
- [ ] Conversations 表有记录
- [ ] User Memories 表有记录
- [ ] User TODOs 表有记录
- [ ] Onboarding Status 表正确更新

---

## 🎉 测试成功标准

**核心功能:**
- ✅ 3 种 Call Type 正确判断
- ✅ Agent 对话风格符合设计（自然、简洁、有同理心）
- ✅ 数据正确保存到所有相关表
- ✅ 完成度计算准确

**用户体验:**
- ✅ 新用户感觉舒适，不急躁
- ✅ 部分完成用户不感觉重复
- ✅ 完成用户感觉个性化

**技术指标:**
- ✅ 日志显示正确的 Call Type
- ✅ 数据库状态正确更新
- ✅ 无错误或异常

---

## 📞 获取帮助

如果遇到问题:

1. **查看日志**
   - Minerva: `logs/minerva.log`
   - Backend: `logs/backend.log`

2. **查看文档**
   - 设计文档: `VOICE_CALL_CONTEXT_DESIGN.md`
   - 实施总结: `VOICE_CALL_IMPLEMENTATION_SUMMARY.md`
   - 逻辑检查: `VOICE_CALL_LOGIC_REVIEW.md`

3. **数据库检查**
   ```bash
   sqlite3 storage/databases/cgm_butler.db
   .tables
   .schema user_onboarding_status
   ```

---

## 🚀 开始测试！

```bash
# 1. 启动服务
./start-all.sh

# 2. 打开前端
open http://localhost:5173

# 3. 开始第一个测试（Onboarding 场景）
# 使用新用户或 test_user_new

# 4. 观察日志
tail -f logs/minerva.log | grep "Call Type"
```

祝测试顺利！🎉

