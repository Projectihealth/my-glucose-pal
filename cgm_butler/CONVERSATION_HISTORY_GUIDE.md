# 对话历史存储系统 - 完整指南 📝

## 🎯 概述

现在你的 CGM Butler 系统可以**记录并保存所有用户与 Olivia 的对话**（无论是视频还是文本）。这为后续的分析、追踪和个性化提供了基础。

---

## 📊 数据库架构

### 两个新表

#### 1. `conversations` 表 - 完整对话记录
```sql
-- 存储所有对话（Tavus 视频 + GPT 文本）
-- 核心字段：
- conversation_id (主键，UUID)
- user_id (用户ID)
- conversation_type ('tavus_video' 或 'gpt_chat')
- transcript (JSON 格式的完整对话记录)
- conversational_context (初始 context)
- started_at / ended_at (时间戳)
- duration_seconds (对话时长)
- status (对话状态)

-- Tavus 特有：
- tavus_conversation_id
- tavus_conversation_url
- tavus_replica_id
- tavus_persona_id
```

#### 2. `conversation_analysis` 表 - 分析结果
```sql
-- 存储对对话的AI分析
-- 核心字段：
- analysis_id (主键)
- conversation_id (外键)
- summary (对话摘要)
- key_topics (关键话题)
- extracted_data (提取的数据：饮食、运动等)
- user_intents (用户意图)
- user_concerns (用户关切)
- user_sentiment (情感分析)
- engagement_score (参与度评分)
- action_items (行动项)
- follow_up_needed (是否需要跟进)
```

---

## 🚀 快速开始

### 第1步：运行数据库迁移

```bash
# 在项目根目录
cd database
python migration_add_conversations.py
```

**输出：**
```
开始数据库迁移...
============================================================

[1/2] 创建 conversations 表...
✅ conversations 表创建成功
[2/2] 创建 conversation_analysis 表...
✅ conversation_analysis 表创建成功

============================================================
✅ 数据库迁移完成！

新增表：
  1. conversations - 存储所有对话记录
  2. conversation_analysis - 存储对话分析结果
```

### 第2步：在你的代码中使用 ConversationManager

```python
from database.conversation_manager import ConversationManager
from datetime import datetime

# 初始化管理器
manager = ConversationManager('database/cgm_butler.db')

# 保存 GPT 对话
conv_id = manager.save_gpt_conversation(
    user_id='user_001',
    transcript=[
        {
            "role": "user",
            "content": "我的血糖是多少?",
            "timestamp": datetime.now().isoformat()
        },
        {
            "role": "assistant",
            "content": "你的当前血糖是 114 mg/dL，状态正常。",
            "timestamp": datetime.now().isoformat()
        }
    ],
    conversational_context='用户询问当前血糖',
    started_at=datetime.now().isoformat(),
    ended_at=datetime.now().isoformat(),
    status='ended'
)

# 查询对话
conversation = manager.get_conversation(conv_id)
print(conversation['transcript'])

# 保存分析结果
manager.save_analysis(
    conversation_id=conv_id,
    summary='用户询问了当前血糖水平',
    key_topics=['blood_sugar', 'current_status'],
    user_intents=['seeking_information'],
    user_sentiment='neutral',
    engagement_score=85.0
)
```

---

## 📖 核心 API

### 对话保存

#### 保存 GPT 对话
```python
conv_id = manager.save_gpt_conversation(
    user_id='user_001',
    transcript=[...],  # List[Dict]
    conversational_context='...',
    started_at='2025-10-27T14:20:00Z',
    ended_at='2025-10-27T14:25:00Z',
    duration_seconds=300,
    status='ended'  # 'active', 'ended', 'error'
)
```

#### 保存 Tavus 视频对话
```python
conv_id = manager.save_tavus_conversation(
    user_id='user_001',
    tavus_conversation_id='c7138f1953b7e4f6',
    tavus_conversation_url='https://tavus.daily.co/c7138f1953b7e4f6',
    tavus_replica_id='rfe12d8b9597',
    tavus_persona_id='p4e7a065501a',
    transcript=[...],  # List[Dict]
    conversational_context='...',
    custom_greeting='Hi John!',
    started_at='2025-10-27T08:30:00Z'
)
```

### 对话查询

#### 获取单个对话
```python
conversation = manager.get_conversation(conversation_id)
# 返回完整的对话信息，including parsed JSON fields
```

