import { useState, useRef, useEffect } from 'react';
import { Plus, ChevronDown, ChevronUp, Pencil, Trash2, X as XIcon, Check, Utensils, Activity, Moon, FileText, Camera, ImagePlus, Sparkles, PartyPopper, Image as ImageIcon, TrendingUp, Target, Award, Flame, Zap, Star, Trophy, Medal, Crown, ChevronLeft, ChevronRight, Calendar, Clock, Bell, CheckCircle2, Circle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { motion, AnimatePresence } from 'framer-motion';
import { CompactProgressStats } from '@/components/CompactProgress';
import { TodayView } from '@/components/TodayView';
import { WeekProgress } from '@/components/WeekProgress';
import { WeeklySummaryModal } from '@/components/WeeklySummaryModal';

interface PhotoRecord {
  url: string;
  date: string; // "2024-11-15"
  timestamp: number;
}

interface TodoWithWeek {
  id: number;
  title: string;
  category: 'diet' | 'exercise' | 'sleep' | 'stress' | 'medication' | 'other';
  health_benefit: string;
  target_count: number;
  current_count: number;
  week_start_date: string; // "2024-11-11"
  status: 'pending' | 'in_progress' | 'completed';
  uploaded_images?: PhotoRecord[];
  completed_today?: boolean;
  fromCGM?: boolean; // Mark if it's from CGM
}

interface EnhancedGoalTabProps {
  // Props can be added later for integration
}

export function EnhancedGoalTab({}: EnhancedGoalTabProps = {}) {
  const [todos, setTodos] = useState<TodoWithWeek[]>([
    {
      id: 1,
      title: 'Eat a nutritious breakfast',
      category: 'diet',
      health_benefit: 'Stabilizes blood sugar levels',
      target_count: 7,
      current_count: 3,
      week_start_date: '2024-11-11',
      status: 'in_progress',
    },
    {
      id: 2,
      title: 'Exercise for 30 minutes',
      category: 'exercise',
      health_benefit: 'Improves insulin sensitivity',
      target_count: 3,
      current_count: 1,
      week_start_date: '2024-11-11',
      status: 'in_progress',
    },
    {
      id: 3,
      title: 'Sleep before 11 PM',
      category: 'sleep',
      health_benefit: 'Better sleep quality',
      target_count: 7,
      current_count: 5,
      week_start_date: '2024-11-11',
      status: 'in_progress',
    },
    // Historical todos
    {
      id: 4,
      title: 'Morning meditation 10 mins',
      category: 'other',
      health_benefit: 'Reduces stress',
      target_count: 7,
      current_count: 7,
      week_start_date: '2024-11-04',
      status: 'completed',
    },
    {
      id: 5,
      title: 'Drink 8 glasses of water',
      category: 'other',
      health_benefit: 'Maintains hydration',
      target_count: 7,
      current_count: 4,
      week_start_date: '2024-11-04',
      status: 'in_progress',
    },
    {
      id: 6,
      title: 'Walk 10,000 steps',
      category: 'exercise',
      health_benefit: 'Improves cardiovascular health',
      target_count: 7,
      current_count: 6,
      week_start_date: '2024-10-28',
      status: 'in_progress',
    },
    {
      id: 7,
      title: 'Take vitamins daily',
      category: 'medication',
      health_benefit: 'Nutrient supplementation',
      target_count: 7,
      current_count: 7,
      week_start_date: '2024-10-28',
      status: 'completed',
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedHistoryWeek, setSelectedHistoryWeek] = useState<string | null>(null);
  const [showWeekPicker, setShowWeekPicker] = useState(false);
  const [showTodayView, setShowTodayView] = useState(true);
  const [showWeeklySummary, setShowWeeklySummary] = useState(false);

  // Get current week todos
  const currentWeekStart = '2024-11-11';
  const currentWeekTodos = todos
    .filter(t => t.week_start_date === currentWeekStart)
    .sort((a, b) => {
      // Completed todos go to bottom
      const aCompleted = a.current_count >= a.target_count;
      const bCompleted = b.current_count >= b.target_count;
      
      if (aCompleted && !bCompleted) return 1;
      if (!aCompleted && bCompleted) return -1;
      
      // Keep original order for same completion status
      return 0;
    });
  
  // Convert CGM goals to todos
  const cgmTodosConverted: TodoWithWeek[] = cgmGoals.map((goal, index) => ({
    id: parseInt(goal.id.replace('cgm-', '')) || 9000 + index,
    title: goal.title,
    category: goal.category,
    health_benefit: goal.description,
    target_count: goal.target_count,
    current_count: goal.current_count,
    week_start_date: currentWeekStart,
    status: goal.current_count >= goal.target_count ? 'completed' : goal.current_count > 0 ? 'in_progress' : 'pending',
    fromCGM: true,
  }));
  
  // Combine regular todos with CGM todos
  const allCurrentWeekTodos = [...currentWeekTodos, ...cgmTodosConverted];
  
  const historicalTodos = todos.filter(t => t.week_start_date !== currentWeekStart);

  // Group historical todos by week
  const todosByWeek = historicalTodos.reduce((acc, todo) => {
    if (!acc[todo.week_start_date]) {
      acc[todo.week_start_date] = [];
    }
    acc[todo.week_start_date].push(todo);
    return acc;
  }, {} as Record<string, TodoWithWeek[]>);
  
  // Get all unique historical weeks sorted (newest first)
  const historicalWeeks = Object.keys(todosByWeek)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  // Default to most recent historical week if available
  const displayWeek = selectedHistoryWeek || (historicalWeeks.length > 0 ? historicalWeeks[0] : null);
  
  // Navigate to previous/next week in history
  const navigateHistoryWeek = (direction: 'prev' | 'next') => {
    if (!displayWeek) return;
    const currentIndex = historicalWeeks.indexOf(displayWeek);
    if (direction === 'prev' && currentIndex < historicalWeeks.length - 1) {
      setSelectedHistoryWeek(historicalWeeks[currentIndex + 1]);
    } else if (direction === 'next' && currentIndex > 0) {
      setSelectedHistoryWeek(historicalWeeks[currentIndex - 1]);
    }
  };
  
  const canGoBack = displayWeek ? historicalWeeks.indexOf(displayWeek) < historicalWeeks.length - 1 : false;
  const canGoForward = displayWeek ? historicalWeeks.indexOf(displayWeek) > 0 : false;

  const handleAddTodo = (newTodo: Omit<TodoWithWeek, 'id' | 'current_count' | 'status' | 'week_start_date'>) => {
    const todo: TodoWithWeek = {
      ...newTodo,
      id: Date.now(),
      current_count: 0,
      status: 'pending',
      week_start_date: currentWeekStart,
    };
    setTodos(prev => [...prev, todo]);
    setShowAddModal(false);
  };

  const handleDeleteTodo = (id: number) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const handleEditTodo = (updatedTodo: TodoWithWeek) => {
    setTodos(prev => prev.map(t => t.id === updatedTodo.id ? updatedTodo : t));
  };

  const handleAddToCurrentWeek = (todo: TodoWithWeek) => {
    const newTodo: TodoWithWeek = {
      ...todo,
      id: Date.now(),
      current_count: 0,
      status: 'pending',
      week_start_date: currentWeekStart,
    };
    setTodos(prev => [...prev, newTodo]);
  };

  const handleToggleTodo = (id: number) => {
    setTodos(prev => prev.map(todo => {
      if (todo.id === id) {
        const newCount = todo.current_count + 1;
        return {
          ...todo,
          current_count: newCount,
          status: newCount >= todo.target_count ? 'completed' as const : 'in_progress' as const,
        };
      }
      return todo;
    }));
  };

  const getCategoryIcon = (category: TodoWithWeek['category']) => {
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

  const getCategoryColor = (category: TodoWithWeek['category']) => {
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

  const formatWeekRange = (startDate: string) => {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    
    const formatDate = (d: Date) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[d.getMonth()]} ${d.getDate()}`;
    };
    
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  return (
    <>
      <div className="p-6 space-y-6 pb-24">
        {/* Header */}
        <div className="space-y-4 pt-2 pb-2">
          <p className="text-[#5B7FF3] text-[11px] tracking-[2.26px] uppercase font-semibold">
            YOUR GOALS
          </p>
          <h1 className="text-[#101828]" style={{ fontSize: '28px', fontWeight: 700, lineHeight: '1.2' }}>
            Daily Action Items
          </h1>
          <p className="text-[#6A7282] text-[15px] leading-relaxed">
            Track your personalized health habits week by week.
          </p>
        </div>

        {/* Compact Progress Stats */}
        <CompactProgressStats todos={todos} />

        {/* Today View */}
        <TodayView 
          todos={allCurrentWeekTodos} 
          onQuickCheckIn={handleToggleTodo}
        />

        {/* Week Progress Chart */}
        <WeekProgress todos={allCurrentWeekTodos} />

        {/* This Week Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-gray-800" style={{ fontWeight: 600 }}>
              This Week
            </h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="w-9 h-9 rounded-full bg-[#5B7FF3] hover:bg-[#4A6FE3] text-white flex items-center justify-center active:scale-95 transition-all shadow-md"
              title="Add new habit"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3">
            {allCurrentWeekTodos.map(todo => (
              <SwipeableTodoCard
                key={todo.id}
                todo={todo}
                onDelete={handleDeleteTodo}
                onEdit={handleEditTodo}
                onToggle={handleToggleTodo}
                getCategoryIcon={getCategoryIcon}
                getCategoryColor={getCategoryColor}
                isReadOnly={false}
              />
            ))}
            {allCurrentWeekTodos.length === 0 && (
              <div className="bg-gray-50 rounded-3xl p-8 text-center border border-gray-100">
                <p className="text-gray-400 mb-2">No habits for this week yet</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="text-[#5B7FF3] text-sm hover:underline"
                >
                  Add your first habit
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Previous Weeks Section with Week Picker */}
        {historicalWeeks.length > 0 && (
          <div className="mt-8">
            <h2 className="text-gray-800 mb-4" style={{ fontWeight: 600 }}>
              Previous Weeks
            </h2>

            {/* Week Picker Navigation */}
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 mb-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigateHistoryWeek('prev')}
                  disabled={!canGoBack}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    canGoBack
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 active:scale-95'
                      : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setShowWeekPicker(true)}
                  className="flex-1 mx-3 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all active:scale-[0.98] border border-gray-200"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Week of</p>
                      <p className="text-gray-900 text-sm" style={{ fontWeight: 600 }}>
                        {displayWeek ? formatWeekRange(displayWeek) : ''}
                      </p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                </button>

                <button
                  onClick={() => navigateHistoryWeek('next')}
                  disabled={!canGoForward}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    canGoForward
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 active:scale-95'
                      : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Historical Todos */}
            <div className="space-y-2">
              {displayWeek && todosByWeek[displayWeek]?.map(todo => (
                <CompactTodoCard
                  key={todo.id}
                  todo={todo}
                  onAddToCurrentWeek={handleAddToCurrentWeek}
                  getCategoryIcon={getCategoryIcon}
                  getCategoryColor={getCategoryColor}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Week Picker Modal */}
      <AnimatePresence>
        {showWeekPicker && (
          <WeekPickerModal
            weeks={historicalWeeks}
            selectedWeek={displayWeek || currentWeekStart}
            currentWeek={currentWeekStart}
            onSelectWeek={(week) => {
              setSelectedHistoryWeek(week);
              setShowWeekPicker(false);
            }}
            onClose={() => setShowWeekPicker(false)}
            formatWeekRange={formatWeekRange}
          />
        )}
      </AnimatePresence>

      {/* Add Todo Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddTodoModal
            onClose={() => setShowAddModal(false)}
            onAdd={handleAddTodo}
          />
        )}
      </AnimatePresence>

      {/* Weekly Summary Modal */}
      <AnimatePresence>
        {showWeeklySummary && (
          <WeeklySummaryModal
            todos={allCurrentWeekTodos}
            onClose={() => setShowWeeklySummary(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// Swipeable Todo Card with left swipe
interface SwipeableTodoCardProps {
  todo: TodoWithWeek;
  onDelete: (id: number) => void;
  onEdit: (todo: TodoWithWeek) => void;
  onToggle: (id: number) => void;
  getCategoryIcon: (category: TodoWithWeek['category']) => JSX.Element;
  getCategoryColor: (category: TodoWithWeek['category']) => string;
  isReadOnly: boolean;
}

function SwipeableTodoCard({ todo, onDelete, onEdit, onToggle, getCategoryIcon, getCategoryColor, isReadOnly }: SwipeableTodoCardProps) {
  const [swipeX, setSwipeX] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(todo.title);
  const [editedCurrentCount, setEditedCurrentCount] = useState(todo.current_count);
  const [editedTargetCount, setEditedTargetCount] = useState(todo.target_count);
  const [showPhotos, setShowPhotos] = useState(true);
  const [showBenefit, setShowBenefit] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const startXRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isEditing) return;
    startXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isEditing) return;
    const currentX = e.touches[0].clientX;
    const diff = startXRef.current - currentX;
    
    if (diff > 0) {
      setSwipeX(Math.min(diff, 140));
    } else {
      setSwipeX(0);
    }
  };

  const handleTouchEnd = () => {
    if (isEditing) return;
    if (swipeX < 70) {
      setSwipeX(0);
    } else {
      setSwipeX(140);
    }
  };

  const handleEdit = () => {
    setSwipeX(0);
    setIsEditing(true);
    setEditedTitle(todo.title);
    setEditedCurrentCount(todo.current_count);
    setEditedTargetCount(todo.target_count);
  };

  const handleSaveEdit = () => {
    if (editedTitle.trim()) {
      const newStatus = editedCurrentCount >= editedTargetCount ? 'completed' : 
                        editedCurrentCount > 0 ? 'in_progress' : 'pending';
      onEdit({ 
        ...todo, 
        title: editedTitle.trim(),
        current_count: editedCurrentCount,
        target_count: editedTargetCount,
        status: newStatus,
      });
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedTitle(todo.title);
    setEditedCurrentCount(todo.current_count);
    setEditedTargetCount(todo.target_count);
  };

  const handleDelete = () => {
    onDelete(todo.id);
  };

  const handleCheckIn = () => {
    if (todo.current_count < todo.target_count) {
      // Check if this will complete the goal
      const willComplete = (todo.current_count + 1) === todo.target_count;
      
      onEdit({
        ...todo,
        completed_today: true,
      });
      onToggle(todo.id);

      // Show celebration if goal is completed
      if (willComplete) {
        setShowCelebration(true);
        // After 6 seconds, close celebration and move to bottom
        setTimeout(() => {
          setShowCelebration(false);
        }, 6000);
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        onEdit({
          ...todo,
          uploaded_images: [...(todo.uploaded_images || []), { url: imageUrl, date: new Date().toISOString().split('T')[0], timestamp: Date.now() }],
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (imageIndex: number) => {
    onEdit({
      ...todo,
      uploaded_images: (todo.uploaded_images || []).filter((_, i) => i !== imageIndex),
    });
  };

  const progressPercentage = (todo.current_count / todo.target_count) * 100;
  const hasPhotos = todo.uploaded_images && todo.uploaded_images.length > 0;

  return (
    <div className="relative">
      {/* Background Actions - for mobile swipe (only if not read-only) */}
      {!isReadOnly && (
        <div className="absolute right-0 top-0 bottom-0 flex items-center gap-2 pr-3">
          <button
            onClick={handleEdit}
            className="w-14 h-full bg-[#5B7FF3] text-white flex flex-col items-center justify-center rounded-2xl gap-0.5"
          >
            <Pencil className="w-4 h-4" />
            <span className="text-xs">Edit</span>
          </button>
          <button
            onClick={handleDelete}
            className="w-14 h-full bg-red-500 text-white flex flex-col items-center justify-center rounded-2xl gap-0.5"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-xs">Delete</span>
          </button>
        </div>
      )}

      {/* Main Card */}
      <div
        onTouchStart={!isReadOnly ? handleTouchStart : undefined}
        onTouchMove={!isReadOnly ? handleTouchMove : undefined}
        onTouchEnd={!isReadOnly ? handleTouchEnd : undefined}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 relative group"
        style={{ 
          transform: !isReadOnly ? `translateX(-${swipeX}px)` : 'none',
          transition: swipeX === 0 || swipeX === 140 ? 'transform 0.2s ease-out' : 'none'
        }}
      >
        {isEditing ? (
          // Edit Mode
          <div className="space-y-4">
            {/* Title Input */}
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full ${getCategoryColor(todo.category)} flex items-center justify-center flex-shrink-0`}>
                <div className="scale-75">
                  {getCategoryIcon(todo.category)}
                </div>
              </div>
              <input
                ref={inputRef}
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveEdit();
                  if (e.key === 'Escape') handleCancelEdit();
                }}
                className="flex-1 px-2 py-1 border-b border-gray-300 focus:outline-none focus:border-[#5B7FF3]"
              />
            </div>

            {/* Progress Counter */}
            <div className="ml-8 space-y-4">
              {/* Current Progress */}
              <div>
                <label className="text-gray-700 text-sm mb-2 block" style={{ fontWeight: 500 }}>
                  Progress This Week
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEditedCurrentCount(Math.max(0, editedCurrentCount - 1))}
                    className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center active:scale-95 transition-all"
                  >
                    <span className="text-gray-700">−</span>
                  </button>
                  <div className="flex-1 text-center">
                    <span className="text-2xl text-[#5B7FF3]" style={{ fontWeight: 600 }}>
                      {editedCurrentCount}
                    </span>
                    <span className="text-gray-500 mx-1">/</span>
                    <span className="text-xl text-gray-600" style={{ fontWeight: 500 }}>
                      {editedTargetCount}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditedCurrentCount(Math.min(editedTargetCount, editedCurrentCount + 1))}
                    className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center active:scale-95 transition-all"
                  >
                    <span className="text-gray-700">+</span>
                  </button>
                </div>
              </div>

              {/* Weekly Target */}
              <div>
                <label className="text-gray-700 text-sm mb-2 block" style={{ fontWeight: 500 }}>
                  Weekly Target
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const newTarget = Math.max(1, editedTargetCount - 1);
                      setEditedTargetCount(newTarget);
                      if (editedCurrentCount > newTarget) {
                        setEditedCurrentCount(newTarget);
                      }
                    }}
                    className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center active:scale-95 transition-all"
                  >
                    <span className="text-gray-700">−</span>
                  </button>
                  <div className="flex-1 text-center">
                    <span className="text-2xl text-gray-700" style={{ fontWeight: 600 }}>
                      {editedTargetCount}
                    </span>
                    <span className="text-gray-500 text-sm ml-1">days / week</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditedTargetCount(Math.min(7, editedTargetCount + 1))}
                    className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center active:scale-95 transition-all"
                  >
                    <span className="text-gray-700">+</span>
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#7B9FF9] to-[#5B7FF3] rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((editedCurrentCount / editedTargetCount) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded-full bg-[#5B7FF3] hover:bg-[#4A6FE3] text-white text-sm active:scale-95 transition-all flex items-center gap-1"
              >
                <Check className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>
        ) : (
          // Display Mode
          <div>
            {/* Hover Actions - for desktop (only if not read-only) */}
            {!isReadOnly && (
              <div className={`absolute top-3 right-3 flex items-center gap-1 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <button
                  onClick={handleEdit}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-[#5B7FF3]/10 hover:text-[#5B7FF3] text-gray-600 flex items-center justify-center transition-all active:scale-95"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDelete}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-600 flex items-center justify-center transition-all active:scale-95"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Title and Category */}
            <div className="flex items-start gap-2 mb-3 pr-16">
              <button
                onClick={() => setShowBenefit(!showBenefit)}
                className={`w-6 h-6 rounded-full ${getCategoryColor(todo.category)} flex items-center justify-center flex-shrink-0 mt-0.5 transition-all hover:scale-110 active:scale-95`}
                title={showBenefit ? "Hide benefit" : "Show benefit"}
              >
                <div className="scale-75">
                  {getCategoryIcon(todo.category)}
                </div>
              </button>
              <div className="flex-1">
                <p className="text-gray-800 leading-relaxed">
                  {todo.title}
                </p>
                
                {/* Health Benefit - Expandable */}
                <AnimatePresence>
                  {showBenefit && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full bg-[#5B7FF3] mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-gray-600 leading-relaxed italic">
                          {todo.health_benefit}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="ml-8 mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-gray-500">This week</span>
                <span className="text-xs text-gray-600">
                  {todo.current_count} / {todo.target_count}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#7B9FF9] to-[#5B7FF3] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                />
              </div>
            </div>

            {/* Action Buttons - Check-in and Upload Photo (only if not read-only) */}
            {!isReadOnly && (
              <div className="flex items-center gap-2 ml-8">
                <button
                  onClick={handleCheckIn}
                  disabled={todo.completed_today || todo.current_count >= todo.target_count}
                  className={`px-4 py-2 rounded-xl text-sm flex items-center justify-center gap-1.5 transition-all ${
                    todo.current_count >= todo.target_count
                      ? 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-2 border-emerald-300'
                      : todo.completed_today
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      : 'bg-[#5B7FF3]/10 text-[#5B7FF3] hover:bg-[#5B7FF3]/20 active:scale-95'
                  }`}
                  style={{ fontWeight: 500 }}
                >
                  {todo.current_count >= todo.target_count ? (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Done This Week
                    </>
                  ) : todo.completed_today ? (
                    <>
                      <Check className="w-4 h-4" />
                      Done Today
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Check In
                    </>
                  )}
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 rounded-xl text-sm flex items-center justify-center bg-gray-50 text-gray-600 hover:bg-gray-100 active:scale-95 transition-all border border-gray-200"
                >
                  <Camera className="w-4 h-4" />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            )}

            {/* Uploaded Images */}
            {hasPhotos && (
              <div className="ml-8 mt-4">
                <button
                  onClick={() => setShowPhotos(!showPhotos)}
                  className="flex items-center gap-1.5 mb-3 group"
                >
                  <ImageIcon className="w-4 h-4 text-[#5B7FF3]" />
                  <span className="text-sm text-gray-700" style={{ fontWeight: 500 }}>
                    Check-in Gallery
                  </span>
                  <span className="text-xs text-gray-500">({todo.uploaded_images!.length})</span>
                  <div className="ml-auto">
                    {showPhotos ? (
                      <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    )}
                  </div>
                </button>
                
                <AnimatePresence>
                  {showPhotos && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <PhotoGallery
                        photos={todo.uploaded_images!}
                        onRemovePhoto={handleRemoveImage}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Celebration Animation */}
            <AnimatePresence>
              {showCelebration && (
                <CelebrationModal
                  todoTitle={todo.title}
                  onClose={() => setShowCelebration(false)}
                />
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

// Compact card for historical todos
interface CompactTodoCardProps {
  todo: TodoWithWeek;
  onAddToCurrentWeek: (todo: TodoWithWeek) => void;
  getCategoryIcon: (category: TodoWithWeek['category']) => JSX.Element;
  getCategoryColor: (category: TodoWithWeek['category']) => string;
}

function CompactTodoCard({ todo, onAddToCurrentWeek, getCategoryIcon, getCategoryColor }: CompactTodoCardProps) {
  return (
    <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className={`w-5 h-5 rounded-full ${getCategoryColor(todo.category)} flex items-center justify-center flex-shrink-0`}>
            <div className="scale-[0.65]">
              {getCategoryIcon(todo.category)}
            </div>
          </div>
          <p className="text-gray-700 text-sm truncate">{todo.title}</p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-gray-500">
            {todo.current_count}/{todo.target_count}
          </span>
          <button
            onClick={() => onAddToCurrentWeek(todo)}
            className="px-3 py-1.5 rounded-full bg-[#5B7FF3] hover:bg-[#4A6FE3] text-white text-xs active:scale-95 transition-all flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

// Add Todo Modal
interface AddTodoModalProps {
  onClose: () => void;
  onAdd: (todo: Omit<TodoWithWeek, 'id' | 'current_count' | 'status' | 'week_start_date'>) => void;
}

function AddTodoModal({ onClose, onAdd }: AddTodoModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TodoWithWeek['category']>('diet');
  const [healthBenefit, setHealthBenefit] = useState('');
  const [targetCount, setTargetCount] = useState(7);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd({
        title: title.trim(),
        category,
        health_benefit: healthBenefit.trim() || 'Improves overall health',
        target_count: targetCount,
      });
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl z-50 w-full max-w-[350px]"
      >
        <div className="flex items-center justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 pb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-gray-900" style={{ fontWeight: 600 }}>Add New Habit</h2>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <XIcon className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-gray-700 text-sm mb-2 block" style={{ fontWeight: 500 }}>
                Habit Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Drink 8 glasses of water"
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5B7FF3]/20 focus:border-[#5B7FF3]"
                required
              />
            </div>

            <div>
              <label className="text-gray-700 text-sm mb-2 block" style={{ fontWeight: 500 }}>
                Category
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['diet', 'exercise', 'sleep', 'other'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`py-2 px-3 rounded-xl text-sm transition-all capitalize ${
                      category === cat
                        ? 'bg-[#5B7FF3] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-gray-700 text-sm mb-2 block" style={{ fontWeight: 500 }}>
                Health Benefit (Optional)
              </label>
              <input
                type="text"
                value={healthBenefit}
                onChange={(e) => setHealthBenefit(e.target.value)}
                placeholder="e.g., Improves hydration"
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5B7FF3]/20 focus:border-[#5B7FF3]"
              />
            </div>

            <div>
              <label className="text-gray-700 text-sm mb-2 block" style={{ fontWeight: 500 }}>
                Weekly Target
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setTargetCount(Math.max(1, targetCount - 1))}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center active:scale-95 transition-all"
                >
                  -
                </button>
                <div className="flex-1 text-center">
                  <span className="text-2xl text-[#5B7FF3]" style={{ fontWeight: 600 }}>
                    {targetCount}
                  </span>
                  <span className="text-gray-500 text-sm ml-1">days / week</span>
                </div>
                <button
                  type="button"
                  onClick={() => setTargetCount(Math.min(7, targetCount + 1))}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center active:scale-95 transition-all"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-[#5B7FF3] to-[#4A6FE3] text-white rounded-full hover:shadow-lg active:scale-95 transition-all"
              style={{ fontWeight: 600 }}
            >
              Add
            </button>
          </div>
        </form>
      </motion.div>
    </>
  );
}

// Celebration Modal
interface CelebrationModalProps {
  todoTitle: string;
  onClose: () => void;
}

function CelebrationModal({ todoTitle, onClose }: CelebrationModalProps) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl z-50 w-full max-w-[350px]"
      >
        <div className="flex items-center justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
        </div>

        <div className="p-6 pb-6 text-center">
          <h2 className="text-gray-900" style={{ fontWeight: 600 }}>Congratulations!</h2>
          <p className="text-gray-500 text-lg leading-relaxed mt-2">
            You've completed your habit: <span className="font-bold">{todoTitle}</span>
          </p>
          <PartyPopper className="w-24 h-24 text-[#5B7FF3] animate-bounce mt-4" />
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-3 bg-gradient-to-r from-[#5B7FF3] to-[#4A6FE3] text-white rounded-full hover:shadow-lg active:scale-95 transition-all mt-6"
            style={{ fontWeight: 600 }}
          >
            Close
          </button>
        </div>
      </motion.div>
    </>
  );
}

// Photo Gallery Component
interface PhotoGalleryProps {
  photos: PhotoRecord[];
  onRemovePhoto: (index: number) => void;
}

function PhotoGallery({ photos, onRemovePhoto }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoRecord | null>(null);

  // Sort photos by date (newest first)
  const sortedPhotos = [...photos].sort((a, b) => b.timestamp - a.timestamp);

  // Group photos by date
  const photosByDate = sortedPhotos.reduce((acc, photo) => {
    if (!acc[photo.date]) {
      acc[photo.date] = [];
    }
    acc[photo.date].push(photo);
    return acc;
  }, {} as Record<string, PhotoRecord[]>);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateString === today.toISOString().split('T')[0]) {
      return 'Today';
    } else if (dateString === yesterday.toISOString().split('T')[0]) {
      return 'Yesterday';
    } else {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[date.getMonth()]} ${date.getDate()}`;
    }
  };

  return (
    <>
      <div className="space-y-3">
        {Object.entries(photosByDate).map(([date, datePhotos]) => (
          <div key={date}>
            <p className="text-xs text-gray-500 mb-1.5">{formatDate(date)}</p>
            <div className="grid grid-cols-4 gap-2">
              {datePhotos.map((photo, photoIndex) => {
                const globalIndex = photos.findIndex(p => p.timestamp === photo.timestamp);
                return (
                  <div key={photo.timestamp} className="relative group/image">
                    <button
                      onClick={() => setSelectedPhoto(photo)}
                      className="w-full aspect-square rounded-xl overflow-hidden border-2 border-gray-100 hover:border-[#5B7FF3]/50 transition-all active:scale-95"
                    >
                      <img
                        src={photo.url}
                        alt={`Check-in ${formatDate(date)}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemovePhoto(globalIndex);
                      }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity shadow-md z-10"
                      title="Delete photo"
                    >
                      <XIcon className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Photo Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <PhotoLightbox
            photo={selectedPhoto}
            onClose={() => setSelectedPhoto(null)}
            formatDate={formatDate}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// Photo Lightbox Component
