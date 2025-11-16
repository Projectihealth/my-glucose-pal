"""
Voice Chat Prompt Loader

加载和构建 Voice Chat 的动态 Prompt
"""

import os
from pathlib import Path
from typing import Dict, Optional


class VoiceChatPromptLoader:
    """Voice Chat Prompt 加载器"""
    
    def __init__(self):
        self.prompt_dir = Path(__file__).parent
        self._prompts_cache = {}
    
    def _load_prompt_file(self, filename: str) -> str:
        """加载 Prompt 文件"""
        if filename in self._prompts_cache:
            return self._prompts_cache[filename]
        
        file_path = self.prompt_dir / filename
        
        if not file_path.exists():
            raise FileNotFoundError(f"Prompt file not found: {file_path}")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        self._prompts_cache[filename] = content
        return content
    
    def get_base_system_prompt(self) -> str:
        """获取基础 System Prompt（Darcy 的角色定义）"""
        return self._load_prompt_file('base_system_prompt.md')
    
    def get_onboarding_context(self) -> str:
        """获取 Onboarding Call Context"""
        return self._load_prompt_file('onboarding_context.md')
    
    def get_onboarding_continuation_context(
        self,
        existing_info: Dict,
        missing_info: Dict
    ) -> str:
        """
        获取 Onboarding Continuation Call Context
        
        Args:
            existing_info: 已收集的信息
            missing_info: 缺失的信息
        
        Returns:
            填充后的 Context
        """
        template = self._load_prompt_file('onboarding_continuation_context.md')
        
        # 构建已知信息摘要
        existing_summary = self._build_existing_info_summary(existing_info)
        
        # 构建缺失信息摘要
        missing_summary = self._build_missing_info_summary(missing_info)
        
        # 替换占位符
        context = template.replace('{existing_info_summary}', existing_summary)
        context = context.replace('{missing_info_summary}', missing_summary)
        
        return context
    
    def get_followup_context(
        self,
        user_profile: Dict,
        recent_memories: list,
        active_todos: list
    ) -> str:
        """
        获取 Follow-up Call Context
        
        Args:
            user_profile: 用户档案信息
            recent_memories: 最近的对话记忆
            active_todos: 当前活跃的 TODOs
        
        Returns:
            填充后的 Context
        """
        template = self._load_prompt_file('followup_context.md')
        
        # 构建用户档案摘要
        profile_summary = self._build_user_profile_summary(user_profile)
        
        # 构建最近记忆摘要
        memories_summary = self._build_recent_memories_summary(recent_memories)
        
        # 构建活跃 TODOs 摘要
        todos_summary = self._build_active_todos_summary(active_todos)
        
        # 替换占位符
        context = template.replace('{user_profile_summary}', profile_summary)
        context = context.replace('{recent_memories_summary}', memories_summary)
        context = context.replace('{active_todos_summary}', todos_summary)
        
        # 替换用户名（如果存在）
        user_name = user_profile.get('name', 'there')
        context = context.replace('{user_name}', user_name)
        
        return context
    
    def _build_existing_info_summary(self, existing_info: Dict) -> str:
        """构建已知信息摘要"""
        lines = []
        
        # Concerns
        if existing_info.get('concerns_collected'):
            lines.append("**Concerns:**")
            if existing_info.get('primary_concern'):
                lines.append(f"- Primary concern: {existing_info['primary_concern']}")
            if existing_info.get('concern_duration'):
                lines.append(f"- Duration: {existing_info['concern_duration']}")
            if existing_info.get('main_worry'):
                lines.append(f"- Main worry: {existing_info['main_worry']}")
            lines.append("")
        
        # Goals
        if existing_info.get('goals_set'):
            lines.append("**Goals:**")
            if existing_info.get('primary_goal'):
                lines.append(f"- Primary goal: {existing_info['primary_goal']}")
            if existing_info.get('goal_timeline'):
                lines.append(f"- Timeline: {existing_info['goal_timeline']}")
            if existing_info.get('motivation'):
                lines.append(f"- Motivation: {existing_info['motivation']}")
            lines.append("")
        
        # Lifestyle
        lifestyle_collected = []
        if existing_info.get('eating_habits_collected'):
            lifestyle_collected.append("eating habits")
        if existing_info.get('exercise_habits_collected'):
            lifestyle_collected.append("exercise habits")
        if existing_info.get('sleep_habits_collected'):
            lifestyle_collected.append("sleep habits")
        if existing_info.get('stress_habits_collected'):
            lifestyle_collected.append("stress levels")
        
        if lifestyle_collected:
            lines.append("**Lifestyle:**")
            lines.append(f"- Collected: {', '.join(lifestyle_collected)}")
            lines.append("")
        
        # TODOs
        if existing_info.get('todos_created'):
            lines.append("**Action Plan:**")
            count = existing_info.get('initial_todos_count', 0)
            lines.append(f"- Created {count} initial TODO(s)")
            lines.append("")
        
        if not lines:
            return "No information collected yet (this shouldn't happen in continuation)."
        
        return "\n".join(lines)
    
    def _build_missing_info_summary(self, missing_info: Dict) -> str:
        """构建缺失信息摘要"""
        lines = []
        
        missing_areas = missing_info.get('missing_areas', [])
        
        if not missing_areas:
            return "All key information has been collected!"
        
        lines.append("We're still missing:")
        
        for area in missing_areas:
            if area == 'concerns':
                lines.append("- Their main health concerns and what's worrying them")
            elif area == 'goals':
                lines.append("- What they want to achieve and their timeline")
            elif area == 'eating_habits':
                lines.append("- Their typical eating patterns (breakfast, lunch, dinner)")
            elif area == 'exercise_habits':
                lines.append("- Their physical activity level")
            elif area == 'sleep_habits':
                lines.append("- Their sleep schedule and quality")
            elif area == 'stress_habits':
                lines.append("- Their stress levels and sources")
            elif area == 'todos':
                lines.append("- At least one actionable TODO to get started")
        
        return "\n".join(lines)
    
    def _build_user_profile_summary(self, user_profile: Dict) -> str:
        """构建用户档案摘要"""
        lines = []
        
        # Basic info
        name = user_profile.get('name', 'User')
        age = user_profile.get('age')
        lines.append(f"**Name:** {name}")
        if age:
            lines.append(f"**Age:** {age}")
        lines.append("")
        
        # Health goal
        if user_profile.get('health_goal'):
            lines.append(f"**Health Goal:** {user_profile['health_goal']}")
            lines.append("")
        
        # Conditions
        if user_profile.get('conditions'):
            lines.append(f"**Health Conditions:** {user_profile['conditions']}")
            lines.append("")
        
        # CGM device
        if user_profile.get('cgm_device_type'):
            lines.append(f"**CGM Device:** {user_profile['cgm_device_type']}")
            lines.append("")
        
        # Long-term memory (if available)
        if user_profile.get('long_term_memory'):
            ltm = user_profile['long_term_memory']
            if ltm.get('dietary_preferences'):
                lines.append(f"**Dietary Preferences:** {ltm['dietary_preferences']}")
            if ltm.get('exercise_preferences'):
                lines.append(f"**Exercise Preferences:** {ltm['exercise_preferences']}")
            if ltm.get('lifestyle_constraints'):
                lines.append(f"**Lifestyle Constraints:** {ltm['lifestyle_constraints']}")
        
        return "\n".join(lines)
    
    def _build_recent_memories_summary(self, recent_memories: list) -> str:
        """构建最近记忆摘要"""
        if not recent_memories:
            return "No recent conversations yet."
        
        lines = []
        
        for i, memory in enumerate(recent_memories[:3], 1):  # 最多显示最近 3 条
            date = memory.get('created_at', 'Recently')
            summary = memory.get('summary', 'No summary available')
            
            lines.append(f"**{date}:**")
            lines.append(summary)
            lines.append("")
        
        return "\n".join(lines)
    
    def _build_active_todos_summary(self, active_todos: list) -> str:
        """构建活跃 TODOs 摘要"""
        if not active_todos:
            return "No active TODOs yet."
        
        lines = []
        
        for todo in active_todos:
            title = todo.get('title', 'Untitled TODO')
            target = todo.get('target_count', 1)
            current = todo.get('current_count', 0)
            status = todo.get('status', 'pending')
            
            if status == 'completed':
                lines.append(f"- ✅ {title} (Completed!)")
            else:
                progress = f"{current}/{target}"
                lines.append(f"- [ ] {title} ({progress})")
        
        return "\n".join(lines)


# 单例实例
_prompt_loader = None


def get_prompt_loader() -> VoiceChatPromptLoader:
    """获取 PromptLoader 单例"""
    global _prompt_loader
    if _prompt_loader is None:
        _prompt_loader = VoiceChatPromptLoader()
    return _prompt_loader