#### 获取用户所有对话
```python
conversations = manager.get_user_conversations(
    user_id='user_001',
    limit=20,
    offset=0,
    conversation_type=None  # 'tavus_video', 'gpt_chat', 或 None (所有)
)
```

#### 获取最近的对话
```python
recent = manager.get_recent_conversations(
    user_id='user_001',
    days=7,      # 最近7天
    limit=10     # 最多10条
)
```

### 分析保存与查询

#### 保存分析
```python
analysis_id = manager.save_analysis(
    conversation_id=conv_id,
    summary='用户询问了血糖管理建议',
    key_topics=['blood_sugar', 'diet', 'exercise'],
    extracted_data={
        'foods': ['rice', 'vegetables'],
        'exercises': ['walking'],
        'sleep': {'hours': 7}
    },
    user_intents=['seeking_advice', 'logging_data'],
    user_concerns=['night_glucose'],
    user_sentiment='positive',
    engagement_score=90.0,
    action_items=[
        {'action': 'Follow up on diet', 'priority': 'high'}
    ],
    follow_up_needed=True,
    analysis_model='gpt-4o'
)
```

#### 获取分析
```python
analysis = manager.get_analysis(conversation_id)
# 返回完整的分析信息
```

### 统计与报告

#### 获取用户统计
```python
stats = manager.get_conversation_stats(
    user_id='user_001',
    days=7
)
# 返回：
# {
#     'total_conversations': 5,
#     'by_type': {'gpt_chat': 3, 'tavus_video': 2},
#     'total_duration_seconds': 1800,
#     'follow_up_needed': 1,
#     'period_days': 7
# }
```

---

## 📝 Transcript JSON 格式

### GPT 文本对话格式
```json
{
  "format": "gpt",
  "turns": [
    {
      "role": "user",
      "content": "我的血糖是多少?",
      "timestamp": "2025-10-27T14:20:00Z"
    },
    {
      "role": "assistant",
      "content": "你的当前血糖是 114 mg/dL，状态正常。",
      "timestamp": "2025-10-27T14:20:15Z"
    }
  ]
}
```

### Tavus 视频对话格式
```json
{
  "format": "tavus",
  "turns": [
    {
      "role": "assistant",
      "content": "Good morning John! How are you feeling today?",
      "timestamp": "2025-10-27T08:30:00Z"
    },
    {
      "role": "user",
      "content": "Hi! I'm feeling okay, just had breakfast.",
      "visual_scene": "Kitchen with breakfast plate visible",
      "timestamp": "2025-10-27T08:30:15Z"
    }
  ]
}
```

---

## 🔌 集成示例

### 集成到 digital_avatar (GPT 聊天)

在 `digital_avatar/api.py` 中：

```python
from database.conversation_manager import ConversationManager
from datetime import datetime

manager = ConversationManager()

@app.route('/api/avatar/gpt/chat', methods=['POST'])
def gpt_chat():
    data = request.json
    user_id = data.get('user_id')
    message = data.get('message')
    
    # 对话处理...
    response = gpt_manager.chat(user_id, message)
    
    # 保存对话 turn
    if not hasattr(gpt_manager, 'conversation_start'):
        gpt_manager.conversation_start = datetime.now().isoformat()
        gpt_manager.current_conv_id = None
        gpt_manager.transcript = []
    
    # 添加 user 消息
    gpt_manager.transcript.append({
        "role": "user",
        "content": message,
        "timestamp": datetime.now().isoformat()
    })
    
    # 添加 assistant 响应
    gpt_manager.transcript.append({
        "role": "assistant",
        "content": response.get('message'),
        "timestamp": datetime.now().isoformat()
    })
    
    return jsonify(response)

@app.route('/api/avatar/gpt/end', methods=['POST'])
def end_gpt_conversation():
    data = request.json
    user_id = data.get('user_id')
    
    # 保存完整对话
    conv_id = manager.save_gpt_conversation(
        user_id=user_id,
        transcript=gpt_manager.transcript,
        conversational_context='...',
        started_at=gpt_manager.conversation_start,
        ended_at=datetime.now().isoformat(),
        status='ended'
    )
    
    # 可选：保存分析
    # manager.save_analysis(conv_id, ...)
    
    return jsonify({'conversation_id': conv_id})
```

### 集成到 cgm-avatar-app (Tavus 视频)

在 `cgm-avatar-app/src/App.tsx` 中：

