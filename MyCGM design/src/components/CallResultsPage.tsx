import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Utensils, Activity, Moon, FileText, Zap, CheckCircle2, Circle, Clock, Check, Plus, Minus, ChevronDown, ChevronUp, Copy, Pencil, X as XIcon } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Checkbox } from './ui/checkbox';

interface CallResultsPageProps {
  onBack: () => void;
}

type GoalStatus = 'ACHIEVED' | 'IN PROGRESS' | 'NOT STARTED';

interface Goal {
  id: number;
  title: string;
  status: GoalStatus;
  currentBehavior?: string;
  recommendation: string;
}

interface Todo {
  id: number;
  title: string;
  description?: string;
  category: 'diet' | 'exercise' | 'sleep' | 'stress' | 'medication' | 'other';
  health_benefit: string;
  time_of_day: string;
  time_description: string;
  target_count: number;
  current_count: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  selected: boolean; // Whether user wants to track this todo
}

export function CallResultsPage({ onBack }: CallResultsPageProps) {
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [todos, setTodos] = useState<Todo[]>([
    {
      id: 1,
      title: 'Eat a nutritious breakfast before work (Greek yogurt + nuts or boiled eggs)',
      category: 'diet',
      health_benefit: 'Reduces hunger-related blood sugar drops, stabilizes morning glucose levels',
      time_of_day: '09:00-10:00',
      time_description: 'Before work',
      target_count: 7,
      current_count: 0,
      status: 'pending',
      selected: true,
    },
    {
      id: 2,
      title: 'Exercise for 30 minutes after dinner (brisk walk or light jog)',
      category: 'exercise',
      health_benefit: 'Improves insulin sensitivity, helps control blood sugar',
      time_of_day: '20:00-21:00',
      time_description: '1 hour after dinner',
      target_count: 3,
      current_count: 0,
      status: 'pending',
      selected: true,
    },
    {
      id: 3,
      title: 'Go to bed before 11 PM every night',
      category: 'sleep',
      health_benefit: 'Improves sleep quality, aids in blood sugar regulation',
      time_of_day: '22:30-23:00',
      time_description: 'Before bedtime',
      target_count: 7,
      current_count: 0,
      status: 'pending',
      selected: true,
    },
    {
      id: 4,
      title: 'Drink 8 glasses of water throughout the day',
      category: 'other',
      health_benefit: 'Maintains hydration, supports metabolism',
      time_of_day: '08:00-20:00',
      time_description: 'Throughout the day',
      target_count: 7,
      current_count: 2,
      status: 'in_progress',
      selected: true,
    },
  ]);

  // Mock data - concise summary
  const conciseSummary = "Julia maintains a balanced diet with oatmeal and berries for breakfast, salads with grilled chicken for lunch, and lean protein with vegetables for dinner. She exercises regularly at the gym 3-4 times per week and takes daily 30-minute walks. Her sleep schedule is consistent, getting 7-8 hours per night from 11 PM to 7 AM. Overall, Julia demonstrates good health habits with room for improvement in vegetable intake and meal timing.";

  const goals: Goal[] = [
    {
      id: 1,
      title: 'Consume more vegetables, aiming for 3-5 servings per day',
      status: 'IN PROGRESS',
      currentBehavior: "You are currently including broccoli and tomatoes in your lunch, but it's unclear if you're reaching the target of 3-5 servings daily.",
      recommendation: 'To help meet your vegetable goal, consider adding a serving of vegetables to your breakfast or dinner, such as spinach or bell peppers. This can be a delicious way to increase your intake!',
    },
    {
      id: 2,
      title: 'Increase cruciferous vegetable intake to one serving per day',
      status: 'NOT STARTED',
      recommendation: 'Try to include a cruciferous vegetable like broccoli or cauliflower in your meals a few times a week. Even small steps can lead to achieving this goal!',
    },
    {
      id: 3,
      title: 'Limit added fats to 2-3 servings of fats or oils per day, and limit added sugars to 5 or fewer servings per week',
      status: 'ACHIEVED',
      currentBehavior: 'You are currently meeting this goal by limiting added fats and sugars.',
      recommendation: 'Keep up the great work! Continue to check labels and be mindful of portion sizes to maintain this healthy habit.',
    },
  ];

  // Sort goals: ACHIEVED first, then IN PROGRESS, then NOT STARTED
  const sortedGoals = [...goals].sort((a, b) => {
    const statusOrder: Record<GoalStatus, number> = {
      'ACHIEVED': 1,
      'IN PROGRESS': 2,
      'NOT STARTED': 3,
    };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  const achievedCount = goals.filter(g => g.status === 'ACHIEVED').length;
  const inProgressCount = goals.filter(g => g.status === 'IN PROGRESS').length;
  const totalGoals = goals.length;
  const progressPercentage = (achievedCount / totalGoals) * 100;

  const getStatusColor = (status: GoalStatus) => {
    switch (status) {
      case 'ACHIEVED':
        return 'bg-emerald-500 text-white hover:bg-emerald-500';
      case 'IN PROGRESS':
        return 'bg-amber-500 text-white hover:bg-amber-500';
      case 'NOT STARTED':
        return 'bg-gray-400 text-white hover:bg-gray-400';
    }
  };

  const getGoalIcon = (status: GoalStatus) => {
    switch (status) {
      case 'ACHIEVED':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'IN PROGRESS':
        return <Clock className="w-5 h-5" />;
      case 'NOT STARTED':
        return <Circle className="w-5 h-5" />;
    }
  };

  const getGoalNumberColor = (status: GoalStatus) => {
    switch (status) {
      case 'ACHIEVED':
        return 'bg-emerald-500 text-white';
      case 'IN PROGRESS':
        return 'bg-amber-500 text-white';
      case 'NOT STARTED':
        return 'bg-gray-400 text-white';
    }
  };

  // Todo helper functions
  const parseTimeOfDay = (timeOfDay: string): number | null => {
    if (!timeOfDay || timeOfDay === '全天') return null;
    const match = timeOfDay.match(/^(\d{2}):(\d{2})/);
    if (!match) return null;
    const hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    return hours * 60 + minutes;
  };

  const calculateTimeDistance = (currentTime: number, todoTime: number): number => {
    if (todoTime >= currentTime) {
      return todoTime - currentTime;
    } else {
      return 1440 + (todoTime - currentTime);
    }
  };

  const isTodoUrgent = (todo: Todo): boolean => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const todoTime = parseTimeOfDay(todo.time_of_day);
    if (!todoTime) return false;
    const endTimeMatch = todo.time_of_day.match(/-(\d{2}):(\d{2})/);
    if (!endTimeMatch) return false;
    const endTime = parseInt(endTimeMatch[1]) * 60 + parseInt(endTimeMatch[2]);
    return currentTime >= todoTime && currentTime <= endTime;
  };

  const isTodoOverdue = (todo: Todo): boolean => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const endTimeMatch = todo.time_of_day.match(/-(\d{2}):(\d{2})/);
    if (!endTimeMatch) return false;
    const endTime = parseInt(endTimeMatch[1]) * 60 + parseInt(endTimeMatch[2]);
    return currentTime > endTime;
  };

  const sortTodosByUrgency = (todos: Todo[]): Todo[] => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    return [...todos].sort((a, b) => {
      const aTime = parseTimeOfDay(a.time_of_day);
      const bTime = parseTimeOfDay(b.time_of_day);
      
      if (!aTime) return 1;
      if (!bTime) return -1;
      
      const aDistance = calculateTimeDistance(currentTime, aTime);
      const bDistance = calculateTimeDistance(currentTime, bTime);
      
      return aDistance - bDistance;
    });
  };

  const handleToggleTodo = (todoId: number) => {
    setTodos(prevTodos => 
      prevTodos.map(todo => 
        todo.id === todoId ? { ...todo, selected: !todo.selected } : todo
      )
    );
  };

  const handleUpdateFrequency = (todoId: number, delta: number) => {
    setTodos(prevTodos => 
      prevTodos.map(todo => {
        if (todo.id === todoId) {
          const newCount = Math.max(1, Math.min(7, todo.target_count + delta));
          return { ...todo, target_count: newCount };
        }
        return todo;
      })
    );
  };

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo({ ...todo });
  };

  const handleSaveEdit = (updatedTodo: Todo) => {
    setTodos(prevTodos => 
      prevTodos.map(todo => 
        todo.id === updatedTodo.id ? updatedTodo : todo
      )
    );
    setEditingTodo(null);
  };

  const getCategoryIcon = (category: Todo['category']) => {
    switch (category) {
      case 'diet':
        return <Utensils className="w-5 h-5" />;
      case 'exercise':
        return <Activity className="w-5 h-5" />;
      case 'sleep':
        return <Moon className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: Todo['category']) => {
    switch (category) {
      case 'diet':
        return 'bg-orange-100 text-orange-600';
      case 'exercise':
        return 'bg-green-100 text-green-600';
      case 'sleep':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-blue-100 text-blue-600';
    }
  };

  const sortedTodos = sortTodosByUrgency(todos);
  const urgentTodos = sortedTodos.filter(isTodoUrgent);
  const upcomingTodos = sortedTodos.filter(t => !isTodoUrgent(t) && !isTodoOverdue(t));
  const overdueTodos = sortedTodos.filter(isTodoOverdue);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col max-w-[390px] mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center flex-shrink-0 shadow-sm">
        <button onClick={onBack} className="p-2 -ml-2 active:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h2 className="text-gray-800 ml-3">Call Summary</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="px-4 py-5 space-y-4">
            {/* Summary Card - Collapsible */}
            <div className="bg-[#F5F7FA] rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6">
                {/* Header with Copy */}
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-[#5B7FF3] flex items-center gap-2">
                    <span>📋</span>
                    Conversation Summary
                  </h3>
                  <button 
                    className="p-1.5 hover:bg-white rounded-lg transition-colors active:scale-95"
                    title="Copy summary"
                  >
                    <Copy className="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                {/* Call Info */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#5B7FF3]/10 flex items-center justify-center">
                      <Clock className="w-3.5 h-3.5 text-[#5B7FF3]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Duration</p>
                      <p className="text-sm text-gray-700">12 min 34 sec</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Today</p>
                    <p className="text-sm text-gray-700">2:30 PM</p>
                  </div>
                </div>

                {/* Content with max-height and gradient fade */}
                <div className="relative">
                  <div 
                    className={`space-y-4 transition-all duration-300 ${
                      isSummaryExpanded ? 'max-h-none' : 'max-h-[120px] overflow-hidden'
                    }`}
                  >
                    <div>
                      <h4 className="text-sm text-gray-700 mb-2">Overview</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Julia maintains a balanced diet with oatmeal and berries for breakfast, salads with grilled chicken for lunch, and lean protein with vegetables for dinner.
                      </p>
                    </div>

                    <div className="h-px bg-gray-200" />

                    <div>
                      <h4 className="text-sm text-gray-700 mb-3">Key Findings</h4>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#5B7FF3] mt-2 flex-shrink-0"></div>
                          <p className="text-sm text-gray-600 leading-relaxed">Exercises regularly at the gym 3-4 times per week with daily 30-minute walks</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#5B7FF3] mt-2 flex-shrink-0"></div>
                          <p className="text-sm text-gray-600 leading-relaxed">Consistent sleep schedule: 7-8 hours per night (11 PM - 7 AM)</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#5B7FF3] mt-2 flex-shrink-0"></div>
                          <p className="text-sm text-gray-600 leading-relaxed">Room for improvement in vegetable intake and meal timing</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Gradient fade when collapsed */}
                  {!isSummaryExpanded && (
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#F5F7FA] to-transparent pointer-events-none" />
                  )}
                </div>
              </div>

              {/* Expand/Collapse Button */}
              <button
                onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                className="w-full py-3 border-t border-gray-200 flex items-center justify-center gap-2 text-[#5B7FF3] hover:bg-white/50 transition-colors active:scale-[0.99]"
              >
                <span className="text-sm">{isSummaryExpanded ? 'Show less' : 'Read more'}</span>
                {isSummaryExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Action Items Section Header - Integrated design */}
            <div className="pt-2 pb-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-[#5B7FF3]">✅ Your Action Items</h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Select habits to track and adjust weekly frequency
              </p>
            </div>

            {/* Todo List */}
            <div className="space-y-3">
              {todos.map(todo => (
                <TodoItemCard 
                  key={todo.id} 
                  todo={todo} 
                  onToggleSelect={handleToggleTodo}
                  onUpdateFrequency={handleUpdateFrequency}
                  onEdit={handleEditTodo}
                  onSave={handleSaveEdit}
                  getCategoryIcon={getCategoryIcon}
                  getCategoryColor={getCategoryColor}
                />
              ))}
            </div>

            {/* Bottom Summary Bar */}
            <div className="sticky bottom-0 bg-white rounded-2xl p-4 shadow-lg border border-gray-200 mt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Selected Items</p>
                  <p className="text-gray-800">{todos.filter(t => t.selected).length} of {todos.length} habits</p>
                </div>
                <button 
                  className="bg-[#5B7FF3] text-white px-6 py-3 rounded-full hover:bg-[#4A6FE3] active:scale-95 transition-all shadow-md"
                  onClick={onBack}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

interface TodoCardProps {
  todo: Todo;
  onToggle: (todoId: number) => void;
  getCategoryIcon: (category: Todo['category']) => JSX.Element;
  getCategoryColor: (category: Todo['category']) => string;
  isUrgent?: boolean;
  isOverdue?: boolean;
}

function TodoCard({ todo, onToggle, getCategoryIcon, getCategoryColor, isUrgent, isOverdue }: TodoCardProps) {
  const isCompleted = todo.current_count >= todo.target_count;
  
  return (
    <div className={`bg-gray-50 rounded-2xl p-4 transition-all ${
      isUrgent ? 'border-2 border-red-400 bg-red-50' : ''
    } ${isOverdue ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3">
        <Checkbox
          id={`todo-${todo.id}`}
          checked={isCompleted}
          onCheckedChange={() => !isCompleted && onToggle(todo.id)}
          className="w-5 h-5 mt-0.5"
          disabled={isCompleted}
        />
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className={`text-gray-800 leading-relaxed ${isCompleted ? 'line-through opacity-70' : ''}`}>
              {todo.title}
            </p>
            <span className="text-gray-500 text-sm whitespace-nowrap">
              {todo.current_count}/{todo.target_count}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Clock className="w-4 h-4" />
            <span>{todo.time_of_day}</span>
          </div>
          
          <div className="flex items-start gap-2">
            <span className="text-sm">💡</span>
            <p className="text-gray-600">{todo.health_benefit}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TodoItemCardProps {
  todo: Todo;
  onToggleSelect: (todoId: number) => void;
  onUpdateFrequency: (todoId: number, delta: number) => void;
  onEdit: (todo: Todo) => void;
  onSave: (todo: Todo) => void;
  getCategoryIcon: (category: Todo['category']) => JSX.Element;
  getCategoryColor: (category: Todo['category']) => string;
}

function TodoItemCard({ todo, onToggleSelect, onUpdateFrequency, onEdit, onSave, getCategoryIcon, getCategoryColor }: TodoItemCardProps) {
  const [isBenefitExpanded, setIsBenefitExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(todo.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditedTitle(todo.title);
  };

  const handleSave = () => {
    if (editedTitle.trim()) {
      onSave({ ...todo, title: editedTitle.trim() });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedTitle(todo.title);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };
  
  return (
    <div className={`rounded-3xl p-4 shadow-sm border transition-all relative group ${
      todo.selected 
        ? 'bg-white border-gray-100' 
        : 'bg-gray-50 border-gray-200 opacity-60'
    }`}>
      {/* Edit Button - Top Right Corner - Only show when NOT editing */}
      {!isEditing && (
        <button
          onClick={handleStartEdit}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-gray-100 hover:bg-[#5B7FF3] hover:text-white text-gray-400 opacity-0 group-hover:opacity-100 transition-all active:scale-95"
          title="Edit habit"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Save/Cancel Buttons - Only show when editing */}
      {isEditing && (
        <div className="absolute top-4 right-4 flex items-center gap-1">
          <button
            onClick={handleSave}
            className="p-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-all active:scale-95"
            title="Save changes"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCancel}
            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all active:scale-95"
            title="Cancel"
          >
            <XIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      
      <div className="flex items-start gap-3">
        {/* Left: Checkbox for selection */}
        <div className="flex-shrink-0 mt-0.5">
          <Checkbox
            id={`todo-select-${todo.id}`}
            checked={todo.selected}
            onCheckedChange={() => onToggleSelect(todo.id)}
            className="w-5 h-5 data-[state=checked]:bg-[#5B7FF3] data-[state=checked]:border-[#5B7FF3]"
          />
        </div>

        {/* Content - Full Width */}
        <div className="flex-1 min-w-0 pr-8">
          {/* Title with Category Icon */}
          <div className="flex items-start gap-2 mb-3">
            <button
              onClick={() => setIsBenefitExpanded(!isBenefitExpanded)}
              className={`w-6 h-6 rounded-full ${getCategoryColor(todo.category)} flex items-center justify-center flex-shrink-0 mt-0.5 hover:scale-110 transition-transform active:scale-95 cursor-pointer`}
              title="Click to view health benefit"
            >
              <div className="scale-75">
                {getCategoryIcon(todo.category)}
              </div>
            </button>
            <p className="text-gray-800 leading-relaxed flex-1">
              {isEditing ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full px-1 py-0.5 border-b border-gray-300 focus:outline-none focus:border-gray-500"
                />
              ) : (
                <span
                  className="cursor-pointer"
                  onClick={handleStartEdit}
                >
                  {todo.title}
                </span>
              )}
            </p>
          </div>
          
          {/* Frequency Adjuster */}
          <div className="ml-8 mb-2">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Weekly frequency:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUpdateFrequency(todo.id, -1)}
                  disabled={todo.target_count <= 1 || !todo.selected}
                  className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-100"
                >
                  <Minus className="w-4 h-4 text-gray-600" />
                </button>
                <div className="w-12 text-center">
                  <span className="text-[#5B7FF3] font-medium">{todo.target_count}</span>
                  <span className="text-gray-500 text-sm ml-0.5">x</span>
                </div>
                <button
                  onClick={() => onUpdateFrequency(todo.id, 1)}
                  disabled={todo.target_count >= 7 || !todo.selected}
                  className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-100"
                >
                  <Plus className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <span className="text-sm text-gray-500">/ week</span>
            </div>
          </div>
          
          {/* Expandable Health Benefit */}
          {isBenefitExpanded && (
            <div className="ml-8 mt-3 bg-[#F5F7FA] border border-gray-100 rounded-2xl p-3 shadow-sm animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-start gap-2">
                <span className="text-sm">💡</span>
                <p className="text-gray-600 text-sm leading-relaxed flex-1">{todo.health_benefit}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}