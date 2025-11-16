# 前端 TODO 功能设计文档

## 📋 概述

本文档描述前端 TODO 功能的设计方案，包括数据结构、UI 设计、交互逻辑和实现要点。

---

## 🎯 核心功能

### 1. TODO 数据结构

后端返回的 TODO 数据结构：

```typescript
interface Todo {
  id: number;
  user_id: string;
  conversation_id: string;
  
  // 核心内容
  title: string;                    // 主要描述（如"每天上班前吃营养早餐（希腊酸奶+坚果 / 煮鸡蛋）"）
  description: string;               // 补充说明（通常为空）
  category: 'diet' | 'exercise' | 'sleep' | 'stress' | 'medication' | 'other';
  
  // 健康影响
  health_benefit: string;            // 健康好处（如"减少饥饿导致的血糖降低，稳定上午血糖水平"）
  
  // 时间信息
  time_of_day: string;               // 执行时间段（如"09:00-10:00"）
  time_description: string;          // 时间描述（如"上班前"）
  
  // 进度跟踪
  target_count: number;              // 目标次数
  current_count: number;             // 当前完成次数
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  
  // 时间范围
  week_start: string;                // 本周开始日期
  created_at: string;
  completed_at?: string;
}
```

---

## 🎨 UI 设计

### 方案 A: 详细卡片式（推荐用于桌面端）

```
┌─────────────────────────────────────────────────────────┐
│ 🔥 紧急 TODO                                             │
├─────────────────────────────────────────────────────────┤
│ □ 每天上班前吃营养早餐（希腊酸奶+坚果 / 煮鸡蛋）          │
│   💡 减少饥饿导致的血糖降低，稳定上午血糖水平              │
│   ⏰ 上班前 (9:00-10:00) ← 正在进行中！                   │
│   📊 0/7                                                  │
│   [完成] [详情]                                           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 📅 今日其他 TODO                                          │
├─────────────────────────────────────────────────────────┤
│ □ 晚饭后运动30分钟（快走/慢跑）                            │
│   💡 提高胰岛素敏感性，帮助控制血糖                        │
│   ⏰ 晚饭后1小时 (20:00-21:00)                            │
│   📊 0/3                                                  │
│   [完成] [详情]                                           │
├─────────────────────────────────────────────────────────┤
│ □ 每晚11点前上床睡觉                                      │
│   💡 改善睡眠质量，帮助血糖调节                            │
│   ⏰ 睡前 (22:30-23:00)                                   │
│   📊 0/7                                                  │
│   [完成] [详情]                                           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ ✅ 已完成                                                 │
├─────────────────────────────────────────────────────────┤
│ ☑ 每天上班前吃营养早餐                                    │
│   完成时间: 09:45                                         │
│   📊 1/7                                                  │
└─────────────────────────────────────────────────────────┘
```

### 方案 B: 极简列表式（推荐用于移动端）

```
┌─────────────────────────────────────┐
│ 🔥 现在该做                          │
├─────────────────────────────────────┤
│ □ 上班前吃营养早餐 (0/7)             │
│   💡 稳定上午血糖                    │
│   ⏰ 9:00-10:00                      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 📅 今日待办                          │
├─────────────────────────────────────┤
│ □ 晚饭后运动30分钟 (0/3)             │
│   ⏰ 20:00-21:00                     │
├─────────────────────────────────────┤
│ □ 11点前睡觉 (0/7)                   │
│   ⏰ 22:30-23:00                     │
└─────────────────────────────────────┘
```

### 方案 C: 超简列表式（首页概览）

```
本周待办 (3/10)
─────────────────
□ 上班前吃营养早餐 (0/7)
□ 晚饭后运动30分钟 (0/3)
☑ 11点前睡觉 (1/7)

[查看全部]
```

---

## 🔄 交互逻辑

### 1. TODO 排序逻辑（按紧急程度）

