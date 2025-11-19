"""
GPT-4o Chat Manager with CGM Function Calling

使用OpenAI GPT-4o进行智能对话，支持调用CGM数据工具
"""

import os
import sys
from typing import List, Dict, Optional
import json
from datetime import datetime

# 添加项目根目录到路径 (用于 shared 模块)
# gpt_chat.py -> digital_avatar -> cgm_butler -> backend -> apps -> my-glucose-pal (5层)
current_file = os.path.abspath(__file__)
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(current_file)))))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# 使用相对导入
from .config import AvatarConfig
from .cgm_tools import CGMTools, FUNCTION_DEFINITIONS
from .memory_service import MemoryService

# 使用新的 shared/database
from shared.database import get_connection, ConversationRepository

try:
    from openai import OpenAI
except ImportError:
    print("请安装 openai 库: pip install openai")
    sys.exit(1)


class GPTChatManager:
    """GPT-4o对话管理器，支持CGM数据Function Calling和对话历史保存"""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        初始化GPT聊天管理器
        
        Args:
            api_key: OpenAI API Key，如果为None则从配置读取
        """
        self.api_key = api_key or AvatarConfig.OPENAI_API_KEY
        self.client = OpenAI(api_key=self.api_key)
        self.model = AvatarConfig.OPENAI_MODEL
        self.cgm_tools = CGMTools()
        
        # 使用新的 Repository 模式
        self.db_conn = get_connection()
        self.conversation_repo = ConversationRepository(self.db_conn)
        
        self.memory_service = MemoryService(openai_api_key=self.api_key)
        
        # 对话历史
        self.conversations = {}  # user_id -> messages
        self.conversation_start_time = {}  # user_id -> start_time
        self.conversation_transcript = {}  # user_id -> transcript list
    
    def start_conversation(self, user_id: str) -> Dict:
        """
        开始新对话
        
        Args:
            user_id: 用户ID
        
        Returns:
            初始化结果
        """
        # 获取用户信息
        user_info = self.cgm_tools.get_user_info(user_id)
        
        # 系统提示词 - Olivia Persona
        system_prompt = f"""You are Olivia, an elegant and attentive health butler in your early 30s.

## Your User
- Name: {user_info.get('name', 'User')}
- Health Goal: {user_info.get('health_goal', 'Manage glucose levels')}
- Health Conditions: {user_info.get('conditions', 'Not specified')}
- User ID: {user_id}

## Personality Traits
- **Warm & Nurturing**: You genuinely care about your user's wellbeing and it shows in every word
- **Intelligent & Insightful**: You understand complex health data but explain it simply
- **Encouraging & Positive**: You focus on progress, not perfection
- **Subtly Playful**: You add light humor to keep conversations engaging
- **Professional yet Personal**: You maintain boundaries while being genuinely invested

## Speaking Style
- Use encouraging phrases: "I'm so proud of you for...", "You're doing wonderfully at...", "Let's tackle this together"
- Celebrate wins: "That's fantastic!", "Look at you go!", "Your dedication is really showing!"
- Soften difficult news: "I noticed something we should chat about...", "Let's make a small adjustment..."
- Ask caring questions: "How are you feeling today?", "Did you sleep well last night?", "What's on your mind?"

## Tone Examples
- When praising: "Incredible! Your glucose stayed in range for 8 hours after that meal. You're getting really good at balancing your plate!"
- When suggesting: "I have an idea that might help. How about a 15-minute walk after lunch? It usually works magic for you."
- When addressing issues: "I noticed a pattern we should look at together. No worries at all—we'll figure this out."
- When checking in: "Good morning! How did you sleep? I'm curious about your energy levels today."

## Behavioral Notes
- Use "we" language to create partnership ("Let's try...", "We can adjust...")
- Remember previous conversations and reference them naturally
- Show excitement about the user's progress
- Be gently persistent about important health patterns without nagging
- Adapt your energy to match the user's mood when appropriate

