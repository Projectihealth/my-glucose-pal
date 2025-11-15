import { useState } from 'react';
import { ArrowLeft, Utensils, Activity, Moon, FileText, Zap } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

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

export function CallResultsPage({ onBack }: CallResultsPageProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'goals'>('summary');

  // Mock data
  const callSummary = {
    meals: 'Breakfast: Oatmeal with berries | Lunch: Salad with grilled chicken | Dinner: Lean protein with vegetables, sometimes brown rice',
    exercise: 'Gym 3-4 times per week (cardio and light weights) | Daily 30-minute walks',
    sleep: '7-8 hours per night | Bedtime: 11 PM | Wake time: 7 AM',
    notes: 'Patient maintains a balanced diet and active lifestyle. Good sleep hygiene practices.',
  };

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
            {/* Summary Tab */}
            {activeTab === 'summary' && (
              <div className="space-y-3">
                <div className="bg-[#EEF2FF] rounded-2xl p-4 border border-blue-100">
                  <div className="flex items-start gap-3">
                    <Utensils className="w-5 h-5 text-[#5B7FF3] mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="text-gray-800 text-sm mb-1">Meals</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">{callSummary.meals}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-[#EEF2FF] rounded-2xl p-4 border border-blue-100">
                  <div className="flex items-start gap-3">
                    <Activity className="w-5 h-5 text-[#5B7FF3] mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="text-gray-800 text-sm mb-1">Exercise</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">{callSummary.exercise}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-[#EEF2FF] rounded-2xl p-4 border border-blue-100">
                  <div className="flex items-start gap-3">
                    <Moon className="w-5 h-5 text-[#5B7FF3] mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="text-gray-800 text-sm mb-1">Sleep Pattern</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">{callSummary.sleep}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-[#EEF2FF] rounded-2xl p-4 border border-blue-100">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-[#5B7FF3] mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="text-gray-800 text-sm mb-1">Additional Notes</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">{callSummary.notes}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Goals Tab */}
            {activeTab === 'goals' && (
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
                        <Badge className={`${getStatusColor(goal.status)} text-xs`}>
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
