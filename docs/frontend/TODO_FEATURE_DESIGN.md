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
  
  // 每日打卡状态
  completed_today: boolean;          // 今天是否已打卡（每天重置为 false）
  photos?: string[];                 // 上传的照片 URL 数组（可选）
  
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
│ ☑ 每天上班前吃营养早餐（希腊酸奶+坚果 / 煮鸡蛋）          │
│   💡 减少饥饿导致的血糖降低，稳定上午血糖水平              │
│   ⏰ 上班前 (9:00-10:00) ← 正在进行中！                   │
│   📷 [上传照片]                                           │
│   🖼️ [照片预览] [照片预览]                                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 📅 今日其他 TODO                                          │
├─────────────────────────────────────────────────────────┤
│ □ 晚饭后运动30分钟（快走/慢跑）                            │
│   💡 提高胰岛素敏感性，帮助控制血糖                        │
│   ⏰ 晚饭后1小时 (20:00-21:00)                            │
│   📷 [上传照片]                                           │
├─────────────────────────────────────────────────────────┤
│ □ 每晚11点前上床睡觉                                      │
│   💡 改善睡眠质量，帮助血糖调节                            │
│   ⏰ 睡前 (22:30-23:00)                                   │
│   📷 [上传照片]                                           │
└─────────────────────────────────────────────────────────┘
```

### 方案 B: 极简列表式（推荐用于移动端）

```
┌─────────────────────────────────────┐
│ 🔥 现在该做                          │
├─────────────────────────────────────┤
│ ☑ 上班前吃营养早餐                   │
│   💡 稳定上午血糖                    │
│   ⏰ 9:00-10:00                      │
│   📷 [上传照片] 🖼️ [照片]             │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 📅 今日待办                          │
├─────────────────────────────────────┤
│ □ 晚饭后运动30分钟                   │
│   ⏰ 20:00-21:00                     │
│   📷 [上传照片]                       │
├─────────────────────────────────────┤
│ □ 11点前睡觉                         │
│   ⏰ 22:30-23:00                     │
│   📷 [上传照片]                       │
└─────────────────────────────────────┘
```

### 方案 C: 超简列表式（首页概览）

```
本周待办
─────────────────
☑ 上班前吃营养早餐
□ 晚饭后运动30分钟
☑ 11点前睡觉

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

### 3. 每日打卡逻辑

**核心原则：每天只记录一次打卡**

无论用户选择打勾还是上传照片，`current_count` 每天只增加一次。

#### 3.1 打勾操作

```typescript
/**
 * 处理打勾操作
 * 
 * 规则:
 * - 如果今天还未打卡 (`completed_today=false`)，点击 checkbox 会标记为已打卡并增加计数
 * - 如果今天已打卡，checkbox 显示勾选状态，但点击不会再次增加计数
 */
async function handleCheckboxClick(todo: Todo): Promise<void> {
  // 如果今天已打卡，不允许再次打卡
  if (todo.completed_today) {
    toast.info('今天已经打卡了！');
    return;
  }
  
  try {
    // 调用后端 API
    await axios.patch(`/api/todos/${todo.id}`, {
      completed_today: true,
      current_count: todo.current_count + 1,
      completed_at: new Date().toISOString()
    });
    
    // 更新本地状态
    todo.completed_today = true;
    todo.current_count += 1;
    
    // 显示成功提示
    toast.success('✅ 打卡成功！继续保持！');
  } catch (error) {
    console.error('Failed to complete TODO:', error);
    toast.error('❌ 操作失败，请重试');
  }
}
```

#### 3.2 上传照片操作