```typescript
const endConversation = async () => {
    try {
        // 调用后端 API 获取对话记录
        const response = await fetch(
            `http://localhost:5000/api/conversation/${conversationId}`
        );
        const conversationData = await response.json();
        
        // 保存到数据库
        await fetch('http://localhost:5000/api/conversations/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: currentUserId,
                tavus_conversation_id: conversationId,
                tavus_conversation_url: conversationUrl,
                transcript: conversationData.transcript,
                conversational_context: context,
                status: 'ended'
            })
        });
    } catch (error) {
        console.error('Failed to save conversation:', error);
    }
};
```

---

## 🎯 使用场景

### 场景 1：用户健康历史回顾
```python
# 获取用户最近7天的所有对话
recent_conversations = manager.get_recent_conversations('user_001', days=7)

# 汇总统计
for conv in recent_conversations:
    print(f"{conv['started_at']}: {conv['conversation_type']}")
    print(f"  - {len(conv['transcript'])} turns")
```

### 场景 2：生成对话分析报告
```python
# 获取用户的所有对话
conversations = manager.get_user_conversations('user_001')

# 为每个对话分析情感和关键话题
for conv in conversations:
    analysis = manager.get_analysis(conv['conversation_id'])
    if analysis:
        print(f"情感: {analysis['user_sentiment']}")
        print(f"话题: {analysis['key_topics']}")
        print(f"需要跟进: {analysis['follow_up_needed']}")
```

### 场景 3：跟进需要的对话
```python
# 获取需要跟进的对话
conversations = manager.get_user_conversations('user_001')

follow_ups = []
for conv in conversations:
    analysis = manager.get_analysis(conv['conversation_id'])
    if analysis and analysis['follow_up_needed']:
        follow_ups.append({
            'conversation_id': conv['conversation_id'],
            'concerns': analysis['user_concerns'],
            'action_items': analysis['action_items']
        })

# 生成跟进任务
for follow_up in follow_ups:
    # 创建提醒或任务...
```

---

## 📊 数据查询示例

### 获取用户对话统计
```python
stats = manager.get_conversation_stats('user_001', days=30)
print(f"过去30天对话数: {stats['total_conversations']}")
print(f"对话类型分布: {stats['by_type']}")
print(f"总对话时长: {stats['total_duration_seconds']}秒")
print(f"需要跟进的对话: {stats['follow_up_needed']}个")
```

### 查询特定类型的对话
```python
# 只查询 GPT 文本对话
gpt_conversations = manager.get_user_conversations(
    user_id='user_001',
    conversation_type='gpt_chat',
    limit=10
)

# 只查询 Tavus 视频对话
tavus_conversations = manager.get_user_conversations(
    user_id='user_001',
    conversation_type='tavus_video',
    limit=10
)
```

---

## 🔍 最佳实践

### 1. 及时保存对话
```python
# 每次对话结束时立即保存
manager.save_gpt_conversation(
    user_id=user_id,
    transcript=transcript,
    ...
    status='ended'  # 明确标记为完成
)
```

### 2. 后续异步分析
```python
# 保存对话后，可以异步进行 AI 分析
conversation_id = manager.save_gpt_conversation(...)

# 然后在后台任务中分析
def analyze_conversation_async(conversation_id):
    conv = manager.get_conversation(conversation_id)
    # 使用 GPT 分析...
    manager.save_analysis(conversation_id, ...)
```

### 3. 定期清理
```python
# 清理超过90天的对话（可选）
# 注意：这会删除关联的分析数据
```

### 4. 隐私考虑
```python
# 确保对话数据按照隐私规则处理
# - 加密敏感信息
# - 提供用户导出功能
# - 遵守 GDPR/HIPAA 等规定
```

---

## 📋 检查清单

运行迁移后，检查：

- [ ] `conversations` 表已创建
- [ ] `conversation_analysis` 表已创建
- [ ] 所有索引已创建
- [ ] 外键关系正确
- [ ] 可以成功保存和查询对话

---

## 🐛 故障排除

### 迁移失败

```bash
# 检查数据库文件是否存在
ls database/cgm_butler.db

# 重新运行迁移
cd database
python migration_add_conversations.py
```

### 保存失败

```python
# 检查连接
from database.conversation_manager import ConversationManager
manager = ConversationManager()
manager.get_conversation_stats('user_001')  # 测试
```

---

**总结**: 现在你的系统可以完整地记录用户与 Olivia 的每次对话，为后续的分析、个性化和改进奠定基础！ 🎉

