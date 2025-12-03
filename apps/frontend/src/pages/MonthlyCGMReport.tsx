import { useState } from "react";
import { ArrowLeft, TrendingDown, TrendingUp, Moon, Utensils, Heart, Dumbbell, Sparkles, Target, Activity, CheckCircle2, BarChart3, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Cell, LabelList } from "recharts";

type ReportTab = 'overview' | 'patterns' | 'insights';

// Mock data for November 2025 CGM Report
const reportData = {
  month: "November 2025",
  dateRange: "Nov 1 - Nov 30, 2025",

  // Overall metrics
  overallMetrics: {
    avgTIR: 78,
    avgGlucose: 112,
    glucoseVariability: 28, // CV%
    totalReadings: 8640,
    activeHours: 720, // 30 days
  },

  // Weekly TIR breakdown
  weeklyTIR: [
    { week: "Week 1", tir: 72, avgGlucose: 118, change: null, hypoglycemia: 5, hyperglycemia: 23 },
    { week: "Week 2", tir: 76, avgGlucose: 114, change: 4, hypoglycemia: 4, hyperglycemia: 20 },
    { week: "Week 3", tir: 81, avgGlucose: 108, change: 5, hypoglycemia: 3, hyperglycemia: 16 },
    { week: "Week 4", tir: 83, avgGlucose: 106, change: 2, hypoglycemia: 2, hyperglycemia: 15 },
  ],

  // Time in ranges
  timeInRanges: {
    veryLow: 2, // <54 mg/dL
    low: 4, // 54-69 mg/dL
    target: 78, // 70-180 mg/dL
    high: 12, // 181-250 mg/dL
    veryHigh: 4, // >250 mg/dL
  },

  // Daily patterns
  dailyPatterns: [
    { hour: "12AM", avgGlucose: 102, readings: 124 },
    { hour: "3AM", avgGlucose: 98, readings: 124 },
    { hour: "6AM", avgGlucose: 115, readings: 124 },
    { hour: "9AM", avgGlucose: 128, readings: 124 },
    { hour: "12PM", avgGlucose: 135, readings: 124 },
    { hour: "3PM", avgGlucose: 118, readings: 124 },
    { hour: "6PM", avgGlucose: 142, readings: 124 },
    { hour: "9PM", avgGlucose: 108, readings: 124 },
  ],

  // CGM patterns identified
  patterns: {
    morningSpikes: {
      frequency: "18 out of 30 days",
      avgIncrease: "+35 mg/dL",
      timeWindow: "6:00 AM - 8:00 AM",
      severity: "moderate",
    },
    postMealSpikes: {
      breakfast: { avg: "+48 mg/dL", peak: "30-45 min" },
      lunch: { avg: "+52 mg/dL", peak: "45-60 min" },
      dinner: { avg: "+65 mg/dL", peak: "60-75 min" },
    },
    overnightStability: {
      rating: "excellent",
      avgVariation: "±12 mg/dL",
      hypoglycemiaEvents: 2,
    },
    afternoonDips: {
      frequency: "12 out of 30 days",
      avgDrop: "-28 mg/dL",
      timeWindow: "3:00 PM - 4:00 PM",
    },
  },

  // Behavior correlations
  behaviors: {
    sleep: {
      avgHours: 7.2,
      qualityScore: 7.8,
      correlation: "Good sleep (>7h) linked to 15% better TIR next day",
      bestNights: "Nov 3, 8, 15, 22 - All had >80% TIR following day",
      worstNights: "Nov 5, 12, 19 - Poor sleep (<6h) led to higher morning glucose",
    },
    meals: {
      breakfastTiming: "7:30 AM avg",
      lunchTiming: "12:45 PM avg",
      dinnerTiming: "7:15 PM avg",
      keyFindings: [
        "Early breakfasts (before 8 AM) → 18% lower post-meal spikes",
        "Late dinners (after 8 PM) → worse overnight glucose control",
        "Meal spacing >4 hours → more stable glucose between meals",
      ],
    },
    exercise: {
      weeklyFrequency: 4.2,
      avgDuration: "35 minutes",
      impact: "Exercise days showed 12% higher TIR",
      bestTime: "Morning exercise (7-9 AM) most effective",
      postExerciseWindow: "Improved glucose control for 4-6 hours after",
    },
    stress: {
      highStressDays: 8,
      avgGlucoseIncrease: "+18 mg/dL on high stress days",
      pattern: "Stress-related spikes typically in afternoon (2-5 PM)",
    },
  },

  // AI Recommendations
  recommendations: [
    {
      category: "Morning Routine",
      priority: "high",
      insight: "Dawn phenomenon detected on 60% of days",
      action: "Try light exercise (10-min walk) within 30 minutes of waking",
      expectedImpact: "Could reduce morning spike by 15-20 mg/dL",
    },
    {
      category: "Meal Timing",
      priority: "high",
      insight: "Dinner spikes are your largest post-meal excursions (+65 mg/dL avg)",
      action: "Eat dinner before 7 PM and consider a 15-min post-dinner walk",
      expectedImpact: "May reduce dinner spike by 20-25 mg/dL",
    },
    {
      category: "Sleep Optimization",
      priority: "medium",
      insight: "Short sleep (<6.5h) correlates with 15% worse TIR next day",
      action: "Aim for 7-8 hours. Your best TIR days followed good sleep nights",
      expectedImpact: "Could improve overall TIR by 5-8%",
    },
    {
      category: "Exercise Strategy",
      priority: "medium",
      insight: "Morning exercise shows strongest glucose-lowering effect",
      action: "Schedule 3-4 morning workouts per week (even 20 minutes helps)",
      expectedImpact: "Potential TIR improvement of 8-12%",
    },
    {
      category: "Afternoon Management",
      priority: "low",
      insight: "Glucose dips around 3-4 PM on 40% of days",
      action: "Small protein-rich snack at 2:30 PM may prevent afternoon drops",
      expectedImpact: "Reduce low glucose events by 30-40%",
    },
    {
      category: "Stress Management",
      priority: "medium",
      insight: "High stress days show +18 mg/dL average glucose",
      action: "Try 5-min breathing exercises during stressful periods",
      expectedImpact: "May reduce stress-related glucose elevation by 10-15 mg/dL",
    },
  ],

  // Progress highlights
  highlights: [
    "TIR improved from 72% to 83% over the month - excellent progress! 📈",
    "Overnight glucose control is excellent (±12 mg/dL variation)",
    "You've reduced hypoglycemia events by 40% vs last month",
    "Exercise consistency increased - from 2.8 to 4.2 days/week",
  ],

  // Areas for improvement
  improvements: [
    "Morning spikes remain the biggest opportunity for optimization",
    "Dinner timing and composition could be adjusted for better evening control",
    "Consider more consistent meal timing on weekends",
  ],
};

