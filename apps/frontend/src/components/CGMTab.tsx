import { ChevronDown, TrendingUp, TrendingDown, Activity, Moon, Utensils, Plus, Check, Mic, Coffee, Apple, Dumbbell, Brain, MessageSquare, X, Send, Circle, Pencil, Trash2, Clock, Zap, History, ChevronRight, Sparkles } from 'lucide-react';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceDot, Line } from 'recharts';
import { TabHeader } from './TabHeader';

interface PatternWithAction {
  id: string;
  type: 'spike' | 'drop' | 'stable' | 'low' | 'variability';
  timeRange: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  suggestedAction?: {
    id: string;
    title: string;
    description: string;
    targetCount: number;
    category: 'diet' | 'exercise' | 'sleep' | 'medication';
    icon: any;
    isAddedToGoals: boolean;
  };
}

interface CGMDataPoint {
  time: string;
  value: number;
  hour: number;
  mealPredicted?: number;  // Individualized NN prediction for meals
}

interface LogEvent {
  id: string;
  type: 'meal' | 'activity' | 'stress' | 'sleep';
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  description: string;
  time: string;
  hour: number;
  status?: string;
  icon: any;
  color: string;
  bgColor: string;
}

// Simplified interface - goals integration can be added later
interface CGMTabProps {
  // Props can be added as needed
}

// Generate realistic CGM data for 24 hours based on date
const generateCGMDataForDate = (date: string): CGMDataPoint[] => {
  const data: CGMDataPoint[] = [];
  const hours = ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00',
                 '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00',
                 '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:59'];

  // Different CGM patterns for different dates
  let values: number[];
  let currentHourIndex: number;

  if (date === 'Dec 1') {
    // Dec 1: Full day - healthy eating day with low GI breakfast, exercise after lunch, moderate dinner
    values = [88, 85, 82, 80, 85, 95, 115, 130, 148, 155, 145, 135,
              155, 170, 160, 145, 130, 120, 145, 160, 150, 135, 115, 95];
    currentHourIndex = 23; // Full 24 hours available
  } else if (date === 'Dec 2') {
    // Dec 2: Full day - honey oatmeal breakfast (high GI), salad lunch (low GI), evening walk after dinner
    values = [95, 92, 88, 85, 90, 110, 145, 180, 210, 195, 165, 140,
              160, 175, 155, 140, 135, 145, 170, 190, 165, 140, 120, 105];
    currentHourIndex = 23; // Full 24 hours available
  } else {
    // Dec 3: Current day - partial data (up to 2 PM)
    values = [90, 87, 84, 82, 88, 105, 135, 165, 190, 175, 150, 135,
              150, 165, 155, 145, 135, 145, 165, 180, 160, 145, 125, 110];
    currentHourIndex = 14; // Only show data up to 2 PM
  }

  hours.forEach((time, index) => {
    data.push({
      time,
      // For future times, set value to null so it won't be plotted but time slot exists
      value: index <= currentHourIndex ? values[index] : null as any,
      hour: index
    });
  });

  return data;
};

// Get events for specific date
const getEventsForDate = (date: string): LogEvent[] => {
  if (date === 'Dec 1') {
    return [
      {
        id: 'dec1-1',
        type: 'meal',
        mealType: 'breakfast',
        description: 'Greek yogurt with whole grain granola',
        time: '07:00',
        hour: 7,
        icon: Coffee,
        color: '#FF6B9D',
        bgColor: '#FFF0F5',
      },
      {
        id: 'dec1-2',
        type: 'meal',
        mealType: 'lunch',
        description: 'Quinoa bowl with grilled vegetables',
        time: '11:00',
        hour: 11,
        icon: Utensils,
        color: '#5B7FF3',
        bgColor: '#EEF2FF',
      },
      {
        id: 'dec1-3',
        type: 'activity',
        description: '45 min gym workout',
        time: '14:00',
        hour: 14,
        icon: Dumbbell,
        color: '#00D492',
        bgColor: '#F0FDF9',
      },
      {
        id: 'dec1-4',
        type: 'meal',
        mealType: 'dinner',
        description: 'Baked salmon with brown rice',
        time: '17:00',
        hour: 17,
        icon: Utensils,
        color: '#5B7FF3',
        bgColor: '#EEF2FF',
      },
    ];
  } else if (date === 'Dec 2') {
    return [
      {
        id: 'dec2-1',
        type: 'meal',
        mealType: 'breakfast',
        description: 'Oatmeal with berries and honey',
        time: '07:00',
        hour: 7,
        icon: Coffee,
        color: '#FF6B9D',
        bgColor: '#FFF0F5',
      },
      {
        id: 'dec2-2',
        type: 'meal',
        mealType: 'lunch',
        description: 'Grilled chicken salad',
        time: '11:00',
        hour: 11,
        icon: Utensils,
        color: '#5B7FF3',
        bgColor: '#EEF2FF',
      },
      {
        id: 'dec2-3',
        type: 'meal',
        mealType: 'dinner',
        description: 'Pasta with marinara sauce',
        time: '17:00',
        hour: 17,
        icon: Utensils,
        color: '#5B7FF3',
        bgColor: '#EEF2FF',
      },
      {
        id: 'dec2-4',
        type: 'activity',
        description: '30 min evening walk',
        time: '18:00',
        hour: 18,
        icon: Dumbbell,
        color: '#00D492',
        bgColor: '#F0FDF9',
      },
    ];
  } else {
    // Dec 3 events (current day)
    return [
      {
        id: 'dec3-1',
        type: 'meal',
        mealType: 'breakfast',
        description: 'Scrambled eggs with avocado toast',
        time: '07:00',
        hour: 7,
        icon: Coffee,
        color: '#FF6B9D',
        bgColor: '#FFF0F5',
      },
      {
        id: 'dec3-2',
        type: 'meal',
        mealType: 'lunch',
        description: 'Turkey sandwich with side salad',
        time: '11:00',
        hour: 11,
        icon: Utensils,
        color: '#5B7FF3',
        bgColor: '#EEF2FF',
      },
    ];
  }
};