## Your Tools
You have access to these tools to retrieve real-time data:
- get_latest_glucose: Get the user's latest glucose reading
- get_glucose_statistics: Get statistics (24 hours or 7 days)
- get_recent_patterns: Get identified glucose patterns
- get_pattern_actions: Get health recommendations
- get_user_info: Get user basic information

## Critical Instructions
- **User ID**: Always use "{user_id}" when calling tools (never use the user's name)
- **Real Data**: Always call tools to get real data—never guess or make up numbers
- **Proactive**: When users ask about their glucose, patterns, or stats, immediately call the appropriate tool
- **Natural**: Weave data into your warm, conversational style

You are supportive, sophisticated, and always have the user's best interests at heart."""
        
        # 初始化对话历史
        self.conversations[user_id] = [
            {"role": "system", "content": system_prompt}
        ]
        
        # 初始化对话追踪
        self.conversation_start_time[user_id] = datetime.now().isoformat()
        self.conversation_transcript[user_id] = []
        
        return {
            "success": True,
            "user_id": user_id,
            "message": "对话已开始"
        }
    
    def chat(self, user_id: str, message: str) -> Dict:
        """
        发送消息并获取回复
        
        Args:
            user_id: 用户ID
            message: 用户消息
        
        Returns:
            GPT回复和可能的function call结果
        """
        # 如果对话不存在，先初始化
        if user_id not in self.conversations:
            self.start_conversation(user_id)
        
        # 添加用户消息到内存和transcript
        self.conversations[user_id].append({
            "role": "user",
            "content": message
        })
        
        self.conversation_transcript[user_id].append({
            "role": "user",
            "content": message,
            "timestamp": datetime.now().isoformat()
        })
        
        # 调用GPT-4o
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=self.conversations[user_id],
                functions=FUNCTION_DEFINITIONS,
                function_call="auto",
                temperature=0.7,
                max_tokens=1000
            )
            
            assistant_message = response.choices[0].message
            
            # 处理 function call
            if assistant_message.function_call:
                function_name = assistant_message.function_call.name
                function_args = json.loads(assistant_message.function_call.arguments)
                
                # 执行 function
                function_result = self._execute_function(user_id, function_name, function_args)
                
                # 添加助手消息（包含function call）
                self.conversations[user_id].append({
                    "role": "assistant",
                    "content": "",
                    "function_call": {
                        "name": function_name,
                        "arguments": assistant_message.function_call.arguments
                    }
                })
                
                # 添加function result
                self.conversations[user_id].append({
                    "role": "function",
                    "name": function_name,
                    "content": json.dumps(function_result)
                })
                
                # 重新调用GPT获取最终回复
                final_response = self.client.chat.completions.create(
                    model=self.model,
                    messages=self.conversations[user_id],
                    temperature=0.7,
                    max_tokens=1000
                )
                
                final_message = final_response.choices[0].message.content
                
                # 添加最终助手消息
                self.conversations[user_id].append({
                    "role": "assistant",
                    "content": final_message
                })
                
                # 添加到transcript
                self.conversation_transcript[user_id].append({
                    "role": "assistant",
                    "content": final_message,
                    "timestamp": datetime.now().isoformat()
                })
                
                return {
                    "success": True,
                    "user_id": user_id,
                    "message": final_message,
                    "function_called": function_name,
                    "function_result": function_result
                }
            else:
                # 直接回复，无 function call
                assistant_reply = assistant_message.content
                
                # 添加助手消息
                self.conversations[user_id].append({
                    "role": "assistant",
                    "content": assistant_reply
                })
                
                # 添加到transcript
                self.conversation_transcript[user_id].append({
                    "role": "assistant",
                    "content": assistant_reply,
                    "timestamp": datetime.now().isoformat()
                })
                
                return {
                    "success": True,
                    "user_id": user_id,
                    "message": assistant_reply
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": f"对话出错: {str(e)}"
            }
    
    def end_conversation(self, user_id: str) -> Dict:
        """
        结束对话并保存到数据库
        
        Args:
            user_id: 用户ID
            
        Returns:
            保存结果
        """
        if user_id not in self.conversation_start_time:
            return {
                "success": False,
                "message": "找不到对话开始时间"
            }
        
        try:
            # 计算对话时长
            start_time = datetime.fromisoformat(self.conversation_start_time[user_id])
            end_time = datetime.now()
            duration_seconds = int((end_time - start_time).total_seconds())
            
            # 获取初始context（从系统消息提取）
            system_message = self.conversations[user_id][0]["content"] if self.conversations[user_id] else ""
            
            # 保存到数据库 (使用新的 Repository)
            conv_id = self.conversation_repo.save_gpt_conversation(
                user_id=user_id,
                transcript=self.conversation_transcript[user_id],
                conversational_context=system_message,
                started_at=self.conversation_start_time[user_id],
                ended_at=end_time.isoformat(),
                duration_seconds=duration_seconds,
                status='ended'
            )
            self.db_conn.commit()
            
            # 获取用户信息（用于 memory service）
            user_info = self.cgm_tools.get_user_info(user_id)
            user_name = user_info.get('name', 'User')
            
            # 处理记忆和 TODO（异步处理，不阻塞返回）
            memory_result = self.memory_service.process_conversation(
                user_id=user_id,
                conversation_id=conv_id,
                channel='gpt_chat',
                transcript=self.conversation_transcript[user_id],
                user_name=user_name
            )
            
            # 清理内存
            del self.conversations[user_id]
            del self.conversation_start_time[user_id]
            del self.conversation_transcript[user_id]
            
            return {
                "success": True,
                "conversation_id": conv_id,
                "message": "对话已保存",
                "duration_seconds": duration_seconds,
                "memory_processed": memory_result.get('success', False),
                "todos_created": memory_result.get('todos_count', 0)
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": f"保存对话失败: {str(e)}"
            }
    
    def _execute_function(self, user_id: str, function_name: str, arguments: Dict) -> Dict:
        """
        执行function call
        
        Args:
            user_id: 用户ID
            function_name: 函数名
            arguments: 函数参数
        
        Returns:
            函数执行结果
        """
        # 确保user_id在参数中
        if 'user_id' not in arguments:
            arguments['user_id'] = user_id
        
        # 函数映射
        function_map = {
            'get_latest_glucose': self.cgm_tools.get_latest_glucose,
            'get_glucose_statistics': self.cgm_tools.get_glucose_statistics,
            'get_recent_patterns': self.cgm_tools.get_recent_patterns,
            'get_pattern_actions': self.cgm_tools.get_pattern_actions,
            'get_user_info': self.cgm_tools.get_user_info
        }
        
        if function_name in function_map:
            try:
                result = function_map[function_name](**arguments)
                return result
            except Exception as e:
                return {
                    "success": False,
                    "error": str(e)
                }
        else:
            return {
                "success": False,
                "error": f"Unknown function: {function_name}"
            }
    
    def clear_conversation(self, user_id: str):
        """清除对话历史"""
        if user_id in self.conversations:
            del self.conversations[user_id]
    
    def get_conversation_history(self, user_id: str) -> List[Dict]:
        """获取对话历史"""
        return self.conversations.get(user_id, [])


# 测试代码
if __name__ == '__main__':
    chat_manager = GPTChatManager()
    
    user_id = 'user_001'
    chat_manager.start_conversation(user_id)
    
    print("="*60)
    print("🤖 GPT-4o CGM助手测试")
    print("="*60)
    print("输入 'quit' 退出\n")
    
    test_questions = [
        "我的血糖是多少？",
        "最近有什么模式吗？",
        "给我一些建议"
    ]
    
    for question in test_questions:
        print(f"\n用户: {question}")
        result = chat_manager.chat(user_id, question)
        print(f"\nGPT: {result['message']}")
        if result.get('function_called'):
            print(f"[调用了函数: {result['function_called']}]")
        print("-"*60)

