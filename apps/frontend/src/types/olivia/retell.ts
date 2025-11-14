export interface TranscriptMessage {
  role: 'agent' | 'user';
  content: string;
  timestamp?: Date;
}

export interface CallStatus {
  status: 'idle' | 'connecting' | 'connected' | 'ended' | 'error';
  callId?: string;
  error?: string;
}

export interface CallSummary {
  data_quality?: 'sufficient' | 'insufficient';
  reason?: string | null;
  meals: {
    breakfast: string;
    lunch: string;
    dinner: string;
    snacks: string;
  };
  exercise: string;
  sleep: string;
  beverages: string;
  lifestyle: {
    smoking: string;
    alcohol: string;
    fast_food?: string;
  };
  mental_health: string;
  additional_notes: string;
}

export type GoalStatus = 'ACHIEVED' | 'IN PROGRESS' | 'NOT STARTED';

export interface Goal {
  id: number;
  title: string;
  status: GoalStatus;
  currentBehavior?: string;
  recommendation: string;
}

export interface GoalAnalysis {
  goal: string;
  alignment_score: number;
  strengths: string[];
  areas_for_improvement: string[];
  recommendations: string[];
  summary: string;
}

export interface CallResults {
  summary: CallSummary | null;
  goalAnalysis: GoalAnalysis | null;
  goals?: Goal[];
  isLoading: boolean;
  error?: string;
}