// Custom Tooltip Component with Events
const CustomTooltip = ({ active, payload, events }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const eventsAtTime = events.filter((e: LogEvent) => e.time === data.time);
    
    return (
      <div className="bg-white px-3 py-2.5 rounded-xl shadow-lg border border-gray-200 max-w-[200px]">
        <p className="text-xs text-gray-500 mb-0.5">{data.time}</p>
        <p className="font-semibold text-gray-900 mb-2" style={{ fontSize: '15px' }}>
          {data.value?.toFixed(1) || data.mealPredicted?.toFixed(1) || '--'} <span className="text-gray-500 font-normal text-sm">mg/dL</span>
        </p>
        {eventsAtTime.length > 0 && (
          <div className="space-y-1 pt-2 border-t border-gray-100">
            {eventsAtTime.map((event: LogEvent) => {
              const EventIcon = event.icon;
              return (
                <div key={event.id} className="flex items-center gap-2">
                  <div 
                    className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: event.bgColor }}
                  >
                    <EventIcon className="w-3 h-3" style={{ color: event.color }} />
                  </div>
                  <p className="text-xs text-gray-700 truncate">
                    {event.mealType ? `${event.mealType}: ` : ''}{event.description}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
  return null;
};

// Quick suggestions for each type
const quickSuggestions: { [key: string]: string[] } = {
  meal: [
    'Oatmeal with berries',
    'Grilled chicken salad',
    'Salmon with vegetables',
    'Greek yogurt with nuts',
    'Avocado toast',
    'Protein smoothie',
  ],
  activity: [
    '30 min walk',
    'Gym workout',
    'Yoga session',
    'Swimming',
    'Cycling',
    'Running',
  ],
  stress: [
    'Work deadline pressure',
    'Meeting anxiety',
    'Family concerns',
    'Financial worries',
    'Traffic stress',
    'General anxiety',
  ],
  sleep: [
    'Full night sleep',
    'Restless night',
    'Afternoon nap',
    'Woke up refreshed',
    'Insomnia',
    'Deep sleep',
  ],
};

// Generate meal prediction based on individualized NN model
const generateGlucoseProjections = (
  cgmData: CGMDataPoint[],
  events: LogEvent[]
): CGMDataPoint[] => {
  const projectedData = cgmData.map(point => ({ ...point }));
  
  // Create a smooth meal prediction curve for the entire day
  // This simulates an individualized neural network prediction
  projectedData.forEach((point, index) => {
    const baseValue = point.value || 90;
    
    // Add some variation to create a prediction that's slightly different from actual
    // This simulates ML model prediction uncertainty
    const variation = Math.sin(index * 0.3) * 8 + Math.cos(index * 0.5) * 5;
    
    // For meal times, predict slightly higher or with different timing
    const mealEvents = events.filter(e => e.type === 'meal');
    let mealAdjustment = 0;
    
    mealEvents.forEach(event => {
      const eventHour = parseInt(event.time.split(':')[0]);
      const hourDiff = Math.abs(point.hour - eventHour);
      
      if (hourDiff <= 4) {
        // Create a predicted meal response curve
        if (hourDiff === 0) {
          mealAdjustment += 10;
        } else if (hourDiff === 1) {
          mealAdjustment += 25;
        } else if (hourDiff === 2) {
          mealAdjustment += 15;
        } else if (hourDiff === 3) {
          mealAdjustment += 5;
        }
      }
    });
    
    point.mealPredicted = Math.max(50, baseValue + variation + mealAdjustment);
  });

  return projectedData;
};

export function CGMTab({}: CGMTabProps = {}) {
  const [currentDate, setCurrentDate] = useState('Dec 3');
  const [showPatterns, setShowPatterns] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [cgmData, setCgmData] = useState<CGMDataPoint[]>(generateCGMDataForDate('Dec 3'));
  const [isRecording, setIsRecording] = useState(false);
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
  const [recordingTimer, setRecordingTimer] = useState(0);
  const recordingInterval = useRef<any>(null);
  const [logStep, setLogStep] = useState<1 | 2 | 3>(1); // Multi-step modal
  const [editingEvent, setEditingEvent] = useState<LogEvent | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [expandedPatterns, setExpandedPatterns] = useState<{ [key: string]: boolean }>({});

  const [logEvents, setLogEvents] = useState<LogEvent[]>(getEventsForDate('Dec 3'));
  
  // Form state
  const [selectedEventType, setSelectedEventType] = useState<'meal' | 'activity' | 'stress' | 'sleep'>('meal');
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [eventDescription, setEventDescription] = useState('');
  const [eventTime, setEventTime] = useState('12:00');
  const [eventStatus, setEventStatus] = useState('');
  
  const [patternsWithActions, setPatternsWithActions] = useState<PatternWithAction[]>([
    {
      id: '1',
      type: 'spike',
      timeRange: '08:00 - 10:00',
      description: 'Post-breakfast glucose spike detected',
      icon: TrendingUp,
      color: '#FF6B9D',
      bgColor: '#FFF0F5',
      suggestedAction: {
        id: 'action-1',
        title: 'Eat protein-rich breakfast',
        description: 'Add eggs or Greek yogurt to stabilize morning glucose',
        targetCount: 5,
        category: 'diet',
        icon: Utensils,
        isAddedToGoals: false,
      }
    },
    {
      id: '2',
      type: 'stable',
      timeRange: '12:00 - 14:00',
      description: 'Good glucose stability during lunch',
      icon: Activity,
      color: '#00D492',
      bgColor: '#F0FDF9',
    },
    {
      id: '3',
      type: 'spike',
      timeRange: '19:00 - 21:00',
      description: 'Evening glucose elevation after dinner',
      icon: TrendingUp,
      color: '#FF6B9D',
      bgColor: '#FFF0F5',
      suggestedAction: {
        id: 'action-2',
        title: '15-min walk after dinner',
        description: 'Light activity helps manage post-meal glucose',
        targetCount: 4,
        category: 'exercise',
        icon: Dumbbell,
        isAddedToGoals: false,
      }
    },
    {
      id: '4',
      type: 'low',
      timeRange: '03:00 - 04:00',
      description: 'Nighttime glucose dip detected',
      icon: TrendingDown,
      color: '#F59E0B',
      bgColor: '#FFF7ED',
      suggestedAction: {
        id: 'action-3',
        title: 'Small bedtime snack',
        description: 'Have a small protein-fat snack before bed to prevent overnight lows',
        targetCount: 3,
        category: 'diet',
        icon: Moon,
        isAddedToGoals: false,
      }
    },
    {
      id: '5',
      type: 'variability',
      timeRange: '15:00 - 17:00',
      description: 'High glucose variability in afternoon',
      icon: Activity,
      color: '#8B5CF6',
      bgColor: '#F5F3FF',
      suggestedAction: {
        id: 'action-4',
        title: 'Schedule regular snack time',
        description: 'Have a consistent afternoon snack to reduce glucose swings',
        targetCount: 5,
        category: 'diet',
        icon: Clock,
        isAddedToGoals: false,
      }
    },
    {
      id: '6',
      type: 'drop',
      timeRange: '14:00 - 15:00',
      description: 'Post-exercise glucose drop',
      icon: TrendingDown,
      color: '#06B6D4',
      bgColor: '#ECFEFF',
      suggestedAction: {
        id: 'action-5',
        title: 'Pre-workout carbs',
        description: 'Eat 15-20g carbs before exercise to prevent lows',
        targetCount: 4,
        category: 'exercise',
        icon: Sparkles,
        isAddedToGoals: false,
      }
    },
  ]);

  const handleAddToGoals = (patternId: string, actionId: string) => {
    const pattern = patternsWithActions.find(p => p.id === patternId);
    const action = pattern?.suggestedAction;

    if (!action) return;

    setPatternsWithActions(prev =>
      prev.map(p =>
        p.id === patternId && p.suggestedAction
          ? { ...p, suggestedAction: { ...p.suggestedAction, isAddedToGoals: true } }
          : p
      )
    );

    // TODO: Integrate with GoalTab to actually add goals
    // For now, just show success message
    toast.success('Added to Goals!', {
      description: `"${action.title}" has been added to This Week.`,
    });
  };

  const openLogModal = () => {
    setEditingEvent(null);
    setEventDescription('');
    setEventTime(new Date().toTimeString().slice(0, 5));
    setEventStatus('');
    setSelectedEventType('meal');
    setSelectedMealType('breakfast');
    setLogStep(1);
    setShowLogModal(true);
  };

  const openEditModal = (event: LogEvent) => {
    setEditingEvent(event);
    setSelectedEventType(event.type);
    setSelectedMealType(event.mealType || 'breakfast');
    setEventDescription(event.description);
    setEventTime(event.time);
    setEventStatus(event.status || '');
    setLogStep(1);
    setShowLogModal(true);
  };

  const handleDeleteEvent = (eventId: string) => {
    setLogEvents(prev => prev.filter(e => e.id !== eventId));
    setShowDeleteConfirm(null);
    toast.success('Event deleted', {
      description: 'The event has been removed from your log.',
    });
  };

  // Handle date change
  const handleDateChange = (direction: 'prev' | 'next') => {
    let newDate: string;
    if (direction === 'prev') {
      if (currentDate === 'Dec 3') newDate = 'Dec 2';
      else if (currentDate === 'Dec 2') newDate = 'Dec 1';
      else newDate = 'Dec 1';
    } else {
      if (currentDate === 'Dec 1') newDate = 'Dec 2';
      else if (currentDate === 'Dec 2') newDate = 'Dec 3';
      else newDate = 'Dec 3';
    }
    setCurrentDate(newDate);
    setCgmData(generateCGMDataForDate(newDate));
    setLogEvents(getEventsForDate(newDate));
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTimer(0);
    recordingInterval.current = setInterval(() => {
      setRecordingTimer(prev => prev + 1);
    }, 1000);

    setTimeout(() => {
      stopRecording();
      const mockTranscriptions: { [key: string]: string } = {
        meal: 'I had grilled salmon with quinoa and steamed vegetables',
        activity: 'I went for a 30 minute run in the park',
        stress: 'Feeling stressed about work deadlines',
        sleep: 'Slept well for 8 hours, feeling refreshed',
      };
      setEventDescription(mockTranscriptions[selectedEventType] || 'Voice transcription here...');
    }, 3000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
    }
  };

  const handleSaveEvent = () => {
    if (!eventDescription.trim()) {
      toast.error('Please add a description');
      return;
    }

    const eventTypeIcons: { [key: string]: any } = {
      meal: selectedMealType === 'breakfast' ? Coffee : selectedMealType === 'snack' ? Apple : Utensils,
      activity: Dumbbell,
      stress: Brain,
      sleep: Moon,
    };

    const eventTypeColors: { [key: string]: { color: string; bgColor: string } } = {
      meal: { color: '#FF6B9D', bgColor: '#FFF0F5' },
      activity: { color: '#00D492', bgColor: '#F0FDF9' },
      stress: { color: '#F59E0B', bgColor: '#FFFBEB' },
      sleep: { color: '#8B5CF6', bgColor: '#F5F3FF' },
    };

    const hour = parseInt(eventTime.split(':')[0]);

    if (editingEvent) {
      // Update existing event
      const updatedEvent: LogEvent = {
        ...editingEvent,
        type: selectedEventType,
        mealType: selectedEventType === 'meal' ? selectedMealType : undefined,
        description: eventDescription,
        time: eventTime,
        hour,
        status: selectedEventType === 'stress' || selectedEventType === 'sleep' ? eventStatus : undefined,
        icon: eventTypeIcons[selectedEventType],
        ...eventTypeColors[selectedEventType],
      };

      setLogEvents(prev => 
        prev.map(e => e.id === editingEvent.id ? updatedEvent : e).sort((a, b) => a.hour - b.hour)
      );

      toast.success('Event updated!', {
        description: `${selectedEventType === 'meal' ? selectedMealType : selectedEventType} updated at ${eventTime}`,
      });
    } else {
      // Create new event
      const newEvent: LogEvent = {
        id: Date.now().toString(),
        type: selectedEventType,
        mealType: selectedEventType === 'meal' ? selectedMealType : undefined,
        description: eventDescription,
        time: eventTime,
        hour,
        status: selectedEventType === 'stress' || selectedEventType === 'sleep' ? eventStatus : undefined,
        icon: eventTypeIcons[selectedEventType],
        ...eventTypeColors[selectedEventType],
      };

      setLogEvents(prev => [...prev, newEvent].sort((a, b) => a.hour - b.hour));
      
      toast.success('Event logged!', {
        description: `${selectedEventType === 'meal' ? selectedMealType : selectedEventType} logged at ${eventTime}`,
      });
    }

    setEventDescription('');
    setEventStatus('');
    setShowLogModal(false);
    setEditingEvent(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentTimeSlot = () => {
    const now = new Date();
    const hour = now.getHours();
    if (hour < 11) return 'breakfast';
    if (hour < 16) return 'lunch';
    if (hour < 20) return 'dinner';
    return 'snack';
  };

  // Generate projected data based on logged events
  const projectedData = generateGlucoseProjections(cgmData, logEvents);
  // Find the latest reading with an actual value (not null)
  const latestReading = cgmData.filter(d => d.value !== null).slice(-1)[0] || cgmData[0];

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24">
      {/* Main Content Card */}
      <div className="bg-white rounded-b-[32px] shadow-sm">
        <TabHeader
          eyebrow="MY CGM DATA"
          title="Daily CGM Graph"
          className="pb-4"
        />

        <div className="px-6 pb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => handleDateChange('prev')}
              disabled={currentDate === 'Dec 1'}
              className="text-gray-400 text-sm px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous day
            </button>
            <div className="text-gray-900" style={{ fontSize: '15px', fontWeight: 600 }}>
              {currentDate}
            </div>
            <button
              onClick={() => handleDateChange('next')}
              disabled={currentDate === 'Dec 3'}
              className="text-gray-400 text-sm px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next day
            </button>
          </div>

          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-gray-400 text-xs mb-2" style={{ fontWeight: 600 }}>
                LATEST
              </p>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-gray-900" style={{ fontSize: '32px', fontWeight: 700, lineHeight: '1' }}>
                  {latestReading?.value?.toFixed(1) || '0.0'}
                </span>
                <span className="text-gray-900" style={{ fontSize: '20px', fontWeight: 600 }}>
                  mg/dL
                </span>
              </div>
              <p className="text-gray-400 text-sm">{latestReading?.time || '--:--'}</p>
            </div>
          </div>

          <div className="relative" style={{ height: '320px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={projectedData}
                margin={{ top: 10, right: 0, left: -20, bottom: 30 }}
              >
                <defs>
                  <linearGradient id="mainGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5B7FF3" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#5B7FF3" stopOpacity={0.02}/>
                  </linearGradient>
                </defs>

                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#E5E7EB" 
                  vertical={false}
                />

                <ReferenceLine 
                  y={180} 
                  stroke="#C5E7F2" 
                  strokeDasharray="5 5" 
                  strokeWidth={1.5}
                />
                <ReferenceLine 
                  y={90} 
                  stroke="#FFB8D2" 
                  strokeDasharray="5 5" 
                  strokeWidth={1.5}
                />

                {logEvents.map((event) => {
                  const dataPoint = projectedData.find(d => d.time === event.time);
                  if (dataPoint) {
                    // Use actual value if available, otherwise use predicted value
                    const yValue = dataPoint.value || dataPoint.mealPredicted;
                    if (yValue) {
                      return (
                        <ReferenceDot
                          key={event.id}
                          x={event.time}
                          y={yValue}
                          r={6}
                          fill={event.color}
                          stroke="white"
                          strokeWidth={2}
                        />
                      );
                    }
                  }
                  return null;
                })}

                <XAxis 
                  dataKey="time" 
                  stroke="#9CA3AF"
                  style={{ fontSize: '11px', fill: '#9CA3AF' }}
                  tickLine={false}
                  axisLine={false}
                  interval={3}
                  dy={10}
                />

                <YAxis 
                  stroke="#9CA3AF"
                  style={{ fontSize: '11px', fill: '#9CA3AF' }}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 350]}
                  ticks={[0, 90, 180, 350]}
                  tickFormatter={(value) => value === 350 ? '350\nmg/dL' : value.toString()}
                />

                <Tooltip 
                  content={<CustomTooltip events={logEvents} />} 
                  cursor={{ stroke: '#5B7FF3', strokeWidth: 1 }} 
                />

                {/* Actual glucose - CGM data (Area with gradient fill) */}
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#5B7FF3"
                  strokeWidth={2.5}
                  fill="url(#mainGradient)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#5B7FF3', stroke: 'white', strokeWidth: 2 }}
                />

                {/* Meal Predicted - Individualized NN (Red dashed line) */}
                <Line
                  type="monotone"
                  dataKey="mealPredicted"
                  stroke="#EF4444"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  connectNulls
                />
              </AreaChart>
            </ResponsiveContainer>

            <div 
              className="absolute left-0 right-0 pointer-events-none" 
              style={{ 
                top: '8%', 
                height: '28%',
                background: 'linear-gradient(to bottom, rgba(197, 231, 242, 0.15), rgba(197, 231, 242, 0.05))',
                borderRadius: '4px'
              }}
            />

            <div 
              className="absolute left-0 right-0 pointer-events-none" 
              style={{ 
                bottom: '17%', 
                height: '20%',
                background: 'linear-gradient(to bottom, rgba(255, 224, 233, 0.15), rgba(255, 224, 233, 0.05))',
                borderRadius: '4px'
              }}
            />
          </div>

          <div className="flex flex-col gap-3 mt-4">
            {/* Range indicators */}
            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-[#FFB8D2]"></div>
                <span className="text-gray-500" style={{ fontSize: '12px' }}>
                  Below range (&lt; 70 mg/dL)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-[#C5E7F2]"></div>
                <span className="text-gray-500" style={{ fontSize: '12px' }}>
                  Above range (&gt; 170 mg/dL)
                </span>
              </div>
            </div>

            {/* Projection indicators */}
            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-6 h-0.5 bg-[#F59E0B]" style={{ borderTop: '2px dashed #F59E0B' }}></div>
                <span className="text-gray-500" style={{ fontSize: '12px' }}>
                  Meal projection
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-0.5 bg-[#10B981]" style={{ borderTop: '2px dashed #10B981' }}></div>
                <span className="text-gray-500" style={{ fontSize: '12px' }}>
                  Activity projection
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Events Log */}
      <div className="px-6 mt-6">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900" style={{ fontSize: '17px', fontWeight: 600 }}>
              Daily Events
            </h3>
            <span className="text-xs text-gray-500">{logEvents.length} events</span>
          </div>
          <div className="space-y-2.5">
            {logEvents.map((event) => {
              const EventIcon = event.icon;
              return (
                <motion.div 
                  key={event.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="group relative flex items-start gap-3 p-3 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all"
                  style={{ backgroundColor: event.bgColor }}
                >
                  <div 
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${event.color}30` }}
                  >
                    <EventIcon className="w-5 h-5" style={{ color: event.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${event.color}20`, color: event.color, fontWeight: 600 }}>
                        {event.time}
                      </span>
                      {event.mealType && (
                        <span className="text-xs text-gray-500 capitalize">
                          {event.mealType}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700">
                      {event.description}
                    </p>
                    {event.status && (
                      <p className="text-xs text-gray-500 mt-1 italic">
                        Status: {event.status}
                      </p>
                    )}
                  </div>
                  
                  {/* Edit/Delete buttons - shown on hover */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(event)}
                      className="p-1.5 rounded-lg hover:bg-white/80 transition-colors"
                      title="Edit event"
                    >
                      <Pencil className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(event.id)}
                      className="p-1.5 rounded-lg hover:bg-white/80 transition-colors"
                      title="Delete event"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>

                  {/* Delete confirmation dialog */}
                  <AnimatePresence>
                    {showDeleteConfirm === event.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute inset-0 bg-white rounded-2xl border-2 border-red-200 p-3 flex flex-col items-center justify-center gap-2 z-10"
                      >
                        <p className="text-sm text-gray-900 text-center" style={{ fontWeight: 600 }}>
                          Delete this event?
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowDeleteConfirm(null)}
                            className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs hover:bg-gray-200 transition-colors"
                            style={{ fontWeight: 600 }}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs hover:bg-red-600 transition-colors"
                            style={{ fontWeight: 600 }}
                          >
                            Delete
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Daily Patterns Panel */}
      <div className="px-6 mt-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <button
            onClick={() => setShowPatterns(!showPatterns)}
            className="w-full p-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5B7FF3] to-[#7B9FF9] flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-gray-900" style={{ fontSize: '17px', fontWeight: 600 }}>
                  Daily Patterns
                </h3>
                <p className="text-gray-500 text-xs mt-0.5">
                  {patternsWithActions.length} patterns detected
                </p>
              </div>
            </div>
            <motion.div
              animate={{ rotate: showPatterns ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </motion.div>
          </button>

          <AnimatePresence>
            {showPatterns && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-5">
                  {patternsWithActions.map((pattern, index) => {
                    const PatternIcon = pattern.icon;
                    return (
                      <motion.div
                        key={pattern.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="rounded-2xl border border-blue-100 overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50"
                      >
                        {/* Pattern Header */}
                        <div className="flex items-start gap-3 p-3">
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-blue-100"
                          >
                            <PatternIcon className="w-4 h-4 text-[#5B7FF3]" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span 
                                className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-[#5B7FF3]"
                                style={{ fontWeight: 600 }}
                              >
                                {pattern.timeRange}
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm">
                              {pattern.description}
                            </p>
                          </div>
                        </div>

                        {/* Suggested Action Toggle Button */}
                        {pattern.suggestedAction && (
                          <div className="px-3 pb-3">
                            <button
                              onClick={() => setExpandedPatterns(prev => ({
                                ...prev,
                                [pattern.id]: !prev[pattern.id]
                              }))}
                              className="w-full flex items-center justify-between gap-2 p-2.5 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 hover:border-amber-300 transition-all group"
                            >
                              <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-amber-500" />
                                <span className="text-sm text-amber-900" style={{ fontWeight: 600 }}>
                                  AI Suggested Goal
                                </span>
                              </div>
                              <motion.div
                                animate={{ rotate: expandedPatterns[pattern.id] ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <ChevronDown className="w-4 h-4 text-amber-600" />
                              </motion.div>
                            </button>

                            {/* Expandable Suggested Action */}
                            <AnimatePresence>
                              {expandedPatterns[pattern.id] && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="bg-white rounded-xl p-3 border border-gray-200 mt-2">
                                    <div className="flex items-start gap-2.5">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                          <h5 className="text-gray-900 text-sm" style={{ fontWeight: 600 }}>
                                            {pattern.suggestedAction.title}
                                          </h5>
                                          <span className="text-xs text-gray-500 flex-shrink-0" style={{ fontWeight: 600 }}>
                                            {pattern.suggestedAction.targetCount}x/wk
                                          </span>
                                        </div>
                                        <p className="text-xs text-gray-600 mb-2.5 leading-relaxed">
                                          {pattern.suggestedAction.description}
                                        </p>
                                        <button
                                          onClick={() => handleAddToGoals(pattern.id, pattern.suggestedAction!.id)}
                                          disabled={pattern.suggestedAction.isAddedToGoals}
                                          className={`w-full py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all ${
                                            pattern.suggestedAction.isAddedToGoals
                                              ? 'bg-green-100 text-green-700 cursor-default'
                                              : 'bg-[#5B7FF3] text-white hover:bg-[#4A6FE2] active:scale-95'
                                          }`}
                                          style={{ fontWeight: 600 }}
                                        >
                                          {pattern.suggestedAction.isAddedToGoals ? (
                                            <>
                                              <Check className="w-3 h-3" />
                                              Added to Goals
                                            </>
                                          ) : (
                                            <>
                                              <Plus className="w-3 h-3" />
                                              Add to Goals
                                            </>
                                          )}
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Floating Log Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={openLogModal}
        className="fixed right-6 w-14 h-14 bg-gradient-to-br from-[#5B7FF3] to-[#7B9FF9] rounded-full shadow-lg flex items-center justify-center z-50"
        style={{ top: '75%' }}
      >
        <Plus className="w-6 h-6 text-white" />
      </motion.button>

      {/* Enhanced Log Event Modal */}
      <AnimatePresence>
        {showLogModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowLogModal(false);
                setEditingEvent(null);
              }}
              className="absolute inset-0 bg-black/40 z-50"
            />

            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] z-50 max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 pb-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-gray-900" style={{ fontSize: '22px', fontWeight: 700 }}>
                      {editingEvent ? 'Edit Event' : 'Log Event'}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                      {logStep === 1 && 'What did you do?'}
                      {logStep === 2 && 'Tell us more'}
                      {logStep === 3 && 'Review & save'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowLogModal(false);
                      setEditingEvent(null);
                    }}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Progress indicator */}
                <div className="flex items-center gap-2 mb-8">
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        step <= logStep ? 'bg-[#5B7FF3]' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>

                {/* Step 1: Event Type */}
                {logStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <label className="text-sm text-gray-700 mb-3 block" style={{ fontWeight: 600 }}>
                      What type of event?
                    </label>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {[
                        { type: 'meal' as const, icon: Utensils, label: 'Meal', color: '#FF6B9D', desc: 'Food & drinks' },
                        { type: 'activity' as const, icon: Dumbbell, label: 'Activity', color: '#00D492', desc: 'Exercise & movement' },
                        { type: 'stress' as const, icon: Brain, label: 'Stress', color: '#F59E0B', desc: 'Mental state' },
                        { type: 'sleep' as const, icon: Moon, label: 'Sleep', color: '#8B5CF6', desc: 'Rest & recovery' },
                      ].map((item) => {
                        const ItemIcon = item.icon;
                        const isSelected = selectedEventType === item.type;
                        return (
                          <motion.button
                            key={item.type}
                            onClick={() => {
                              setSelectedEventType(item.type);
                              if (item.type === 'meal') {
                                setSelectedMealType(getCurrentTimeSlot() as any);
                              }
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`p-4 rounded-2xl border-2 transition-all text-left ${
                              isSelected
                                ? 'border-[#5B7FF3] shadow-md'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                            style={{
                              backgroundColor: isSelected ? `${item.color}08` : 'white'
                            }}
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{ backgroundColor: `${item.color}20` }}
                              >
                                <ItemIcon className="w-5 h-5" style={{ color: item.color }} />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm" style={{ fontWeight: 600, color: isSelected ? item.color : '#111827' }}>
                                  {item.label}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {item.desc}
                                </p>
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>

                    {selectedEventType === 'meal' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6"
                      >
                        <label className="text-sm text-gray-700 mb-3 block" style={{ fontWeight: 600 }}>
                          Which meal?
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { value: 'breakfast', icon: Coffee, label: 'Breakfast' },
                            { value: 'lunch', icon: Utensils, label: 'Lunch' },
                            { value: 'dinner', icon: Utensils, label: 'Dinner' },
                            { value: 'snack', icon: Apple, label: 'Snack' },
                          ].map((meal) => {
                            const MealIcon = meal.icon;
                            const isSelected = selectedMealType === meal.value;
                            return (
                              <button
                                key={meal.value}
                                onClick={() => setSelectedMealType(meal.value as any)}
                                className={`px-3 py-2.5 rounded-xl text-xs transition-all flex flex-col items-center gap-1 ${
                                  isSelected
                                    ? 'bg-[#5B7FF3] text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                                style={{ fontWeight: 600 }}
                              >
                                <MealIcon className="w-4 h-4" />
                                {meal.label}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}

                    <button
                      onClick={() => setLogStep(2)}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#5B7FF3] to-[#7B9FF9] text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                      style={{ fontWeight: 600, fontSize: '16px' }}
                    >
                      Continue
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </motion.div>
                )}

                {/* Step 2: Description & Details */}
                {logStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    {/* Quick suggestions */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <label className="text-sm text-gray-700" style={{ fontWeight: 600 }}>
                          Quick add
                        </label>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {quickSuggestions[selectedEventType].slice(0, 6).map((suggestion) => (
                          <button
                            key={suggestion}
                            onClick={() => setEventDescription(suggestion)}
                            className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                              eventDescription === suggestion
                                ? 'bg-[#5B7FF3] text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            style={{ fontWeight: 500 }}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Voice or Text input toggle */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
                        <button
                          onClick={() => setInputMode('voice')}
                          className={`flex-1 py-2 rounded-lg text-sm transition-all ${
                            inputMode === 'voice'
                              ? 'bg-white text-gray-900 shadow-sm'
                              : 'text-gray-500'
                          }`}
                          style={{ fontWeight: 600 }}
                        >
                          <Mic className="w-4 h-4 inline mr-1.5" />
                          Voice
                        </button>
                        <button
                          onClick={() => setInputMode('text')}
                          className={`flex-1 py-2 rounded-lg text-sm transition-all ${
                            inputMode === 'text'
                              ? 'bg-white text-gray-900 shadow-sm'
                              : 'text-gray-500'
                          }`}
                          style={{ fontWeight: 600 }}
                        >
                          <MessageSquare className="w-4 h-4 inline mr-1.5" />
                          Text
                        </button>
                      </div>
                    </div>

                    {/* Voice recording */}
                    {inputMode === 'voice' && (
                      <div className="mb-6">
                        {!isRecording && !eventDescription && (
                          <button
                            onClick={startRecording}
                            className="w-full py-20 rounded-2xl bg-gradient-to-br from-[#5B7FF3] to-[#7B9FF9] flex flex-col items-center justify-center gap-4 hover:opacity-90 transition-opacity"
                          >
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center"
                            >
                              <Mic className="w-8 h-8 text-white" />
                            </motion.div>
                            <p className="text-white text-lg" style={{ fontWeight: 600 }}>
                              Tap to record
                            </p>
                            <p className="text-white/80 text-sm">
                              Speak naturally about your {selectedEventType}
                            </p>
                          </button>
                        )}

                        {isRecording && (
                          <div className="w-full py-20 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex flex-col items-center justify-center gap-4">
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ repeat: Infinity, duration: 1.5 }}
                              className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center"
                            >
                              <Mic className="w-8 h-8 text-white" />
                            </motion.div>
                            <p className="text-white text-lg" style={{ fontWeight: 600 }}>
                              Listening... {formatTime(recordingTimer)}
                            </p>
                            <button
                              onClick={stopRecording}
                              className="mt-2 px-6 py-2.5 bg-white text-red-600 rounded-full"
                              style={{ fontWeight: 600 }}
                            >
                              Stop Recording
                            </button>
                          </div>
                        )}

                        {eventDescription && inputMode === 'voice' && (
                          <div className="p-4 rounded-2xl bg-blue-50 border-2 border-blue-200">
                            <div className="flex items-start gap-2 mb-2">
                              <Check className="w-5 h-5 text-green-600 mt-0.5" />
                              <p className="text-sm text-gray-700 leading-relaxed flex-1">
                                {eventDescription}
                              </p>
                            </div>
                            <button
                              onClick={() => setEventDescription('')}
                              className="text-xs text-[#5B7FF3] hover:underline"
                              style={{ fontWeight: 600 }}
                            >
                              Record again
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Text input */}
                    {inputMode === 'text' && (
                      <div className="mb-6">
                        <label className="text-sm text-gray-700 mb-2 block" style={{ fontWeight: 600 }}>
                          Description
                        </label>
                        <textarea
                          value={eventDescription}
                          onChange={(e) => setEventDescription(e.target.value)}
                          placeholder={`What did you ${selectedEventType === 'meal' ? 'eat' : 'do'}?`}
                          rows={4}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#5B7FF3] focus:outline-none resize-none text-sm"
                        />
                      </div>
                    )}

                    {/* Additional fields for stress/sleep */}
                    {(selectedEventType === 'stress' || selectedEventType === 'sleep') && (
                      <div className="mb-6">
                        <label className="text-sm text-gray-700 mb-3 block" style={{ fontWeight: 600 }}>
                          {selectedEventType === 'stress' ? 'Stress Level' : 'Sleep Quality'}
                        </label>
                        <div className="flex gap-2">
                          {selectedEventType === 'stress' 
                            ? ['Low', 'Medium', 'High'].map((level) => (
                                <button
                                  key={level}
                                  onClick={() => setEventStatus(level)}
                                  className={`flex-1 py-3 rounded-xl text-sm transition-all ${
                                    eventStatus === level
                                      ? 'bg-[#5B7FF3] text-white shadow-md'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                  style={{ fontWeight: 600 }}
                                >
                                  {level}
                                </button>
                              ))
                            : ['Poor', 'Fair', 'Good', 'Excellent'].map((quality) => (
                                <button
                                  key={quality}
                                  onClick={() => setEventStatus(quality)}
                                  className={`flex-1 py-3 rounded-xl text-xs transition-all ${
                                    eventStatus === quality
                                      ? 'bg-[#5B7FF3] text-white shadow-md'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                  style={{ fontWeight: 600 }}
                                >
                                  {quality}
                                </button>
                              ))
                          }
                        </div>
                      </div>
                    )}

                    {/* Time picker */}
                    <div className="mb-6">
                      <label className="text-sm text-gray-700 mb-2 block" style={{ fontWeight: 600 }}>
                        <Clock className="w-4 h-4 inline mr-1" />
                        Time
                      </label>
                      <input
                        type="time"
                        value={eventTime}
                        onChange={(e) => setEventTime(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#5B7FF3] focus:outline-none"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setLogStep(1)}
                        className="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                        style={{ fontWeight: 600, fontSize: '16px' }}
                      >
                        Back
                      </button>
                      <button
                        onClick={handleSaveEvent}
                        disabled={!eventDescription.trim()}
                        className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all ${
                          eventDescription.trim()
                            ? 'bg-gradient-to-r from-[#5B7FF3] to-[#7B9FF9] text-white hover:opacity-90'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                        style={{ fontWeight: 600, fontSize: '16px' }}
                      >
                        <Send className="w-5 h-5" />
                        {editingEvent ? 'Update Event' : 'Save Event'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
