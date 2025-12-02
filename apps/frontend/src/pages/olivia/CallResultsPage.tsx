import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { ScrollArea } from '../../components/ui/scroll-area';
import { TodoItemCard } from '../../components/TodoItemCard';
import {
  generateConversationSummary,
  generateGoals,
  generateTodoSuggestions,
  batchCreateTodos,
  getCurrentWeekStart,
  type ConversationSummary,
  type Goal,
  type TodoSuggestion,
  type TranscriptMessage
} from '../../services/olivia/callResultsApi';
import { getStoredUserId } from '../../utils/userUtils';

interface LocationState {
  conversationId: string;
  transcript: TranscriptMessage[];
  durationSeconds: number;
}

interface TodoWithSelection extends TodoSuggestion {
  id: number;
  selected: boolean;
  current_count: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
}

export function CallResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  // State
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data from API
  const [summary, setSummary] = useState<ConversationSummary | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [todos, setTodos] = useState<TodoWithSelection[]>([]);

  // Submitting state
  const [submitting, setSubmitting] = useState(false);

  // Load data on mount
  useEffect(() => {
    if (!state?.conversationId || !state?.transcript) {
      setError('Missing conversation data');
      setLoading(false);
      return;
    }

    loadCallResults();
  }, []);

  const loadCallResults = async () => {
    try {
      setLoading(true);
      setError(null);

      const userId = getStoredUserId();
      const { conversationId, transcript, durationSeconds } = state;

      // Load all data in parallel
      const [summaryData, goalsData, todoSuggestionsData] = await Promise.all([
        generateConversationSummary(transcript, durationSeconds || 0),
        generateGoals(userId, conversationId, transcript),
        generateTodoSuggestions(userId, conversationId, transcript),
      ]);

      setSummary(summaryData);
      setGoals(goalsData);

      // Convert suggestions to TodoWithSelection format
      const todosWithSelection: TodoWithSelection[] = todoSuggestionsData.map((suggestion, index) => ({
        ...suggestion,
        id: index + 1, // Temporary ID for frontend
        selected: true, // Default to selected
        current_count: 0,
        status: 'pending' as const,
      }));

      setTodos(todosWithSelection);
    } catch (err) {
      console.error('Failed to load call results:', err);
      setError('Failed to load call results. Please try again.');
    } finally {
      setLoading(false);
    }
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

  const handleEditTodo = (todo: TodoWithSelection) => {
    // Edit functionality can be implemented later
    console.log('Edit todo:', todo);
  };

  const handleSaveTodo = (updatedTodo: TodoWithSelection) => {
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === updatedTodo.id ? updatedTodo : todo
      )
    );
  };

  const handleConfirm = async () => {
    try {
      setSubmitting(true);

      const selectedTodos = todos.filter(t => t.selected);

      if (selectedTodos.length === 0) {
        alert('Please select at least one habit to track');
        return;
      }

      const userId = getStoredUserId();
      const { conversationId } = state;
      const weekStart = getCurrentWeekStart();

      // Create selected todos in database
      await batchCreateTodos(userId, conversationId, weekStart, selectedTodos);

      // Navigate to GoalTab
      navigate('/goal', { replace: true });
    } catch (err) {
      console.error('Failed to save todos:', err);
      alert('Failed to save habits. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/olivia', { replace: true });
  };

  const getCategoryIcon = (category: TodoWithSelection['category']) => {
    const icons = {
      diet: '🍎',
      exercise: '💪',
      sleep: '😴',
      stress: '🧘',
      medication: '💊',
      other: '📝',
    };
    return icons[category] || icons.other;
  };

  const getCategoryColor = (category: TodoWithSelection['category']) => {
    const colors = {
      diet: 'bg-orange-100 text-orange-600',
      exercise: 'bg-green-100 text-green-600',
      sleep: 'bg-purple-100 text-purple-600',
      stress: 'bg-blue-100 text-blue-600',
      medication: 'bg-pink-100 text-pink-600',
      other: 'bg-gray-100 text-gray-600',
    };
    return colors[category] || colors.other;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center max-w-[390px] mx-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5B7FF3] mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing your conversation...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center max-w-[390px] mx-auto p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-[#5B7FF3] text-white rounded-full hover:bg-[#4A6FE2]"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col max-w-[390px] mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center flex-shrink-0 shadow-sm">
        <button onClick={handleBack} className="p-2 -ml-2 active:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h2 className="text-gray-800 ml-3">Call Summary</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative">
        <ScrollArea className="h-full">
          <div className="px-4 py-5 space-y-5 pb-32">
            {/* Summary Card - Collapsible */}
            {summary && (
              <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
                <div className="p-6">
                  {/* Header with Copy */}
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-gray-800 flex items-center gap-2">
                      <span>📋</span>
                      Conversation Summary
                    </h3>
                    <button
                      className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors active:scale-95"
                      title="Copy summary"
                      onClick={() => navigator.clipboard.writeText(summary.overview)}
                    >
                      <Copy className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>

                  {/* Call Info */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center">
                        <Clock className="w-3.5 h-3.5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Duration</p>
                        <p className="text-sm text-gray-700">{summary.duration}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Today</p>
                      <p className="text-sm text-gray-700">{new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p>
                    </div>
                  </div>

                  {/* Content with max-height and gradient fade */}
                  <div className="relative">
                    <div
                      className={`space-y-4 transition-all duration-300 ${
                        isSummaryExpanded ? 'max-h-none' : 'max-h-[180px] overflow-hidden'
                      }`}
                    >
                      <div>
                        <h4 className="text-sm text-gray-700 mb-3">Overview</h4>
                        {/* Robust bullet point support:
                            - LLM often returns a multiline string with lines starting with "• "
                            - Sometimes bullets are separated only by spaces or newlines
                            We normalize by splitting on newlines first, then on "•",
                            and treat it as bullets if we get more than one non‑empty item. */}
                        {(() => {
                          // Ensure raw is always a string
                          const raw = typeof summary.overview === 'string' ? summary.overview : String(summary.overview || '');
                          const bulletCandidates = raw
                            .split('\n')
                            .flatMap(line => line.split('•'))
                            .map(b => b.trim())
                            .filter(Boolean);

                          const isBulletOverview = bulletCandidates.length > 1;

                          if (!isBulletOverview) {
                            return (
                              <p className="text-sm text-gray-600 leading-relaxed">
                                {raw}
                              </p>
                            );
                          }

                          return (
                            <ul className="space-y-2.5">
                              {bulletCandidates.map((bullet, index) => (
                                <li
                                  key={index}
                                  className="flex gap-2.5 text-sm text-gray-600 leading-relaxed"
                                >
                                  <span className="text-[#5B7FF3] flex-shrink-0 mt-0.5">
                                    •
                                  </span>
                                  <span className="flex-1">{bullet}</span>
                                </li>
                              ))}
                            </ul>
                          );
                        })()}
                      </div>

                      {summary.key_findings.length > 0 && (
                        <>
                          <div className="h-px bg-gray-100" />

                          <div>
                            <h4 className="text-sm text-gray-700 mb-3">Key Findings</h4>
                            <div className="space-y-3">
                              {summary.key_findings.map((finding, index) => (
                                <div key={index} className="flex items-start gap-3">
                                  <div className="w-1.5 h-1.5 rounded-full bg-[#5B7FF3] mt-2 flex-shrink-0"></div>
                                  <p className="text-sm text-gray-600 leading-relaxed">{finding}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Gradient fade when collapsed */}
                    {!isSummaryExpanded && (
                      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                    )}
                  </div>
                </div>

                {/* Expand/Collapse Button */}
                <button
                  onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                  className="w-full py-3 border-t border-gray-100 flex items-center justify-center gap-2 text-[#5B7FF3] hover:bg-gray-50 transition-colors active:scale-[0.99]"
                >
                  <span className="text-sm">{isSummaryExpanded ? 'Show less' : 'Read more'}</span>
                  {isSummaryExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            )}

            {/* Action Items Section Header */}
            <div className="pt-1">
              <h3 className="text-gray-800 mb-1 flex items-center gap-2">
                <span>✅</span>
                Your Action Items
              </h3>
              <p className="text-gray-500 text-sm">
                Select habits to track and adjust weekly frequency
              </p>
            </div>

            {/* Todo List */}
            <div className="space-y-3 pb-28">
              {todos.map(todo => (
                <TodoItemCard
                  key={todo.id}
                  todo={todo}
                  onToggleSelect={handleToggleTodo}
                  onUpdateFrequency={handleUpdateFrequency}
                  onEdit={handleEditTodo}
                  onSave={handleSaveTodo}
                  getCategoryIcon={getCategoryIcon}
                  getCategoryColor={getCategoryColor}
                />
              ))}
            </div>

            {todos.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No action items generated from this conversation.</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Bottom Floating Action Bar - Outside ScrollArea */}
        {todos.length > 0 && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[358px] bg-white rounded-2xl p-4 shadow-lg border border-gray-100 z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Selected habits</p>
                <p className="text-gray-800">
                  {todos.filter(t => t.selected).length} of {todos.length}
                </p>
              </div>
              <button
                className="bg-[#5B7FF3] text-white px-6 py-2.5 rounded-full hover:bg-[#4A6FE2] active:scale-95 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleConfirm}
                disabled={submitting || todos.filter(t => t.selected).length === 0}
              >
                {submitting ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
