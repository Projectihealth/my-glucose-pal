# Olivia Coach Prompt 更新指南

## 概述

现在 Olivia 的 prompt 已经迁移到本地文件管理，你可以轻松地更新和修改 prompt，而无需登录 Retell 平台。

## 文件结构

```
cgm_butler/minerva/intake_phone_agent/
├── prompts/
│   ├── olivia_coach_prompt.txt    # 主 prompt 文件
│   └── begin_message.txt          # 开场白文件
├── service.py                     # 业务逻辑（包含更新 LLM 的函数）
└── router.py                      # API 路由
```

## Prompt 文件

### 1. olivia_coach_prompt.txt
这是 Olivia 的主 prompt，包含：
- 角色定义
- 核心沟通原则
- 对话策略
- 信息收集方法
- 示例对话

### 2. begin_message.txt
这是通话开始时的开场白，目前内容为：
```
Hi {{user_name}}! I'm Olivia, your CGM health coach. I'm here to support you on your health journey - think of me as someone who checks in on how you're doing, gives you personalized tips, helps you understand what's going on with your health, and just chats with you about life. What's going on with you today?
```

**注意**：`{{user_name}}` 会在运行时被自动替换为用户的真实姓名。

## 如何更新 Prompt

### 方法 1: 直接编辑文件然后调用 API

1. 编辑 prompt 文件：
   ```bash
   # 编辑主 prompt
   vim cgm_butler/minerva/intake_phone_agent/prompts/olivia_coach_prompt.txt

   # 编辑开场白
   vim cgm_butler/minerva/intake_phone_agent/prompts/begin_message.txt
   ```

2. 调用 API 更新到 Retell：
   ```bash
   curl -X POST http://localhost:8000/api/intake/update-llm-settings \
     -H "Content-Type: application/json" \
     -d '{}'
   ```

### 方法 2: 使用自定义开场白

如果你只想临时更改开场白，而不想修改文件：

```bash
curl -X POST http://localhost:8000/api/intake/update-llm-settings \
  -H "Content-Type: application/json" \
  -d '{
    "begin_message": "Hey {{user_name}}! This is Olivia, your health coach. How can I help you today?"
  }'
```

### 方法 3: 只更新 prompt，不更新开场白

```bash
curl -X POST http://localhost:8000/api/intake/update-llm-settings \
  -H "Content-Type: application/json" \
  -d '{
    "use_default_begin_message": false
  }'
```

## API 端点详情

### POST /api/intake/update-llm-settings

**请求体参数**（全部可选）：

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `llm_id` | string | 环境变量 `INTAKE_LLM_ID` | Retell LLM ID |
| `begin_message` | string | 从 `begin_message.txt` 加载 | 自定义开场白 |
| `use_default_begin_message` | boolean | `true` | 是否使用默认的 begin_message 文件 |

**响应示例**：

```json
{
  "status": "success",
  "message": "LLM settings updated successfully",
  "llm_id": "llm_e54c307ce74090cdfd06f682523b",
  "updated_fields": ["general_prompt", "begin_message"]
}
```

## 环境变量

确保在 `.env` 文件中设置了以下变量：

```bash
RETELL_API_KEY=your_retell_api_key
INTAKE_LLM_ID=llm_e54c307ce74090cdfd06f682523b
```

## 使用场景示例

### 场景 1: 修改 Olivia 的说话风格

1. 编辑 `olivia_coach_prompt.txt`
2. 修改 "CORE COMMUNICATION PRINCIPLES" 部分
3. 运行更新命令

### 场景 2: 更改开场白语气

1. 编辑 `begin_message.txt`
2. 修改问候语
3. 运行更新命令

### 场景 3: A/B 测试不同的开场白

```bash
# 测试版本 A
curl -X POST http://localhost:8000/api/intake/update-llm-settings \
  -d '{"begin_message": "Hi {{user_name}}! Ready to chat about your health?"}'

# 测试版本 B
curl -X POST http://localhost:8000/api/intake/update-llm-settings \
  -d '{"begin_message": "Hey {{user_name}}! How are you feeling today?"}'

# 恢复默认版本
curl -X POST http://localhost:8000/api/intake/update-llm-settings -d '{}'
```

## 注意事项

1. **动态变量**: 在 prompt 中可以使用以下变量：
   - `{{user_name}}` - 用户姓名
   - `{{user_age}}` - 用户年龄
   - `{{user_health_goal}}` - 用户健康目标
   - `{{user_conditions}}` - 用户健康状况
   - `{{user_cgm_device}}` - CGM 设备类型

2. **Prompt 长度**: Retell 对 prompt 长度有限制，当前的 prompt 已经优化过，请谨慎添加内容。

3. **测试**: 更新 prompt 后，建议先在测试环境中验证，确保 Olivia 的行为符合预期。

4. **版本控制**: 所有 prompt 文件都已纳入 Git 版本控制，可以随时回滚到之前的版本。

## 故障排除

### 问题: API 返回 500 错误

**可能原因**:
- Retell API key 无效
- LLM ID 不存在
- Prompt 文件不存在或格式错误

**解决方法**:
1. 检查环境变量是否正确设置
2. 查看后端日志: `tail -f logs/minerva.log`
3. 验证 prompt 文件存在且可读

### 问题: Olivia 没有使用新的 prompt

**可能原因**:
- 缓存问题
- 更新没有成功

**解决方法**:
1. 重新调用更新 API
2. 检查 Retell 平台确认更新是否生效
3. 重启通话测试

## 更多信息

- Retell API 文档: https://docs.retellai.com/
- 联系开发团队获取支持