```typescript
/**
 * 按紧急程度排序 TODO
 * 
 * 规则:
 * 1. 获取当前时间
 * 2. 计算每个 TODO 的 time_of_day 与当前时间的距离
 * 3. 距离最近的（最紧急的）排在最前面
 * 4. 已过时间的排在最后
 */
function sortTodosByUrgency(todos: Todo[]): Todo[] {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes(); // 转换为分钟数
  
  return todos.sort((a, b) => {
    // 解析时间段
    const aTime = parseTimeOfDay(a.time_of_day);
    const bTime = parseTimeOfDay(b.time_of_day);
    
    // 如果没有时间信息，排在最后
    if (!aTime) return 1;
    if (!bTime) return -1;
    
    // 计算与当前时间的距离
    const aDistance = calculateTimeDistance(currentTime, aTime);
    const bDistance = calculateTimeDistance(currentTime, bTime);
    
    return aDistance - bDistance;
  });
}

/**
 * 解析时间段（如 "09:00-10:00"）
 * 返回开始时间（分钟数）
 */
function parseTimeOfDay(timeOfDay: string): number | null {
  if (!timeOfDay || timeOfDay === '全天') return null;
  
  const match = timeOfDay.match(/^(\d{2}):(\d{2})/);
  if (!match) return null;
  
  const hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  return hours * 60 + minutes;
}

/**
 * 计算时间距离
 * 
 * 规则:
 * - 如果 TODO 时间在当前时间之后，距离 = TODO时间 - 当前时间
 * - 如果 TODO 时间已过，距离 = 1440 + (TODO时间 - 当前时间) （排到明天）
 */
function calculateTimeDistance(currentTime: number, todoTime: number): number {
  if (todoTime >= currentTime) {
    // TODO 时间在当前时间之后
    return todoTime - currentTime;
  } else {
    // TODO 时间已过，排到明天
    return 1440 + (todoTime - currentTime);
  }
}
```

### 2. TODO 状态管理

```typescript
/**
 * 判断 TODO 是否紧急（在时间窗口内）
 */
function isTodoUrgent(todo: Todo): boolean {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const todoTime = parseTimeOfDay(todo.time_of_day);
  if (!todoTime) return false;
  
  // 解析结束时间
  const endTimeMatch = todo.time_of_day.match(/-(\d{2}):(\d{2})/);
  if (!endTimeMatch) return false;
  
  const endTime = parseInt(endTimeMatch[1]) * 60 + parseInt(endTimeMatch[2]);
  
  // 如果当前时间在 TODO 时间窗口内，标记为紧急
  return currentTime >= todoTime && currentTime <= endTime;
}

/**
 * 判断 TODO 是否已过期（时间已过）
 */
function isTodoOverdue(todo: Todo): boolean {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const endTimeMatch = todo.time_of_day.match(/-(\d{2}):(\d{2})/);
  if (!endTimeMatch) return false;
  
  const endTime = parseInt(endTimeMatch[1]) * 60 + parseInt(endTimeMatch[2]);
  
  return currentTime > endTime;
}
```

### 3. TODO 完成操作

```typescript
/**
 * 标记 TODO 为完成
 */
async function completeTodo(todoId: number): Promise<void> {
  try {
    // 调用后端 API
    await axios.patch(`/api/todos/${todoId}`, {
      current_count: todo.current_count + 1,
      completed_at: new Date().toISOString(),
      status: todo.current_count + 1 >= todo.target_count ? 'completed' : 'in_progress'
    });
    
    // 更新本地状态
    // ...
    
    // 显示成功提示
    toast.success('✅ 已完成！继续保持！');
  } catch (error) {
    console.error('Failed to complete TODO:', error);
    toast.error('❌ 操作失败，请重试');
  }
}
```

---

## 📱 响应式设计

### 桌面端（> 768px）
- 使用**方案 A**（详细卡片式）
- 显示完整的 health_benefit
- 显示详细的时间信息
- 支持展开/折叠

### 移动端（≤ 768px）
- 使用**方案 B**（极简列表式）
- 只显示关键信息
- 点击可展开查看详情

