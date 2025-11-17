import { Utensils, Activity, Moon, FileText, Mic, Plus } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useState, useRef, useEffect } from 'react';
import * as todosApi from '@/services/todosApi';

interface Todo {
  id: number;
  user_id: string;
  title: string;
  description?: string;
  category: 'diet' | 'exercise' | 'sleep' | 'stress' | 'medication' | 'other';
  health_benefit?: string;
  time_of_day?: string;
  time_description?: string;
  target_count: number;
  current_count: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  uploaded_images: string[];
  completed_today: boolean;
  week_start?: string;
  created_at: string;
  completed_at?: string;
}

interface CheckInModalProps {
  checkInModal: { todoId: number; todo: Todo };
  setCheckInModal: (modal: { todoId: number; todo: Todo } | null) => void;
  checkInNotes: string;
  setCheckInNotes: (notes: string) => void;
  checkInImages: string[];
  handleCheckInImageUpload: (file: File) => void;
  handleDeleteCheckInImage: (imageUrl: string) => void;
  handleSaveCheckIn: () => void;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
}

interface TodoItemProps {
  todo: Todo;
  onCheckboxClick: (todo: Todo) => void;
  onAddMorePhotos: (todoId: number) => void;
  getCategoryIcon: (category: Todo['category']) => JSX.Element;
  getCategoryColor: (category: Todo['category']) => string;
  collapsedPhotos: Set<number>;
}