```typescript
/**
 * 处理上传照片操作
 * 
 * 规则:
 * - 第一次上传照片时，自动标记为已打卡并增加计数
 * - 后续上传更多照片时，不再增加计数，只添加照片
 * - 即使今天已打卡，仍可以继续上传照片
 */
async function handlePhotoUpload(todo: Todo, photoFile: File): Promise<void> {
  try {
    // 上传照片到服务器
    const formData = new FormData();
    formData.append('photo', photoFile);
    
    const uploadResponse = await axios.post(`/api/todos/${todo.id}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    const photoUrl = uploadResponse.data.photo_url;
    
    // 判断是否是第一次上传（今天还未打卡）
    const isFirstUpload = !todo.completed_today;
    
    // 更新 TODO 状态
    await axios.patch(`/api/todos/${todo.id}`, {
      completed_today: true,
      current_count: isFirstUpload ? todo.current_count + 1 : todo.current_count,
      photos: [...(todo.photos || []), photoUrl]
    });
    
    // 更新本地状态
    todo.completed_today = true;
    if (isFirstUpload) {
      todo.current_count += 1;
    }
    todo.photos = [...(todo.photos || []), photoUrl];
    
    // 显示成功提示
    if (isFirstUpload) {
      toast.success('✅ 照片上传成功，打卡完成！');
    } else {
      toast.success('📷 照片已添加！');
    }
  } catch (error) {
    console.error('Failed to upload photo:', error);
    toast.error('❌ 上传失败，请重试');
  }
}
```

#### 3.3 每日重置逻辑

```typescript
/**
 * 每日重置 completed_today 状态
 * 
 * 在应用启动时或日期变更时调用
 */
function resetDailyStatus(todos: Todo[]): void {
  const today = new Date().toDateString();
  const lastResetDate = localStorage.getItem('lastResetDate');
  
  // 如果是新的一天，重置所有 TODO 的 completed_today 状态
  if (lastResetDate !== today) {
    todos.forEach(todo => {
      todo.completed_today = false;
    });
    localStorage.setItem('lastResetDate', today);
  }
}
```

#### 3.4 完整的交互流程

**场景 1: 用户选择打勾**
```
点击 checkbox 
  → 检查 completed_today=false
  → current_count += 1
  → completed_today = true
  → Checkbox 显示勾选状态
  → 下一天进入时，completed_today 重置为 false，勾消失，可以再次打卡
```

**场景 2: 用户选择上传照片**
```
第一次上传照片
  → completed_today=true
  → current_count += 1
  → 照片添加到数组首位
  → Checkbox 自动显示勾选状态

继续上传更多照片
  → 只添加照片，不增加计数
  → Checkbox 保持勾选状态
```

**场景 3: 用户混合操作**
```
先打勾
  → completed_today=true
  → 计数 +1

再上传照片
  → 只添加照片，不增加计数
  → Checkbox 保持勾选状态