### 首页概览（所有设备）
- 使用**方案 C**（超简列表式）
- 只显示前 3 个 TODO
- 点击"查看全部"跳转到 TODO 页面

---

## 🎨 UI 组件设计

### 1. TodoCard 组件

```typescript
interface TodoCardProps {
  todo: Todo;
  variant: 'detailed' | 'compact' | 'minimal';
  onComplete: (todoId: number) => void;
  onViewDetails?: (todoId: number) => void;
}

const TodoCard: React.FC<TodoCardProps> = ({ todo, variant, onComplete, onViewDetails }) => {
  const isUrgent = isTodoUrgent(todo);
  const isOverdue = isTodoOverdue(todo);
  
  if (variant === 'minimal') {
    return (
      <div className="todo-card-minimal">
        <Checkbox checked={todo.current_count > 0} onChange={() => onComplete(todo.id)} />
        <span className="title">{todo.title}</span>
        <span className="progress">({todo.current_count}/{todo.target_count})</span>
      </div>
    );
  }
  
  if (variant === 'compact') {
    return (
      <div className={`todo-card-compact ${isUrgent ? 'urgent' : ''}`}>
        <Checkbox checked={todo.current_count > 0} onChange={() => onComplete(todo.id)} />
        <div className="content">
          <div className="title">{todo.title}</div>
          <div className="meta">
            <span className="benefit">💡 {todo.health_benefit}</span>
            <span className="time">⏰ {todo.time_of_day}</span>
            <span className="progress">📊 {todo.current_count}/{todo.target_count}</span>
          </div>
        </div>
      </div>
    );
  }
  
  // variant === 'detailed'
  return (
    <div className={`todo-card-detailed ${isUrgent ? 'urgent' : ''} ${isOverdue ? 'overdue' : ''}`}>
      <Checkbox checked={todo.current_count > 0} onChange={() => onComplete(todo.id)} />
      <div className="content">
        <div className="title">{todo.title}</div>
        <div className="benefit">💡 {todo.health_benefit}</div>
        <div className="time">
          ⏰ {todo.time_description} ({todo.time_of_day})
          {isUrgent && <span className="badge">正在进行中！</span>}
        </div>
        <div className="progress">📊 {todo.current_count}/{todo.target_count}</div>
        <div className="actions">
          <button onClick={() => onComplete(todo.id)}>完成</button>
          {onViewDetails && <button onClick={() => onViewDetails(todo.id)}>详情</button>}
        </div>
      </div>
    </div>
  );
};
```

### 2. TodoList 组件

```typescript
interface TodoListProps {
  userId: string;
  variant: 'detailed' | 'compact' | 'minimal';
  maxItems?: number; // 最多显示多少个（用于首页概览）
}

const TodoList: React.FC<TodoListProps> = ({ userId, variant, maxItems }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchTodos();
  }, [userId]);
  
  const fetchTodos = async () => {
    try {
      const response = await axios.get(`/api/todos/weekly/${userId}?order_by_time=true`);
      const sortedTodos = sortTodosByUrgency(response.data);
      setTodos(maxItems ? sortedTodos.slice(0, maxItems) : sortedTodos);
    } catch (error) {
      console.error('Failed to fetch todos:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleComplete = async (todoId: number) => {
    await completeTodo(todoId);
    await fetchTodos(); // 刷新列表
  };
  
  if (loading) return <LoadingSpinner />;
  
  // 分组显示
  const urgentTodos = todos.filter(isTodoUrgent);
  const upcomingTodos = todos.filter(t => !isTodoUrgent(t) && !isTodoOverdue(t));
  const overdueTodos = todos.filter(isTodoOverdue);
  
  return (
    <div className="todo-list">
      {urgentTodos.length > 0 && (
        <section className="urgent-section">
          <h3>🔥 紧急 TODO</h3>
          {urgentTodos.map(todo => (
            <TodoCard key={todo.id} todo={todo} variant={variant} onComplete={handleComplete} />
          ))}
        </section>
      )}
      
      {upcomingTodos.length > 0 && (
        <section className="upcoming-section">
          <h3>📅 今日其他 TODO</h3>
          {upcomingTodos.map(todo => (
            <TodoCard key={todo.id} todo={todo} variant={variant} onComplete={handleComplete} />
          ))}
        </section>
      )}
      
      {overdueTodos.length > 0 && (
        <section className="overdue-section">
          <h3>⏰ 已过时间</h3>
          {overdueTodos.map(todo => (
            <TodoCard key={todo.id} todo={todo} variant={variant} onComplete={handleComplete} />
          ))}
        </section>
      )}
    </div>
  );
};
```