function CheckInModal({
  checkInModal,
  setCheckInModal,
  checkInNotes,
  setCheckInNotes,
  checkInImages,
  handleCheckInImageUpload,
  handleDeleteCheckInImage,
  handleSaveCheckIn,
  isRecording,
  setIsRecording,
}: CheckInModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // In a real app, you would start/stop voice recording here
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
      onClick={() => setCheckInModal(null)}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-[390px] mx-4 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle Bar */}
        <div className="flex justify-center pt-3 pb-4">
          <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
        </div>

        <div className="px-6 pb-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-gray-900 text-2xl" style={{ fontWeight: 600 }}>Daily Check-In</h2>
            <button
              onClick={() => setCheckInModal(null)}
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center text-gray-400 text-xl"
            >
              ✕
            </button>
          </div>

          {/* Notes Section */}
          <div className="mb-5">
            <label className="text-gray-800 mb-2 block" style={{ fontWeight: 500 }}>Notes</label>
            <div className="relative">
              <textarea
                value={checkInNotes}
                onChange={(e) => setCheckInNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 pr-14 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5B7FF3]/20 focus:border-[#5B7FF3] transition-all resize-none text-gray-700"
                placeholder="How did it go? Any observations or feelings..."
              />
              <button
                onClick={toggleRecording}
                className={`absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  isRecording
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-[#EEF2FF] text-[#5B7FF3] hover:bg-[#5B7FF3] hover:text-white'
                }`}
                title={isRecording ? 'Stop recording' : 'Voice input'}
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>
            {isRecording && (
              <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                Recording...
              </p>
            )}
          </div>

          {/* Upload Photos Section */}
          <div className="mb-6">
            <label className="text-gray-800 mb-2 block" style={{ fontWeight: 500 }}>Photo Log</label>
            <div className="flex gap-2 flex-wrap">
              {checkInImages.map((imageUrl, index) => (
                <div key={index} className="relative group w-20 h-20">
                  <img
                    src={imageUrl}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover rounded-xl border border-gray-200"
                  />
                  <button
                    onClick={() => handleDeleteCheckInImage(imageUrl)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs shadow-lg"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {/* Upload Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 bg-white hover:bg-gray-50 hover:border-[#5B7FF3] transition-all flex items-center justify-center group"
              >
                <Plus className="w-5 h-5 text-gray-300 group-hover:text-[#5B7FF3] transition-colors" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleCheckInImageUpload(file);
                  }
                }}
                className="hidden"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-center">
            <button
              onClick={handleSaveCheckIn}
              className="w-16 h-16 bg-gradient-to-r from-[#4FC3F7] to-[#4A6FE3] text-white rounded-full hover:shadow-lg transition-all active:scale-95 flex items-center justify-center"
            >
              <span style={{ fontWeight: 600 }}>Log</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TodoItem({ todo, onCheckboxClick, onAddMorePhotos, getCategoryIcon, getCategoryColor, collapsedPhotos }: TodoItemProps) {
  const [isBenefitExpanded, setIsBenefitExpanded] = useState(false);
  const isCompleted = todo.current_count >= todo.target_count;
  const images = todo.uploaded_images || [];

  const handleCheckboxChange = () => {
    onCheckboxClick(todo);
  };

  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-start gap-3">
        {/* Content - Full Width */}
        <div className="flex-1 min-w-0">
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
            <p className={`text-gray-800 leading-relaxed flex-1 ${isCompleted ? 'line-through opacity-70' : ''}`}>
              {todo.title}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="ml-8 mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-500">Progress</span>
              <span className="text-xs text-gray-600">
                {todo.current_count} of {todo.target_count} days
              </span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#7B9FF9] to-[#5B7FF3] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min((todo.current_count / todo.target_count) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Expandable Health Benefit */}
          {isBenefitExpanded && (
            <div className="ml-8 mb-3 bg-[#F5F7FA] border border-gray-100 rounded-2xl p-3 shadow-sm animate-in slide-in-from-top-2 duration-200">
              <p className="text-gray-600 text-sm leading-relaxed">{todo.health_benefit}</p>
            </div>
          )}

          {/* Uploaded Images Preview */}
          {images.length > 0 && !collapsedPhotos.has(todo.id) && (
            <div className="flex gap-2 ml-8 items-center">
              {images.slice(0, 3).map((imageUrl, index) => (
                <div
                  key={index}
                  className="w-16 h-16 flex-shrink-0"
                >
                  <img
                    src={imageUrl}
                    alt={`Progress ${index + 1}`}
                    className="w-full h-full object-cover rounded-xl border border-gray-200"
                  />
                </div>
              ))}

              {/* Add More Photos Button */}
              {images.length > 0 && (
                <button
                  onClick={() => onAddMorePhotos(todo.id)}
                  className="w-16 h-16 flex-shrink-0 rounded-xl border-2 border-dashed border-gray-200 bg-white hover:bg-gray-50 hover:border-[#5B7FF3] transition-all flex items-center justify-center group"
                >
                  <Plus className="w-5 h-5 text-gray-300 group-hover:text-[#5B7FF3] transition-colors" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Checkbox Only */}
        <div className="flex-shrink-0">
          <Checkbox
            id={`todo-${todo.id}`}
            checked={todo.completed_today || isCompleted}
            onCheckedChange={handleCheckboxChange}
            className="w-6 h-6 data-[state=checked]:bg-white data-[state=checked]:border-[#5B7FF3] data-[state=checked]:text-[#5B7FF3]"
            disabled={isCompleted}
          />
        </div>
      </div>
    </div>
  );
}

export function GoalTab() {
  // TODO: Get user_id from authentication context
  const userId = 'user_001'; // Hardcoded for now

  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [viewAllImagesModal, setViewAllImagesModal] = useState<{ todoId: number; images: string[] } | null>(null);
  const [checkInModal, setCheckInModal] = useState<{ todoId: number; todo: Todo } | null>(null);
  const [checkInNotes, setCheckInNotes] = useState('');
  const [checkInImages, setCheckInImages] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [collapsedPhotos, setCollapsedPhotos] = useState<Set<number>>(new Set());

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

  const handleCheckboxClick = (todo: Todo) => {
    if (!todo.completed_today && todo.current_count < todo.target_count) {
      setCheckInModal({ todoId: todo.id, todo });
      setCheckInNotes('');
      setCheckInImages([]);
    } else if (todo.completed_today && (todo.uploaded_images || []).length > 0) {
      // Toggle photo collapse state for completed todos with images
      setCollapsedPhotos(prev => {
        const newSet = new Set(prev);
        if (newSet.has(todo.id)) {
          newSet.delete(todo.id);
        } else {
          newSet.add(todo.id);
        }
        return newSet;
      });
    }
  };

  const handleSaveCheckIn = async () => {
    if (!checkInModal) return;

    try {
      // Call the check-in API
      const updatedTodo = await todosApi.checkInTodo(checkInModal.todoId, {
        notes: checkInNotes || undefined,
        images: checkInImages.length > 0 ? checkInImages : undefined,
      });

      // Update local state with the updated todo
      setTodos(prevTodos =>
        prevTodos.map(todo =>
          todo.id === updatedTodo.id ? updatedTodo : todo
        )
      );

      // Close modal and reset form
      setCheckInModal(null);
      setCheckInNotes('');
      setCheckInImages([]);
    } catch (err) {
      console.error('Failed to check in todo:', err);
      alert('Failed to save check-in. Please try again.');
    }
  };

  const handleAddMorePhotos = (todoId: number) => {
    const todo = todos.find(t => t.id === todoId);
    if (todo) {
      setCheckInModal({ todoId, todo });
      setCheckInNotes('');
      setCheckInImages([]);
    }
  };

  const handleCheckInImageUpload = (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    setCheckInImages(prev => [...prev, imageUrl]);
  };

  const handleDeleteCheckInImage = (imageUrl: string) => {
    setCheckInImages(prev => prev.filter(img => img !== imageUrl));
  };

  const handleDeleteImage = (todoId: number, imageUrl: string) => {
    setTodos(prevTodos =>
      prevTodos.map(todo => {
        if (todo.id === todoId) {
          const newImages = (todo.uploaded_images || []).filter(img => img !== imageUrl);
          return {
            ...todo,
            uploaded_images: newImages,
          };
        }
        return todo;
      })
    );
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

  return (
    <>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="space-y-4 pt-6 pb-2">
          <p className="text-[#5B7FF3] tracking-widest text-sm">
            YOUR GOALS
          </p>
          <h1 className="text-gray-900 text-4xl leading-tight" style={{ fontWeight: 700 }}>
            Daily Action Items
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed">
            Track your personalized health recommendations and upload progress photos.
          </p>
        </div>

        {/* Todo List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-gray-500">Loading todos...</div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-red-500">{error}</div>
            </div>
          ) : todos.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-12 text-gray-500">
              <p className="text-lg mb-2">No todos yet</p>
              <p className="text-sm">Your personalized goals will appear here after chatting with Olivia</p>
            </div>
          ) : (
            todos.map(todo => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onCheckboxClick={handleCheckboxClick}
                onAddMorePhotos={handleAddMorePhotos}
                getCategoryIcon={getCategoryIcon}
                getCategoryColor={getCategoryColor}
                collapsedPhotos={collapsedPhotos}
              />
            ))
          )}
        </div>
      </div>

      {/* View All Images Modal */}
      {viewAllImagesModal && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setViewAllImagesModal(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-800">All Photos</h3>
              <button
                onClick={() => setViewAllImagesModal(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {viewAllImagesModal.images.map((imageUrl, index) => (
                <div key={index} className="relative group">
                  <img
                    src={imageUrl}
                    alt={`Progress ${index + 1}`}
                    className="w-full aspect-square object-cover rounded-2xl"
                  />
                  <button
                    onClick={() => {
                      handleDeleteImage(viewAllImagesModal.todoId, imageUrl);
                      if (viewAllImagesModal.images.length === 1) {
                        setViewAllImagesModal(null);
                      } else {
                        setViewAllImagesModal({
                          ...viewAllImagesModal,
                          images: viewAllImagesModal.images.filter(img => img !== imageUrl)
                        });
                      }
                    }}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Check-In Modal */}
      {checkInModal && <CheckInModal
        checkInModal={checkInModal}
        setCheckInModal={setCheckInModal}
        checkInNotes={checkInNotes}
        setCheckInNotes={setCheckInNotes}
        checkInImages={checkInImages}
        handleCheckInImageUpload={handleCheckInImageUpload}
        handleDeleteCheckInImage={handleDeleteCheckInImage}
        handleSaveCheckIn={handleSaveCheckIn}
        isRecording={isRecording}
        setIsRecording={setIsRecording}
      />}
    </>
  );
}
