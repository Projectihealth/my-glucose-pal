import { useState, useRef, useEffect } from 'react';
import { Plus, ChevronDown, ChevronUp, Pencil, Trash2, X as XIcon, Check, Utensils, Activity, Moon, FileText, Camera, ImagePlus, Sparkles, PartyPopper, Image as ImageIcon, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { motion, AnimatePresence } from 'framer-motion';
import { CompactProgressStats } from './goalTab/CompactProgressStats';
import { TodayView } from './goalTab/TodayView';
import { WeekProgress } from './goalTab/WeekProgress';
import { WeeklySummaryModal } from './goalTab/WeeklySummaryModal';
import * as todosApi from '@/services/todosApi';
import { Todo } from '@/services/todosApi';
import { TabHeader } from '@/components/TabHeader';

export function GoalTab() {
  // TODO: Get user_id from authentication context
  const userId = 'user_38377a3b'; // Hardcoded for now - should match your actual user ID

  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedHistoryWeek, setSelectedHistoryWeek] = useState<string | null>(null);
  const [showWeekPicker, setShowWeekPicker] = useState(false);
  const [showWeeklySummary, setShowWeeklySummary] = useState(false);

  // Fetch todos on component mount
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedTodos = await todosApi.getTodos(userId);
        setTodos(fetchedTodos);
      } catch (err) {
        console.error('Failed to fetch todos:', err);
        setError(err instanceof Error ? err.message : 'Failed to load todos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodos();
  }, [userId]);

  // Get current week start date (Monday of current week)
  const getCurrentWeekStart = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(today.setDate(diff));
    return monday.toISOString().split('T')[0];
  };

  // 标准化日期格式：将后端返回的日期转换为 YYYY-MM-DD 格式
  const normalizeDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return dateString;
    }
  };

  const currentWeekStart = getCurrentWeekStart();

  // Get current week todos
  const currentWeekTodos = todos
    .filter(t => !t.week_start || normalizeDate(t.week_start) === currentWeekStart)
    .sort((a, b) => {
      // Completed todos go to bottom
      const aCompleted = a.current_count >= a.target_count;
      const bCompleted = b.current_count >= b.target_count;

      if (aCompleted && !bCompleted) return 1;
      if (!aCompleted && bCompleted) return -1;

      // Keep original order for same completion status
      return 0;
    });

  const historicalTodos = todos.filter(t => t.week_start && normalizeDate(t.week_start) !== currentWeekStart);

  // Group historical todos by week
  const todosByWeek = historicalTodos.reduce((acc, todo) => {
    const weekStart = normalizeDate(todo.week_start) || currentWeekStart;
    if (!acc[weekStart]) {
      acc[weekStart] = [];
    }
    acc[weekStart].push(todo);
    return acc;
  }, {} as Record<string, Todo[]>);

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

  const handleAddTodo = async (newTodo: { title: string; category: Todo['category']; health_benefit: string; target_count: number }) => {
    console.log('handleAddTodo called with:', newTodo);
    try {
      console.log('Calling API to create todo...');
      const createdTodo = await todosApi.createTodo({
        user_id: userId,
        title: newTodo.title,
        category: newTodo.category,
        health_benefit: newTodo.health_benefit,
        target_count: newTodo.target_count,
        current_count: 0,
        status: 'pending',
        week_start: currentWeekStart,
      });
      console.log('Todo created successfully:', createdTodo);
      setTodos(prev => [...prev, createdTodo]);
      // Modal will be closed by AddTodoModal's handleSubmit
    } catch (err) {
      console.error('Failed to create todo:', err);
      alert('Failed to create habit. Please try again.');
      throw err; // Re-throw to prevent modal from closing on error
    }
  };

  const handleDeleteTodo = async (id: number) => {
    try {
      await todosApi.deleteTodo(id);
      setTodos(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Failed to delete todo:', err);
      alert('Failed to delete habit. Please try again.');
    }
  };

  const handleEditTodo = async (updatedTodo: Todo) => {
    try {
      const updated = await todosApi.updateTodo(updatedTodo.id, {
        title: updatedTodo.title,
        target_count: updatedTodo.target_count,
        current_count: updatedTodo.current_count,
        status: updatedTodo.status,
      });
      setTodos(prev => prev.map(t => t.id === updated.id ? updated : t));
    } catch (err) {
      console.error('Failed to update todo:', err);
      alert('Failed to update habit. Please try again.');
    }
  };

  const handleAddToCurrentWeek = async (todo: Todo) => {
    console.log('handleAddToCurrentWeek called with todo:', todo);
    try {
      console.log('Creating todo for current week:', currentWeekStart);
      const newTodo = await todosApi.createTodo({
        user_id: userId,
        title: todo.title,
        category: todo.category,
        health_benefit: todo.health_benefit,
        target_count: todo.target_count,
        current_count: 0,
        status: 'pending',
        week_start: currentWeekStart,
      });
      console.log('Todo added to current week:', newTodo);
      setTodos(prev => [...prev, newTodo]);
      
      // 显示成功提示
      alert(`✅ Added "${todo.title}" to this week!`);
      
      // 切换回当前周
      setSelectedHistoryWeek(null);
    } catch (err) {
      console.error('Failed to add todo to current week:', err);
      alert('❌ Failed to add habit to current week. Please try again.');
    }
  };

  const handleToggleTodo = async (id: number) => {
    try {
      const updated = await todosApi.checkInTodo(id, {});
      setTodos(prev => prev.map(todo => todo.id === updated.id ? updated : todo));
    } catch (err) {
      console.error('Failed to check in todo:', err);
      alert('Failed to check in. Please try again.');
    }
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

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24">
      <TabHeader
        eyebrow="YOUR GOALS"
        title="Daily Action Items"
        subtitle="Track your personalized health habits week by week."
      />

      <div className="px-6 space-y-6">
        <CompactProgressStats todos={currentWeekTodos} />

        <TodayView
          todos={currentWeekTodos}
          onQuickCheckIn={handleToggleTodo}
        />

        <WeekProgress
          todos={currentWeekTodos}
          userId={userId}
          weekStart={currentWeekStart}
        />

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-gray-800" style={{ fontWeight: 600 }}>
              This Week
            </h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="w-9 h-9 rounded-full bg-[#5B7FF3] hover:bg-[#4A6FE3] text-white flex items-center justify-center active:scale-95 transition-all shadow-md z-10"
              title="Add new habit"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3">
            {currentWeekTodos.map(todo => (
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
            {currentWeekTodos.length === 0 && (
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

        {historicalWeeks.length > 0 && (
          <div className="mt-8">
            <h2 className="text-gray-800 mb-4" style={{ fontWeight: 600 }}>
              Previous Weeks
            </h2>

            <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 mb-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigateHistoryWeek('prev')}
                  disabled={!canGoBack}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all z-10 ${
                    canGoBack
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 active:scale-95'
                      : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setShowWeekPicker(true)}
                  className="flex-1 mx-3 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all active:scale-[0.98] border border-gray-200 z-10"
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
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all z-10 ${
                    canGoForward
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 active:scale-95'
                      : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

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

      <AnimatePresence>
        {showAddModal && (
          <AddTodoModal
            onClose={() => setShowAddModal(false)}
            onAdd={handleAddTodo}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showWeeklySummary && (
          <WeeklySummaryModal
            todos={currentWeekTodos}
            onClose={() => setShowWeeklySummary(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Swipeable Todo Card with left swipe
interface SwipeableTodoCardProps {
  todo: Todo;
  onDelete: (id: number) => void;
  onEdit: (todo: Todo) => void;
  onToggle: (id: number) => void;
  getCategoryIcon: (category: Todo['category']) => JSX.Element;
  getCategoryColor: (category: Todo['category']) => string;
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
        status: newStatus as Todo['status'],
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        const updatedImages = [...(todo.uploaded_images || []), imageUrl];
        onEdit({
          ...todo,
          uploaded_images: updatedImages,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (imageIndex: number) => {
    const updatedImages = (todo.uploaded_images || []).filter((_, i) => i !== imageIndex);
    onEdit({
      ...todo,
      uploaded_images: updatedImages,
    });
  };

  const progressPercentage = (todo.current_count / todo.target_count) * 100;
  const hasPhotos = todo.uploaded_images && todo.uploaded_images.length > 0;

  return (
    <div className="relative">
      {/* Background Actions - for mobile swipe (only if not read-only) */}
      {!isReadOnly && (
        <div className="absolute right-0 top-0 bottom-0 flex items-center gap-2 pr-3 z-0">
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
        className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 relative group z-10"
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
              <div className={`absolute top-3 right-3 flex items-center gap-1 transition-opacity duration-200 z-20 ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
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
                  {showBenefit && todo.health_benefit && (
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
                  className={`px-4 py-2 rounded-xl text-sm flex items-center justify-center gap-1.5 transition-all z-10 ${
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
                  className="px-3 py-2 rounded-xl text-sm flex items-center justify-center bg-gray-50 text-gray-600 hover:bg-gray-100 active:scale-95 transition-all border border-gray-200 z-10"
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
                      <div className="grid grid-cols-4 gap-2">
                        {todo.uploaded_images!.map((imageUrl, index) => (
                          <div key={index} className="relative group/image">
                            <div className="w-full aspect-square rounded-xl overflow-hidden border-2 border-gray-100">
                              <img
                                src={imageUrl}
                                alt={`Check-in ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            {!isReadOnly && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveImage(index);
                                }}
                                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity shadow-md z-10"
                                title="Delete photo"
                              >
                                <XIcon className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
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
  todo: Todo;
  onAddToCurrentWeek: (todo: Todo) => void;
  getCategoryIcon: (category: Todo['category']) => JSX.Element;
  getCategoryColor: (category: Todo['category']) => string;
}

function CompactTodoCard({ todo, onAddToCurrentWeek, getCategoryIcon, getCategoryColor }: CompactTodoCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="bg-gray-50 rounded-2xl p-3 border border-gray-100 group hover:border-[#5B7FF3]/30 transition-all cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className={`w-5 h-5 rounded-full ${getCategoryColor(todo.category)} flex items-center justify-center flex-shrink-0`}>
            <div className="scale-[0.65]">
              {getCategoryIcon(todo.category)}
            </div>
          </div>
          <p className="text-gray-700 text-sm truncate group-hover:text-gray-900 transition-colors">
            {todo.title}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Progress counter - always visible */}
          <span className="text-xs text-gray-500">
            {todo.current_count}/{todo.target_count}
          </span>

          {/* Add button - appears on hover (desktop), always visible on mobile */}
          <motion.button
            initial={false}
            animate={{
              opacity: isHovered ? 1 : 0.6,
              scale: isHovered ? 1 : 0.95,
            }}
            transition={{
              duration: 0.2,
              ease: 'easeOut'
            }}
            onClick={(e) => {
              e.stopPropagation();
              onAddToCurrentWeek(todo);
            }}
            className="px-3 py-1.5 rounded-full bg-[#5B7FF3] hover:bg-[#4A6FE3] text-white text-xs active:scale-95 transition-all flex items-center gap-1 z-10 sm:opacity-100"
          >
            <Plus className="w-3 h-3" />
            <span className="hidden sm:inline">Add</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}

// Add Todo Modal - CENTERED
interface AddTodoModalProps {
  onClose: () => void;
  onAdd: (todo: { title: string; category: Todo['category']; health_benefit: string; target_count: number }) => void;
}

function AddTodoModal({ onClose, onAdd }: AddTodoModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Todo['category']>('diet');
  const [healthBenefit, setHealthBenefit] = useState('');
  const [targetCount, setTargetCount] = useState(7);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        console.log('Submitting new habit:', { title, category, health_benefit: healthBenefit, target_count: targetCount });
        await onAdd({
        title: title.trim(),
        category,
        health_benefit: healthBenefit.trim() || 'Improves overall health',
        target_count: targetCount,
      });
        console.log('Habit created successfully!');
        onClose(); // 只在成功时关闭modal
      } catch (error) {
        // 错误已经在handleAddTodo中处理，不关闭modal
        console.error('Failed to add todo:', error);
        setIsSubmitting(false);
      }
    }
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-[350px] max-h-[90vh] overflow-y-auto pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
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
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors z-10"
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
              disabled={isSubmitting}
              className="px-8 py-3 bg-gradient-to-r from-[#5B7FF3] to-[#4A6FE3] text-white rounded-full hover:shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontWeight: 600 }}
            >
              {isSubmitting ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>
        </motion.div>
      </div>
    </>
  );
}

// Celebration Modal - CENTERED
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
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl z-50 w-full max-w-[350px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
        </div>

        <div className="p-6 pb-6 text-center">
          <h2 className="text-gray-900" style={{ fontWeight: 600 }}>Congratulations!</h2>
          <p className="text-gray-500 text-lg leading-relaxed mt-2">
            You've completed your habit: <span className="font-bold">{todoTitle}</span>
          </p>
          <PartyPopper className="w-24 h-24 text-[#5B7FF3] animate-bounce mt-4 mx-auto" />
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

// Week Picker Modal - CENTERED
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
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl z-50 w-full max-w-[350px] max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
          <h2 className="text-gray-900" style={{ fontWeight: 600 }}>Select Week</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors z-10"
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