---

## 🔌 API 接口

### 1. 获取本周 TODO 列表

```
GET /api/todos/weekly/:userId?order_by_time=true
```

**响应**:
```json
[
  {
    "id": 1,
    "user_id": "user_123",
    "title": "每天上班前吃营养早餐（希腊酸奶+坚果 / 煮鸡蛋）",
    "health_benefit": "减少饥饿导致的血糖降低，稳定上午血糖水平",
    "time_of_day": "09:00-10:00",
    "time_description": "上班前",
    "category": "diet",
    "target_count": 7,
    "current_count": 0,
    "status": "pending",
    "week_start": "2025-11-11",
    "created_at": "2025-11-15T03:00:00Z"
  }
]
```

### 2. 更新 TODO 状态

```
PATCH /api/todos/:todoId
```

**请求体**:
```json
{
  "current_count": 1,
  "completed_at": "2025-11-15T09:45:00Z",
  "status": "in_progress"
}
```

### 3. 获取 TODO 详情

```
GET /api/todos/:todoId
```

---

## 🎯 实施优先级

### Phase 1: 基础功能（必须）
- [ ] TodoCard 组件（compact 模式）
- [ ] TodoList 组件（基础列表）
- [ ] 完成 TODO 操作
- [ ] 按时间排序逻辑

### Phase 2: 增强功能（推荐）
- [ ] 紧急 TODO 高亮
- [ ] 按紧急程度分组显示
- [ ] 进度条可视化
- [ ] 完成动画效果

### Phase 3: 高级功能（可选）
- [ ] TODO 详情页
- [ ] 编辑 TODO
- [ ] 删除/取消 TODO
- [ ] TODO 历史记录
- [ ] 周报统计

---

## 📝 注意事项

1. **时间处理**:
   - 使用用户本地时区
   - 考虑跨天场景（如晚上 23:00 的 TODO）

2. **性能优化**:
   - TODO 列表使用虚拟滚动（如果数量很多）
   - 缓存 TODO 数据，避免频繁请求

3. **用户体验**:
   - 完成 TODO 时给予即时反馈（动画、音效）
   - 显示进度百分比
   - 支持撤销操作

4. **无障碍**:
   - 使用语义化 HTML
   - 支持键盘操作
   - 提供屏幕阅读器支持

---

## 🎨 样式参考

### 颜色方案

```css
/* 紧急 TODO */
.urgent {
  border-left: 4px solid #ff6b6b;
  background-color: #fff5f5;
}

/* 已过期 TODO */
.overdue {
  opacity: 0.6;
  border-left: 4px solid #adb5bd;
}

/* 已完成 TODO */
.completed {
  opacity: 0.7;
  text-decoration: line-through;
}

/* 进行中 TODO */
.in-progress {
  border-left: 4px solid #4dabf7;
}
```

---

## 🚀 后续扩展

1. **智能提醒**:
   - 在 TODO 时间到达前 15 分钟发送通知
   - 支持自定义提醒时间

2. **数据分析**:
   - 显示本周完成率
   - 显示最常完成/最常遗漏的 TODO
   - 生成周报/月报

3. **社交功能**:
   - 分享 TODO 完成成就
   - 与好友一起完成 TODO

4. **AI 建议**:
   - 根据用户完成情况，AI 建议调整 TODO
   - 根据血糖数据，AI 建议新的 TODO

---

**文档版本**: v1.0  
**最后更新**: 2025-11-15  
**维护者**: Yijia Liu