```

**整个系统现在逻辑清晰，确保每天只打卡一次，同时支持上传多张照片记录，完美符合健康管理应用的需求！**

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
  onCheckboxClick: (todo: Todo) => void;
  onPhotoUpload: (todo: Todo, photoFile: File) => void;
  onViewDetails?: (todoId: number) => void;
}

const TodoCard: React.FC<TodoCardProps> = ({ 
  todo, 
  variant, 
  onCheckboxClick, 
  onPhotoUpload,
  onViewDetails 
}) => {
  const isUrgent = isTodoUrgent(todo);
  const isOverdue = isTodoOverdue(todo);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onPhotoUpload(todo, file);
    }
  };
  
  if (variant === 'minimal') {
    return (
      <div className="todo-card-minimal">
        <Checkbox 
          checked={todo.completed_today} 
          onChange={() => onCheckboxClick(todo)} 
        />
        <span className="title">{todo.title}</span>
      </div>
    );
  }
  
  if (variant === 'compact') {
    return (
      <div className={`todo-card-compact ${isUrgent ? 'urgent' : ''}`}>
        <Checkbox 
          checked={todo.completed_today} 
          onChange={() => onCheckboxClick(todo)} 
        />
        <div className="content">
          <div className="title">{todo.title}</div>
          <div className="meta">
            <span className="benefit">💡 {todo.health_benefit}</span>
            <span className="time">⏰ {todo.time_of_day}</span>
          </div>
          <div className="photo-section">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="upload-photo-btn"
            >
              📷 上传照片
            </button>
            {todo.photos && todo.photos.length > 0 && (
              <div className="photo-preview">
                {todo.photos.map((photo, index) => (
                  <img key={index} src={photo} alt={`Photo ${index + 1}`} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // variant === 'detailed'
  return (
    <div className={`todo-card-detailed ${isUrgent ? 'urgent' : ''} ${isOverdue ? 'overdue' : ''}`}>
      <Checkbox 
        checked={todo.completed_today} 
        onChange={() => onCheckboxClick(todo)} 
      />
      <div className="content">
        <div className="title">{todo.title}</div>
        <div className="benefit">💡 {todo.health_benefit}</div>
        <div className="time">
          ⏰ {todo.time_description} ({todo.time_of_day})
          {isUrgent && <span className="badge">正在进行中！</span>}
        </div>
        <div className="photo-section">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="upload-photo-btn"
          >
            📷 上传照片
          </button>
          {todo.photos && todo.photos.length > 0 && (
            <div className="photo-preview">
              {todo.photos.map((photo, index) => (
                <img key={index} src={photo} alt={`Photo ${index + 1}`} />
              ))}
            </div>
          )}
        </div>
        {onViewDetails && (
          <div className="actions">
            <button onClick={() => onViewDetails(todo.id)}>详情</button>
          </div>
        )}
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
    // 每日重置逻辑
    resetDailyStatus(todos);
  }, [userId]);
  
  const fetchTodos = async () => {
    try {
      const response = await axios.get(`/api/todos/weekly/${userId}?order_by_time=true`);
      const sortedTodos = sortTodosByUrgency(response.data);
      const filteredTodos = maxItems ? sortedTodos.slice(0, maxItems) : sortedTodos;
      setTodos(filteredTodos);
      // 重置每日状态
      resetDailyStatus(filteredTodos);
    } catch (error) {
      console.error('Failed to fetch todos:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCheckboxClick = async (todo: Todo) => {
    // 调用交互逻辑部分定义的 handleCheckboxClick 函数
    if (todo.completed_today) {
      toast.info('今天已经打卡了！');
      return;
    }
    
    try {
      await axios.patch(`/api/todos/${todo.id}`, {
        completed_today: true,
        current_count: todo.current_count + 1,
        completed_at: new Date().toISOString()
      });
      await fetchTodos(); // 刷新列表
      toast.success('✅ 打卡成功！继续保持！');
    } catch (error) {
      console.error('Failed to complete TODO:', error);
      toast.error('❌ 操作失败，请重试');
    }
  };
  
  const handlePhotoUpload = async (todo: Todo, photoFile: File) => {
    try {
      // 上传照片到服务器
      const formData = new FormData();
      formData.append('photo', photoFile);
      
      const uploadResponse = await axios.post(`/api/todos/${todo.id}/photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const photoUrl = uploadResponse.data.photo_url;
      const isFirstUpload = !todo.completed_today;
      
      // 更新 TODO 状态
      await axios.patch(`/api/todos/${todo.id}`, {
        completed_today: true,
        current_count: isFirstUpload ? todo.current_count + 1 : todo.current_count,
        photos: [...(todo.photos || []), photoUrl]
      });
      
      await fetchTodos(); // 刷新列表
      
      if (isFirstUpload) {
        toast.success('✅ 照片上传成功，打卡完成！');
      } else {
        toast.success('📷 照片已添加！');
      }
    } catch (error) {
      console.error('Failed to upload photo:', error);
      toast.error('❌ 上传失败，请重试');
    }
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
            <TodoCard 
              key={todo.id} 
              todo={todo} 
              variant={variant} 
              onCheckboxClick={handleCheckboxClick}
              onPhotoUpload={handlePhotoUpload}
            />
          ))}
        </section>
      )}
      
      {upcomingTodos.length > 0 && (
        <section className="upcoming-section">
          <h3>📅 今日其他 TODO</h3>
          {upcomingTodos.map(todo => (
            <TodoCard 
              key={todo.id} 
              todo={todo} 
              variant={variant} 
              onCheckboxClick={handleCheckboxClick}
              onPhotoUpload={handlePhotoUpload}
            />
          ))}
        </section>
      )}
      
      {overdueTodos.length > 0 && (
        <section className="overdue-section">
          <h3>⏰ 已过时间</h3>
          {overdueTodos.map(todo => (
            <TodoCard 
              key={todo.id} 
              todo={todo} 
              variant={variant} 
              onCheckboxClick={handleCheckboxClick}
              onPhotoUpload={handlePhotoUpload}
            />
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
    "completed_today": false,
    "photos": [],
    "week_start": "2025-11-11",
    "created_at": "2025-11-15T03:00:00Z"
  }
]
```

### 2. 更新 TODO 状态（打勾操作）

```
PATCH /api/todos/:todoId
```

**请求体**:
```json
{
  "completed_today": true,
  "current_count": 1,
  "completed_at": "2025-11-15T09:45:00Z",
  "status": "in_progress"
}
```

### 3. 上传照片

```
POST /api/todos/:todoId/photos
```

**请求体** (FormData):
```
photo: [File]
```

**响应**:
```json
{
  "photo_url": "https://example.com/photos/todo_1_photo_1.jpg"
}
```

### 4. 更新 TODO 状态（包含照片）

```
PATCH /api/todos/:todoId
```

**请求体**:
```json
{
  "completed_today": true,
  "current_count": 1,
  "photos": ["https://example.com/photos/todo_1_photo_1.jpg"]
}
```

### 5. 获取 TODO 详情

```
GET /api/todos/:todoId
```

---

## 🎯 实施优先级

### Phase 1: 基础功能（必须）
- [ ] TodoCard 组件（compact 模式）
- [ ] TodoList 组件（基础列表）
- [ ] 每日打卡逻辑（completed_today 状态管理）
- [ ] 打勾操作（每天只记录一次）
- [ ] 按时间排序逻辑
- [ ] 每日重置逻辑（completed_today 每天重置为 false）

### Phase 2: 增强功能（推荐）
- [ ] 照片上传功能
- [ ] 照片预览功能
- [ ] 紧急 TODO 高亮
- [ ] 按紧急程度分组显示
- [ ] 完成动画效果

### Phase 3: 高级功能（可选）
- [ ] TODO 详情页
- [ ] 编辑 TODO
- [ ] 删除/取消 TODO
- [ ] 删除照片功能
- [ ] TODO 历史记录
- [ ] 周报统计

---

## 📝 注意事项

1. **时间处理**:
   - 使用用户本地时区
   - 考虑跨天场景（如晚上 23:00 的 TODO）
   - 每日重置 `completed_today` 状态需要在应用启动时或日期变更时触发

2. **每日打卡逻辑**:
   - **核心原则：每天只记录一次打卡**
   - 打勾和上传照片都会触发打卡，但只有第一次操作会增加 `current_count`
   - 如果今天已打卡，再次打勾应该提示用户，而不是增加计数
   - 即使今天已打卡，用户仍可以继续上传照片（只添加照片，不增加计数）

3. **照片上传**:
   - 支持多张照片上传
   - 照片应该按时间倒序排列（最新的在前）
   - 需要处理照片上传失败的情况
   - 考虑照片大小限制和格式验证
   - 照片预览应该支持点击放大查看

4. **性能优化**:
   - TODO 列表使用虚拟滚动（如果数量很多）
   - 缓存 TODO 数据，避免频繁请求
   - 照片上传使用压缩或缩略图

5. **用户体验**:
   - 完成 TODO 时给予即时反馈（动画、音效）
   - 照片上传时显示上传进度
   - 提供清晰的状态反馈（已打卡/未打卡）

6. **无障碍**:
   - 使用语义化 HTML
   - 支持键盘操作
   - 提供屏幕阅读器支持
   - 照片上传按钮应该有清晰的标签

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

**文档版本**: v2.0  
**最后更新**: 2025-01-XX  
**维护者**: Yijia Liu

## 📋 更新日志

### v2.0 (2025-01-XX)
- ✅ 添加每日打卡逻辑（每天只记录一次打卡）
- ✅ 添加照片上传功能
- ✅ 移除进度数字显示（"x/y"）
- ✅ 优化 UI 设计，界面更加简洁
- ✅ 完善交互流程（打勾、上传照片、混合操作）
- ✅ 添加每日重置逻辑（completed_today 每天重置为 false）

### v1.0 (2025-11-15)
- 初始版本