interface PhotoLightboxProps {
  photo: PhotoRecord;
  onClose: () => void;
  formatDate: (date: string) => string;
}

function PhotoLightbox({ photo, onClose, formatDate }: PhotoLightboxProps) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[61] w-full max-w-[90vw] max-h-[90vh]"
        onClick={onClose}
      >
        <div className="relative">
          {/* Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute -top-12 right-0 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all active:scale-95"
          >
            <XIcon className="w-5 h-5" />
          </button>

          {/* Image */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl cursor-pointer">
            <img
              src={photo.url}
              alt={`Check-in ${formatDate(photo.date)}`}
              className="w-full max-h-[80vh] object-contain"
            />
            <div className="p-4 bg-gradient-to-t from-gray-50 to-white">
              <p className="text-sm text-gray-600 text-center">
                {formatDate(photo.date)}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// Week Picker Modal
interface WeekPickerModalProps {
  weeks: string[];
  selectedWeek: string;
  currentWeek: string;
  onSelectWeek: (week: string) => void;
  onClose: () => void;
  formatWeekRange: (startDate: string) => string;
}

function WeekPickerModal({ weeks, selectedWeek, currentWeek, onSelectWeek, onClose, formatWeekRange }: WeekPickerModalProps) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl z-50 w-full max-w-[350px] max-h-[80vh] overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
          <h2 className="text-gray-900" style={{ fontWeight: 600 }}>Select Week</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <XIcon className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="p-6 pt-4 space-y-2 overflow-y-auto max-h-[60vh]">
          {weeks.map(week => {
            const isSelected = week === selectedWeek;
            const isCurrent = week === currentWeek;
            return (
              <button
                key={week}
                type="button"
                onClick={() => onSelectWeek(week)}
                className={`w-full py-3 px-4 rounded-2xl flex items-center gap-3 transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#5B7FF3] to-[#7B9FF9] text-white shadow-md'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Calendar className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-white' : 'text-[#5B7FF3]'}`} />
                <div className="flex-1 text-left">
                  <p className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                    {isCurrent ? 'This Week' : 'Week of'}
                  </p>
                  <p className={`text-sm ${isSelected ? 'text-white' : 'text-gray-900'}`} style={{ fontWeight: 600 }}>
                    {formatWeekRange(week)}
                  </p>
                </div>
                {isCurrent && !isSelected && (
                  <div className="px-2 py-1 bg-[#5B7FF3]/10 text-[#5B7FF3] rounded-full text-xs" style={{ fontWeight: 600 }}>
                    Current
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </motion.div>
    </>
  );
}