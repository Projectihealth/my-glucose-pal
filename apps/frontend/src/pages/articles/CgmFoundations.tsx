import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Activity, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Zap, Clock, Target, BarChart3, LineChart, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

const CgmFoundations = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header with Back Button */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="px-6 pt-6 pb-4">
          <Button variant="ghost" asChild className="px-0 mb-4">
            <Link to="/community" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4" />
              Back to Community
            </Link>
          </Button>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#5B7FF3] mb-2">CGM FOUNDATIONS</p>
          <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-3">
            Understanding Your Continuous Glucose Monitor
          </h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            Learn how sensors track glucose, what key metrics mean, and how to respond in real time to optimize your metabolic health.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8 space-y-8 max-w-2xl mx-auto pb-32">

        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-[#5B7FF3] to-[#7B9FF9] rounded-3xl p-6 text-white">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Your 24/7 Glucose Guardian</h2>
              <p className="text-white/90 text-sm leading-relaxed">
                A CGM sensor gives you continuous insight into your glucose levels, helping you understand how food, exercise, stress, and sleep affect your metabolic health in real time.
              </p>
            </div>
          </div>
        </div>

        {/* How CGM Works */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-6 h-6 text-[#5B7FF3]" />
            How Your Sensor Tracks Glucose
          </h2>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-2">The Technology</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                Your CGM sensor uses a tiny filament inserted just under your skin to measure glucose levels in your interstitial fluid (the fluid between your cells). This measurement happens automatically every few minutes, 24 hours a day.
              </p>
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-gray-700 leading-relaxed">
                  <strong className="text-[#5B7FF3]">Key Point:</strong> CGM readings typically lag blood glucose by 5-15 minutes because they measure interstitial fluid, not blood directly. This is completely normal and expected.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-2">Sensor Lifecycle</h3>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-[#5B7FF3]">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Warm-up Period</p>
                    <p className="text-xs text-gray-600">First 12-24 hours after insertion may show less accurate readings as the sensor stabilizes.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-[#5B7FF3]">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Active Period</p>
                    <p className="text-xs text-gray-600">Days 2-10 (or 2-14 depending on sensor) provide the most reliable data.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-[#5B7FF3]">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Replacement</p>
                    <p className="text-xs text-gray-600">Most sensors need replacement every 10-14 days. Set a reminder!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Metrics */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#5B7FF3]" />
            Essential CGM Metrics
          </h2>

          <div className="space-y-4">
            {/* Time in Range */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">Time in Range (TIR)</h3>
                  <p className="text-xs text-gray-500 mb-2">Most important metric for overall glucose control</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 mb-3">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>What it measures:</strong> Percentage of time your glucose stays between 70-180 mg/dL
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Target:</strong> Aim for 70% or higher
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">70%+ = Excellent</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">50-70% = Good progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">&lt;50% = Needs improvement</span>
                </div>
              </div>
            </div>

            {/* GMI */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <LineChart className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">Glucose Management Indicator (GMI)</h3>
                  <p className="text-xs text-gray-500 mb-2">Estimates what your A1C would be based on CGM data</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>What it measures:</strong> Your average glucose level converted to an estimated A1C
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Target:</strong> Below 7.0% for most people (consult your doctor for personalized goals)
                </p>
              </div>
            </div>

            {/* Glucose Variability */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Activity className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">Glucose Variability (CV)</h3>
                  <p className="text-xs text-gray-500 mb-2">Measures how much your glucose fluctuates</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 mb-3">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>What it measures:</strong> The consistency of your glucose levels throughout the day
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Target:</strong> Below 36% = stable; Above 36% = more variability
                </p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="text-xs text-gray-700">
                  <strong className="text-[#5B7FF3]">Why it matters:</strong> Lower variability means fewer glucose swings, which is associated with better health outcomes and more energy throughout the day.
                </p>
              </div>
            </div>

            {/* Time Below/Above Range */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-3">Time Below & Above Range</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <TrendingDown className="w-5 h-5 text-red-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm mb-1">Time Below Range (TBR)</p>
                    <p className="text-xs text-gray-600 mb-2">Below 70 mg/dL (hypoglycemia)</p>
                    <p className="text-xs text-gray-700">
                      <strong>Target:</strong> Less than 4% of the time. Even brief lows can be dangerous.
                    </p>
                  </div>
                </div>
                <div className="w-full h-px bg-gray-200"></div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm mb-1">Time Above Range (TAR)</p>
                    <p className="text-xs text-gray-600 mb-2">Above 180 mg/dL (hyperglycemia)</p>
                    <p className="text-xs text-gray-700">
                      <strong>Target:</strong> Less than 25% of the time. Sustained highs can lead to complications.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Real-Time Response */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#5B7FF3]" />
            How to Respond in Real Time
          </h2>

          <div className="space-y-4">
            {/* Reading the Trend Arrow */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3">Understanding Trend Arrows</h3>
              <p className="text-sm text-gray-600 mb-4">
                Your CGM shows not just your current glucose level, but also the direction and speed it's moving. This helps you take action before problems occur.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <span className="text-2xl">↑↑</span>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900">Rising Fast</p>
                    <p className="text-xs text-gray-600">Increasing &gt;2 mg/dL per minute</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <span className="text-2xl">↑</span>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900">Rising</p>
                    <p className="text-xs text-gray-600">Increasing 1-2 mg/dL per minute</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <span className="text-2xl">→</span>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900">Stable</p>
                    <p className="text-xs text-gray-600">Changing &lt;1 mg/dL per minute</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <span className="text-2xl">↓</span>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900">Falling</p>
                    <p className="text-xs text-gray-600">Decreasing 1-2 mg/dL per minute</p>
                  </div>
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                </div>
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <span className="text-2xl">↓↓</span>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900">Falling Fast</p>
                    <p className="text-xs text-gray-600">Decreasing &gt;2 mg/dL per minute</p>
                  </div>
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
              </div>
            </div>

            {/* Action Guide */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Action Guide</h3>

              <div className="space-y-4">
                {/* High Glucose */}
                <div className="border-l-4 border-orange-500 bg-orange-50 rounded-r-xl p-4">
                  <p className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-orange-600" />
                    When glucose is rising or high (&gt;180 mg/dL)
                  </p>
                  <ul className="space-y-1 text-xs text-gray-700 ml-6">
                    <li>• Take a 10-15 minute walk to help bring it down</li>
                    <li>• Drink water to stay hydrated</li>
                    <li>• Avoid eating more carbs until it stabilizes</li>
                    <li>• Log what you ate to identify triggers</li>
                    <li>• If consistently high, consult your healthcare provider</li>
                  </ul>
                </div>

                {/* Low Glucose */}
                <div className="border-l-4 border-red-500 bg-red-50 rounded-r-xl p-4">
                  <p className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-red-600" />
                    When glucose is falling or low (&lt;70 mg/dL)
                  </p>
                  <ul className="space-y-1 text-xs text-gray-700 ml-6">
                    <li>• Eat 15g fast-acting carbs (juice, glucose tablets, honey)</li>
                    <li>• Wait 15 minutes and check again</li>
                    <li>• Repeat if still below 70 mg/dL</li>
                    <li>• Once stable, have a small protein/fat snack</li>
                    <li>• Note what caused the low (too much exercise, missed meal, etc.)</li>
                  </ul>
                </div>

                {/* In Range */}
                <div className="border-l-4 border-green-500 bg-green-50 rounded-r-xl p-4">
                  <p className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    When glucose is in range (70-180 mg/dL)
                  </p>
                  <ul className="space-y-1 text-xs text-gray-700 ml-6">
                    <li>• Great job! Take note of what you did right</li>
                    <li>• Log your meals to identify successful patterns</li>
                    <li>• This is the ideal time for exercise</li>
                    <li>• Use this as your baseline for comparison</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Overnight Management */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">Managing Overnight Glucose</h3>
                  <p className="text-xs text-gray-600">8 hours of data while you sleep</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div>
                  <p className="font-medium text-sm text-gray-900 mb-1">Set smart alerts</p>
                  <p className="text-xs text-gray-600">Enable low glucose alerts (70 mg/dL) but consider raising high alerts overnight to avoid sleep disruption (e.g., 250 mg/dL instead of 180 mg/dL).</p>
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900 mb-1">Review morning patterns</p>
                  <p className="text-xs text-gray-600">Check your overnight graph each morning. Consistent patterns mean you should adjust dinner timing, composition, or bedtime snacks.</p>
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900 mb-1">The "dawn phenomenon"</p>
                  <p className="text-xs text-gray-600">Many people see glucose rise 4-8am due to hormones. This is normal. If it's excessive, discuss with your doctor.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tips for Success */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Best Practices for CGM Success</h2>

          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-[#5B7FF3] rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-white">1</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm mb-1">Calibrate when stable</p>
                  <p className="text-xs text-gray-600">If your sensor requires calibration, do it when glucose is stable (→ arrow) for best accuracy.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 bg-[#5B7FF3] rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-white">2</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm mb-1">Log meals and activities</p>
                  <p className="text-xs text-gray-600">The more context you give Olivia, the better her insights. Log meals, exercise, stress, and sleep quality.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 bg-[#5B7FF3] rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-white">3</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm mb-1">Look for patterns, not perfection</p>
                  <p className="text-xs text-gray-600">One spike doesn't define your health. Focus on weekly trends and overall time in range.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 bg-[#5B7FF3] rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-white">4</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm mb-1">Rotate sensor sites</p>
                  <p className="text-xs text-gray-600">Change the placement location each time to avoid scar tissue buildup and maintain accuracy.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 bg-[#5B7FF3] rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-white">5</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm mb-1">Review weekly reports</p>
                  <p className="text-xs text-gray-600">Check your weekly summary every Sunday to celebrate wins and adjust strategies for the week ahead.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <div className="bg-gradient-to-br from-[#5B7FF3] to-[#7B9FF9] rounded-3xl p-6 text-white">
          <h3 className="text-xl font-bold mb-2">Ready to Master Your CGM?</h3>
          <p className="text-white/90 text-sm mb-4 leading-relaxed">
            Now that you understand the foundations, start logging your meals and activities. Olivia will help you connect the dots between your choices and your glucose patterns.
          </p>
          <button
            onClick={() => navigate('/overview')}
            className="w-full bg-white text-[#5B7FF3] py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            View My CGM Data
          </button>
        </div>

        {/* Additional Resources */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-3">Keep Learning</h3>
          <div className="space-y-2">
            <button
              onClick={() => navigate('/learn-more/user-guide')}
              className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <span className="text-sm font-medium text-gray-900">Complete User Guide</span>
              <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
            </button>
            <button
              onClick={() => navigate('/coach')}
              className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <span className="text-sm font-medium text-gray-900">Chat with Olivia</span>
              <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
            </button>
            <button
              onClick={() => navigate('/community')}
              className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <span className="text-sm font-medium text-gray-900">Join the Community</span>
              <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CgmFoundations;
