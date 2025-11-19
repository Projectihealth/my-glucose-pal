import { useState } from 'react';
import { ArrowLeft, Utensils, Activity, Moon, FileText, Zap } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useCallResults } from "../../../hooks/olivia/useCallResults";
import type { GoalStatus } from "../../../types/olivia/retell";

interface CallResultsProps {
  onBack: () => void;
  callId: string | null;
  transcript: any[];
}

export function CallResults({ onBack, callId, transcript }: CallResultsProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'goals'>('summary');
  const userId = import.meta.env.VITE_DEFAULT_USER_ID || 'user_001';
  const userName = 'User';
  
  const { summary, goalAnalysis, goals, isLoading, error } = useCallResults({
    callId: callId || '',
    transcript,
    userId,
    userName,
    isCallEnded: true,
  });

  // Sort goals: ACHIEVED first, then IN PROGRESS, then NOT STARTED
  const sortedGoals = goals ? [...goals].sort((a, b) => {
    const statusOrder: Record<GoalStatus, number> = {
      'ACHIEVED': 1,
      'IN PROGRESS': 2,
      'NOT STARTED': 3,
    };
    return statusOrder[a.status] - statusOrder[b.status];
  }) : [];

  const achievedCount = goals?.filter(g => g.status === 'ACHIEVED').length || 0;
  const inProgressCount = goals?.filter(g => g.status === 'IN PROGRESS').length || 0;
  const totalGoals = goals?.length || 0;
  const progressPercentage = totalGoals > 0 ? (achievedCount / totalGoals) * 100 : 0;

  const getStatusBadgeColor = (status: GoalStatus) => {
    switch (status) {
      case 'ACHIEVED':
        return 'bg-[#5B7FF3] text-white hover:bg-[#5B7FF3]';
      case 'IN PROGRESS':
        return 'bg-[#5B7FF3] text-white hover:bg-[#5B7FF3]';
      case 'NOT STARTED':
        return 'bg-gray-400 text-white hover:bg-gray-400';
    }
  };

  const getGoalNumberColor = (status: GoalStatus) => {
    switch (status) {
      case 'ACHIEVED':
        return 'bg-[#5B7FF3] text-white';
      case 'IN PROGRESS':
        return 'bg-[#5B7FF3] text-white';
      case 'NOT STARTED':
        return 'bg-gray-400 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col max-w-[430px] mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center flex-shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 active:bg-gray-100 rounded-full">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-gray-800 ml-3">Call Results</h1>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex-shrink-0">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex-1 py-2 px-4 rounded-full text-sm transition-colors ${
              activeTab === 'summary'
                ? 'bg-[#5B7FF3] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`flex-1 py-2 px-4 rounded-full text-sm transition-colors ${
              activeTab === 'goals'
                ? 'bg-[#5B7FF3] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Goals Achievement
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="px-4 py-4">
            {isLoading && (
              <div className="text-center text-gray-500 py-8">
                Analyzing your conversation...
              </div>
            )}
            {error && (
              <div className="text-center text-red-500 py-8">
                {error}
              </div>
            )}
            
            {/* Summary Tab */}
            {activeTab === 'summary' && summary && !isLoading && (
              <div className="space-y-3">
                {/* Meals Section */}
                {summary.meals && (
                  <div className="bg-[#EEF2FF] rounded-2xl p-4 border border-blue-100">
                    <div className="flex items-start gap-3">
                      <Utensils className="w-5 h-5 text-[#5B7FF3] mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="text-gray-800 text-sm mb-1">Meals</h4>
                        <div className="text-gray-600 text-sm leading-relaxed space-y-1">
                          {summary.meals.breakfast && <p><strong>Breakfast:</strong> {summary.meals.breakfast}</p>}
                          {summary.meals.lunch && <p><strong>Lunch:</strong> {summary.meals.lunch}</p>}
                          {summary.meals.dinner && <p><strong>Dinner:</strong> {summary.meals.dinner}</p>}
                          {summary.meals.snacks && <p><strong>Snacks:</strong> {summary.meals.snacks}</p>}
                          {!summary.meals.breakfast && !summary.meals.lunch && !summary.meals.dinner && !summary.meals.snacks && (
                            <p className="text-gray-400 italic">No meal information available</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Exercise Section */}
                {summary.exercise && (
                  <div className="bg-[#EEF2FF] rounded-2xl p-4 border border-blue-100">
                    <div className="flex items-start gap-3">
                      <Activity className="w-5 h-5 text-[#5B7FF3] mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="text-gray-800 text-sm mb-1">Exercise</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">{summary.exercise}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Sleep Section */}
                {summary.sleep && (
                  <div className="bg-[#EEF2FF] rounded-2xl p-4 border border-blue-100">
                    <div className="flex items-start gap-3">
                      <Moon className="w-5 h-5 text-[#5B7FF3] mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="text-gray-800 text-sm mb-1">Sleep Pattern</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">{summary.sleep}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Additional Notes Section */}
                {summary.additional_notes && (
                  <div className="bg-[#EEF2FF] rounded-2xl p-4 border border-blue-100">
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-[#5B7FF3] mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="text-gray-800 text-sm mb-1">Additional Notes</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">{summary.additional_notes}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* No data message */}
                {!summary.meals && !summary.exercise && !summary.sleep && !summary.additional_notes && (
                  <div className="text-center text-gray-500 py-8">
                    <p>No summary data available yet.</p>
                    <p className="text-sm mt-2">The conversation may have been too short to generate a summary.</p>
                  </div>
                )}
              </div>
            )}

            {/* Goals Tab */}
            {activeTab === 'goals' && !isLoading && (
              <div className="space-y-4">
                {/* Overall Progress */}
                <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                  <h3 className="text-gray-800 mb-4">Overall Progress</h3>
                  
                  <div className="flex items-center justify-between mb-3 text-center">
                    <div className="flex-1">
                      <div className="text-3xl text-[#5B7FF3] mb-1">{achievedCount}</div>
                      <div className="text-xs text-gray-500 uppercase">Achieved</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-3xl text-[#5B7FF3] mb-1">{inProgressCount}</div>
                      <div className="text-xs text-gray-500 uppercase">In Progress</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-3xl text-[#5B7FF3] mb-1">{totalGoals}</div>
                      <div className="text-xs text-gray-500 uppercase">Total Goals</div>
                    </div>
                  </div>

                  <Progress value={progressPercentage} className="h-2" />
                </div>

                {/* Goal Cards */}
                {sortedGoals.map((goal) => (
                  <div key={goal.id} className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                    {/* Goal Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getGoalNumberColor(goal.status)}`}>
                        <span className="text-sm">{goal.id}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800 text-sm leading-relaxed mb-2">{goal.title}</p>
                        <Badge className={`${getStatusBadgeColor(goal.status)} text-xs`}>
                          {goal.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Current Behavior */}
                    {goal.currentBehavior && (
                      <div className="mb-3 bg-gray-50 rounded-xl p-3">
                        <h4 className="text-gray-700 text-xs uppercase mb-2 tracking-wide">
                          Current Behavior
                        </h4>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {goal.currentBehavior}
                        </p>
                      </div>
                    )}

                    {/* Recommendation */}
                    <div className="bg-[#EEF2FF] rounded-xl p-3 border border-blue-100">
                      <div className="flex items-start gap-2">
                        <Zap className="w-4 h-4 text-[#5B7FF3] mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="text-[#5B7FF3] text-xs uppercase mb-2 tracking-wide">
                            Recommendation
                          </h4>
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {goal.recommendation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