const MonthlyCGMReport = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ReportTab>('overview');

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-3"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Monthly CGM Report</h1>
            <p className="text-sm text-slate-500 mt-1">{reportData.dateRange}</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-4 pb-3">
          <div className="bg-gray-100 p-1 rounded-xl flex gap-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-2.5 rounded-lg text-sm transition-all ${
                activeTab === 'overview'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500'
              }`}
              style={{ fontWeight: 600 }}
            >
              <Target className="w-4 h-4 inline mr-1.5" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('patterns')}
              className={`flex-1 py-2.5 rounded-lg text-sm transition-all ${
                activeTab === 'patterns'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500'
              }`}
              style={{ fontWeight: 600 }}
            >
              <BarChart3 className="w-4 h-4 inline mr-1.5" />
              Patterns
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`flex-1 py-2.5 rounded-lg text-sm transition-all ${
                activeTab === 'insights'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500'
              }`}
              style={{ fontWeight: 600 }}
            >
              <Lightbulb className="w-4 h-4 inline mr-1.5" />
              Insights
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <>
        {/* Overall Summary Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-[#5B7FF3] to-[#7B9FF9] rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Overall Performance</h2>
              <p className="text-xs text-gray-500">30-day summary</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="text-3xl font-bold text-[#5B7FF3]">{reportData.overallMetrics.avgTIR}%</div>
              <div className="text-xs text-[#5B7FF3] font-medium mt-1">Time in Range</div>
              <div className="text-xs text-gray-500 mt-1">Target: 70-180 mg/dL</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="text-3xl font-bold text-[#5B7FF3]">{reportData.overallMetrics.avgGlucose}</div>
              <div className="text-xs text-[#5B7FF3] font-medium mt-1">Avg Glucose (mg/dL)</div>
              <div className="text-xs text-gray-500 mt-1">Target: 70-140 mg/dL</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="text-3xl font-bold text-[#5B7FF3]">{reportData.overallMetrics.glucoseVariability}%</div>
              <div className="text-xs text-[#5B7FF3] font-medium mt-1">Variability (CV)</div>
              <div className="text-xs text-gray-500 mt-1">Target: &lt;36%</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="text-3xl font-bold text-[#5B7FF3]">{reportData.overallMetrics.totalReadings.toLocaleString()}</div>
              <div className="text-xs text-[#5B7FF3] font-medium mt-1">Total Readings</div>
              <div className="text-xs text-gray-500 mt-1">Every 5 minutes</div>
            </div>
          </div>
        </div>

        {/* Progress Highlights */}
        <div className="bg-gradient-to-br from-[#5B7FF3] to-[#7B9FF9] rounded-2xl p-6 shadow-sm text-white">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6" />
            <h2 className="text-lg font-bold">Wins This Month 🎉</h2>
          </div>
          <div className="space-y-2">
            {reportData.highlights.map((highlight, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{highlight}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly TIR Trend */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-gray-900">Weekly Progress</h2>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-[#5B7FF3]"></div>
                <span className="text-gray-600">TIR %</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-0.5 bg-[#10B981]"></div>
                <span className="text-gray-600">Avg Glucose</span>
              </div>
            </div>
          </div>

          {/* Overall improvement */}
          <div className="flex items-center justify-center gap-2 mb-3 text-[#5B7FF3]">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">+11% improvement over the month</span>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={reportData.weeklyTIR} margin={{ top: 30, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5B7FF3" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#7B9FF9" stopOpacity={0.6}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 11 }}
                stroke="#94a3b8"
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                yAxisId="left"
                domain={[60, 90]}
                tick={{ fontSize: 11 }}
                stroke="#94a3b8"
                label={{ value: 'TIR percentage (%)', angle: -90, position: 'insideLeft', dx: 10, style: { fontSize: 12, fill: '#64748b' } }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[100, 120]}
                tick={{ fontSize: 11 }}
                stroke="#94a3b8"
                label={{ value: 'Avg Glucose (mg/dL)', angle: 90, position: 'insideRight', style: { fontSize: 12, fill: '#64748b' } }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
                        <p className="font-semibold text-gray-900 mb-2">{data.week}</p>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-gray-600">TIR:</span>
                            <span className="font-bold text-[#5B7FF3]">{data.tir}%</span>
                          </div>
                          {data.change !== null && (
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-gray-600">vs Last Week:</span>
                              <span className={`font-semibold flex items-center gap-1 ${data.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {data.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                {data.change >= 0 ? '+' : ''}{data.change}%
                              </span>
                            </div>
                          )}
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-gray-600">Avg Glucose:</span>
                            <span className="font-semibold text-[#10B981]">{data.avgGlucose} mg/dL</span>
                          </div>
                          <div className="border-t border-gray-200 my-1 pt-1">
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-gray-600">Low Events:</span>
                              <span className="font-medium text-orange-600">{data.hypoglycemia}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-gray-600">High Events:</span>
                              <span className="font-medium text-amber-600">{data.hyperglycemia}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar yAxisId="left" dataKey="tir" fill="url(#barGradient)" radius={[8, 8, 0, 0]} barSize={40}>
                {reportData.weeklyTIR.map((_, index) => (
                  <Cell key={`cell-${index}`} />
                ))}
                <LabelList
                  dataKey="change"
                  position="top"
                  content={(props: any) => {
                    const { x, y, width, value } = props;
                    if (value === null) return null;
                    const color = value >= 0 ? '#5B7FF3' : '#EF4444';
                    const arrow = value >= 0 ? '↑' : '↓';
                    return (
                      <text
                        x={x + width / 2}
                        y={y - 5}
                        fill={color}
                        fontSize="12"
                        fontWeight="700"
                        textAnchor="middle"
                      >
                        {arrow} {value >= 0 ? '+' : ''}{value}%
                      </text>
                    );
                  }}
                />
              </Bar>
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="avgGlucose"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: '#10B981', r: 5, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 7 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Time in Ranges Breakdown */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Glucose Distribution</h2>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-600">Very Low (&lt;54)</span>
                <span className="text-xs font-bold text-blue-900">{reportData.timeInRanges.veryLow}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-900" style={{ width: `${reportData.timeInRanges.veryLow}%` }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-600">Low (54-69)</span>
                <span className="text-xs font-bold text-blue-600">{reportData.timeInRanges.low}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600" style={{ width: `${reportData.timeInRanges.low}%` }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-600">In Range (70-180) ⭐</span>
                <span className="text-xs font-bold text-blue-200">{reportData.timeInRanges.target}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-200" style={{ width: `${reportData.timeInRanges.target}%` }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-600">High (181-250)</span>
                <span className="text-xs font-bold text-blue-600">{reportData.timeInRanges.high}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600" style={{ width: `${reportData.timeInRanges.high}%` }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-600">Very High (&gt;250)</span>
                <span className="text-xs font-bold text-blue-900">{reportData.timeInRanges.veryHigh}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-900" style={{ width: `${reportData.timeInRanges.veryHigh}%` }} />
              </div>
            </div>
          </div>
        </div>
        </>
        )}

        {/* PATTERNS TAB */}
        {activeTab === 'patterns' && (
          <>
        {/* CGM Patterns */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-[#5B7FF3]" />
            <h2 className="text-lg font-bold text-gray-900">CGM Patterns Identified</h2>
          </div>

          <div className="space-y-4">
            {/* Morning Spikes */}
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-amber-900">Morning Spikes (Dawn Phenomenon)</h3>
                <span className="text-xs font-medium px-2 py-1 bg-amber-200 text-amber-900 rounded-full">
                  {reportData.patterns.morningSpikes.severity}
                </span>
              </div>
              <p className="text-sm text-amber-800 mb-2">
                {reportData.patterns.morningSpikes.frequency} - Average increase of {reportData.patterns.morningSpikes.avgIncrease}
              </p>
              <p className="text-xs text-amber-700">
                <strong>Time window:</strong> {reportData.patterns.morningSpikes.timeWindow}
              </p>
            </div>

            {/* Post-Meal Spikes */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <h3 className="font-bold text-[#5B7FF3] mb-3">Post-Meal Glucose Response</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">🌅 Breakfast</span>
                  <span className="text-sm font-bold text-[#5B7FF3]">
                    {reportData.patterns.postMealSpikes.breakfast.avg} (peak: {reportData.patterns.postMealSpikes.breakfast.peak})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">☀️ Lunch</span>
                  <span className="text-sm font-bold text-[#5B7FF3]">
                    {reportData.patterns.postMealSpikes.lunch.avg} (peak: {reportData.patterns.postMealSpikes.lunch.peak})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">🌙 Dinner</span>
                  <span className="text-sm font-bold text-red-600">
                    {reportData.patterns.postMealSpikes.dinner.avg} (peak: {reportData.patterns.postMealSpikes.dinner.peak})
                  </span>
                </div>
              </div>
            </div>

            {/* Overnight Stability */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-[#5B7FF3]">Overnight Glucose Control</h3>
                <span className="text-xs font-medium px-2 py-1 bg-blue-200 text-[#5B7FF3] rounded-full">
                  {reportData.patterns.overnightStability.rating}
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                Average variation: {reportData.patterns.overnightStability.avgVariation}
              </p>
              <p className="text-xs text-gray-600">
                Only {reportData.patterns.overnightStability.hypoglycemiaEvents} nighttime low glucose events this month
              </p>
            </div>

            {/* Afternoon Dips */}
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
              <h3 className="font-bold text-orange-900 mb-2">Afternoon Glucose Dips</h3>
              <p className="text-sm text-orange-800 mb-2">
                {reportData.patterns.afternoonDips.frequency} - Average drop of {reportData.patterns.afternoonDips.avgDrop}
              </p>
              <p className="text-xs text-orange-700">
                <strong>Time window:</strong> {reportData.patterns.afternoonDips.timeWindow}
              </p>
            </div>
          </div>
        </div>

        {/* Average Glucose Pattern */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Average Glucose Pattern</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={reportData.dailyPatterns}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="hour" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis domain={[80, 160]} tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Line type="monotone" dataKey="avgGlucose" stroke="#5B7FF3" strokeWidth={3} dot={{ fill: '#5B7FF3', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 text-center mt-3">
            Highest glucose: 6-9 PM (dinner) • Lowest: 3-6 AM (overnight)
          </p>
        </div>
        </>
        )}

        {/* INSIGHTS TAB */}
        {activeTab === 'insights' && (
          <>
        {/* Integrated Behavior Analysis & Recommendations */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#5B7FF3] to-[#7B9FF9] rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Personalized Insights & Actions</h2>
              <p className="text-xs text-gray-500">Based on your behavior patterns and glucose data</p>
            </div>
          </div>

          {/* Sleep Insight */}
          {reportData.recommendations.filter(r => r.category === 'Morning Spikes').map((rec, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Moon className="w-4 h-4 text-[#5B7FF3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{rec.category}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      rec.priority === 'high' ? 'bg-red-100 text-red-700' : rec.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-[#5B7FF3]'
                    }`}>
                      {rec.priority.toUpperCase()} PRIORITY
                    </span>
                  </div>
                </div>
              </div>

              {/* Behavior Correlation */}
              <div className="bg-blue-50 rounded-xl p-3 mb-3">
                <p className="text-xs font-semibold text-[#5B7FF3] uppercase tracking-wide mb-1">What We Found</p>
                <p className="text-sm text-gray-900 mb-2">{reportData.behaviors.sleep.correlation}</p>
                <p className="text-xs text-gray-700"><strong>Best nights:</strong> {reportData.behaviors.sleep.bestNights}</p>
                <p className="text-xs text-gray-500 mt-1">Avg: {reportData.behaviors.sleep.avgHours} hours/night</p>
              </div>

              {/* AI Insight */}
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Why It Matters</p>
                <p className="text-sm text-gray-700">{rec.insight}</p>
              </div>

              {/* Recommendation */}
              <div className="bg-gradient-to-r from-[#5B7FF3] to-[#7B9FF9] rounded-xl p-3 text-white mb-2">
                <p className="text-xs font-semibold uppercase tracking-wide mb-1 opacity-90">Recommended Action</p>
                <p className="text-sm font-bold">{rec.action}</p>
              </div>

              {/* Expected Impact */}
              <div className="flex items-center gap-2 text-[#5B7FF3]">
                <CheckCircle2 className="w-4 h-4" />
                <p className="text-xs font-medium">{rec.expectedImpact}</p>
              </div>
            </div>
          ))}

          {/* Meal Timing Insight */}
          {reportData.recommendations.filter(r => r.category === 'Meal Timing').map((rec, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Utensils className="w-4 h-4 text-[#5B7FF3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{rec.category}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      rec.priority === 'high' ? 'bg-red-100 text-red-700' : rec.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-[#5B7FF3]'
                    }`}>
                      {rec.priority.toUpperCase()} PRIORITY
                    </span>
                  </div>
                </div>
              </div>

              {/* Behavior Correlation */}
              <div className="bg-blue-50 rounded-xl p-3 mb-3">
                <p className="text-xs font-semibold text-[#5B7FF3] uppercase tracking-wide mb-1">What We Found</p>
                <div className="space-y-1">
                  {reportData.behaviors.meals.keyFindings.map((finding, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-[#5B7FF3] text-xs mt-0.5">✓</span>
                      <p className="text-xs text-gray-900">{finding}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Insight */}
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Why It Matters</p>
                <p className="text-sm text-gray-700">{rec.insight}</p>
              </div>

              {/* Recommendation */}
              <div className="bg-gradient-to-r from-[#5B7FF3] to-[#7B9FF9] rounded-xl p-3 text-white mb-2">
                <p className="text-xs font-semibold uppercase tracking-wide mb-1 opacity-90">Recommended Action</p>
                <p className="text-sm font-bold">{rec.action}</p>
              </div>

              {/* Expected Impact */}
              <div className="flex items-center gap-2 text-[#5B7FF3]">
                <CheckCircle2 className="w-4 h-4" />
                <p className="text-xs font-medium">{rec.expectedImpact}</p>
              </div>
            </div>
          ))}

          {/* Exercise Insight */}
          {reportData.recommendations.filter(r => r.category === 'Exercise Timing').map((rec, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Dumbbell className="w-4 h-4 text-[#5B7FF3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{rec.category}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      rec.priority === 'high' ? 'bg-red-100 text-red-700' : rec.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-[#5B7FF3]'
                    }`}>
                      {rec.priority.toUpperCase()} PRIORITY
                    </span>
                  </div>
                </div>
              </div>

              {/* Behavior Correlation */}
              <div className="bg-blue-50 rounded-xl p-3 mb-3">
                <p className="text-xs font-semibold text-[#5B7FF3] uppercase tracking-wide mb-1">What We Found</p>
                <p className="text-sm text-gray-900 mb-2">{reportData.behaviors.exercise.impact}</p>
                <p className="text-xs text-gray-700 mb-1"><strong>Best time:</strong> {reportData.behaviors.exercise.bestTime}</p>
                <p className="text-xs text-gray-700"><strong>Effect duration:</strong> {reportData.behaviors.exercise.postExerciseWindow}</p>
                <p className="text-xs text-gray-500 mt-1">{reportData.behaviors.exercise.weeklyFrequency} days/week • {reportData.behaviors.exercise.avgDuration} avg</p>
              </div>

              {/* AI Insight */}
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Why It Matters</p>
                <p className="text-sm text-gray-700">{rec.insight}</p>
              </div>

              {/* Recommendation */}
              <div className="bg-gradient-to-r from-[#5B7FF3] to-[#7B9FF9] rounded-xl p-3 text-white mb-2">
                <p className="text-xs font-semibold uppercase tracking-wide mb-1 opacity-90">Recommended Action</p>
                <p className="text-sm font-bold">{rec.action}</p>
              </div>

              {/* Expected Impact */}
              <div className="flex items-center gap-2 text-[#5B7FF3]">
                <CheckCircle2 className="w-4 h-4" />
                <p className="text-xs font-medium">{rec.expectedImpact}</p>
              </div>
            </div>
          ))}

          {/* Additional Recommendations */}
          {reportData.recommendations.filter(r => !['Morning Spikes', 'Meal Timing', 'Exercise Timing'].includes(r.category)).map((rec, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{rec.category}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      rec.priority === 'high' ? 'bg-red-100 text-red-700' : rec.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-[#5B7FF3]'
                    }`}>
                      {rec.priority.toUpperCase()} PRIORITY
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Insight */}
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Why It Matters</p>
                <p className="text-sm text-gray-700">{rec.insight}</p>
              </div>

              {/* Recommendation */}
              <div className="bg-gradient-to-r from-[#5B7FF3] to-[#7B9FF9] rounded-xl p-3 text-white mb-2">
                <p className="text-xs font-semibold uppercase tracking-wide mb-1 opacity-90">Recommended Action</p>
                <p className="text-sm font-bold">{rec.action}</p>
              </div>

              {/* Expected Impact */}
              <div className="flex items-center gap-2 text-[#5B7FF3]">
                <CheckCircle2 className="w-4 h-4" />
                <p className="text-xs font-medium">{rec.expectedImpact}</p>
              </div>
            </div>
          ))}

          {/* Stress Correlation Note */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-5 shadow-sm border border-red-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <Heart className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Stress Impact Detected</h3>
                <p className="text-xs text-gray-500">{reportData.behaviors.stress.highStressDays} high-stress days identified</p>
              </div>
            </div>
            <div className="bg-white/60 rounded-xl p-3">
              <p className="text-sm text-red-900 font-medium mb-1">
                {reportData.behaviors.stress.avgGlucoseIncrease} average increase on high stress days
              </p>
              <p className="text-xs text-red-700">{reportData.behaviors.stress.pattern}</p>
            </div>
          </div>
        </div>
        </>
        )}

        {/* Footer CTA - Shows on all tabs */}
        <div className="bg-gradient-to-br from-[#5B7FF3] to-[#7B9FF9] rounded-2xl p-6 text-white text-center">
          <h3 className="text-xl font-bold mb-2">Ready to Improve?</h3>
          <p className="text-sm opacity-90 mb-4">
            Chat with Olivia to create a personalized action plan based on these insights
          </p>
          <button
            onClick={() => navigate('/coach')}
            className="bg-white text-[#5B7FF3] font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition"
          >
            Talk to Olivia
          </button>
        </div>
      </div>
    </div>
  );
};

export default MonthlyCGMReport;
