import { motion } from 'framer-motion';
import { ArrowLeft, Smartphone, LineChart, Target, MessageCircle, Users, BookOpen, Plus, TrendingUp, Activity, Bell, Settings, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function UserGuide() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header with Back Button */}
      <div className="bg-white sticky top-0 z-40 border-b border-gray-100">
        <div className="px-6 pt-6 pb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm" style={{ fontWeight: 600 }}>Back</span>
          </button>
          <h1 className="text-gray-900 mb-2" style={{ fontSize: '28px', fontWeight: 700 }}>
            Getting Started with My Glucose Pal
          </h1>
          <p className="text-gray-600 text-sm">
            Your complete guide to mastering CGM tracking and achieving your health goals
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8 space-y-8 pb-24">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#5B7FF3] to-[#7B9FF9] rounded-3xl p-6 text-white"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-white mb-2" style={{ fontSize: '20px', fontWeight: 700 }}>
                Welcome to Your Health Journey!
              </h2>
              <p className="text-white/90 text-sm leading-relaxed">
                My Glucose Pal helps you understand your body, track your progress, and make informed decisions about your health—all with the support of Olivia, your AI health coach.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Navigation Overview */}
        <section>
          <h2 className="text-gray-900 mb-4" style={{ fontSize: '22px', fontWeight: 700 }}>
            <BookOpen className="w-6 h-6 inline mr-2 text-[#5B7FF3]" />
            Navigating the App
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            My Glucose Pal is organized into 5 main tabs, each designed to help you on your health journey:
          </p>

          <div className="space-y-4">
            {/* My CGM Tab */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-5 border border-gray-100"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <LineChart className="w-6 h-6 text-[#5B7FF3]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-gray-900 mb-2" style={{ fontSize: '17px', fontWeight: 600 }}>
                    My CGM
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-3">
                    Your glucose tracking dashboard with real-time CGM data, daily patterns, and activity logs.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-[#5B7FF3] rounded-full mt-2" />
                      <p className="text-gray-600 text-sm flex-1">
                        <strong className="text-gray-900">Daily Graph:</strong> View your glucose levels throughout the day with meal and activity markers
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-[#5B7FF3] rounded-full mt-2" />
                      <p className="text-gray-600 text-sm flex-1">
                        <strong className="text-gray-900">Log Button (+):</strong> Quickly log meals, activities, and events
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-[#5B7FF3] rounded-full mt-2" />
                      <p className="text-gray-600 text-sm flex-1">
                        <strong className="text-gray-900">AI Patterns:</strong> Get personalized insights and suggested actions based on your data
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Olivia Tab */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-5 border border-gray-100"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-gray-900 mb-2" style={{ fontSize: '17px', fontWeight: 600 }}>
                    Olivia (AI Coach)
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-3">
                    Chat with Olivia, your personal AI health coach who understands your glucose data and provides personalized guidance.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2" />
                      <p className="text-gray-600 text-sm flex-1">
                        <strong className="text-gray-900">Text Chat:</strong> Ask questions about your glucose patterns anytime
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2" />
                      <p className="text-gray-600 text-sm flex-1">
                        <strong className="text-gray-900">Voice Chat:</strong> Have natural conversations with Olivia hands-free
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2" />
                      <p className="text-gray-600 text-sm flex-1">
                        <strong className="text-gray-900">Video Chat:</strong> See Olivia's avatar for a more personal coaching experience
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* My Goals Tab */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-5 border border-gray-100"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-gray-900 mb-2" style={{ fontSize: '17px', fontWeight: 600 }}>
                    My Goals
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-3">
                    Set and track health goals, build habits, and monitor your progress with AI-powered suggestions.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2" />
                      <p className="text-gray-600 text-sm flex-1">
                        <strong className="text-gray-900">Daily Habits:</strong> Create and track daily health habits
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2" />
                      <p className="text-gray-600 text-sm flex-1">
                        <strong className="text-gray-900">Weekly Stats:</strong> See your completion rates and streaks
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2" />
                      <p className="text-gray-600 text-sm flex-1">
                        <strong className="text-gray-900">AI Suggestions:</strong> Get goal recommendations from your CGM patterns
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Community Tab */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl p-5 border border-gray-100"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-gray-900 mb-2" style={{ fontSize: '17px', fontWeight: 600 }}>
                    Community
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-3">
                    Connect with others on their health journey, share wins, and access curated educational resources.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2" />
                      <p className="text-gray-600 text-sm flex-1">
                        <strong className="text-gray-900">Feed:</strong> Share your wins and learn from others' experiences
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2" />
                      <p className="text-gray-600 text-sm flex-1">
                        <strong className="text-gray-900">Resources:</strong> Articles, podcasts, and videos about CGM and health
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Key Features */}
        <section>
          <h2 className="text-gray-900 mb-4" style={{ fontSize: '22px', fontWeight: 700 }}>
            <Play className="w-6 h-6 inline mr-2 text-[#5B7FF3]" />
            Key Features
          </h2>

          <div className="space-y-6">
            {/* Logging Events */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Plus className="w-5 h-5 text-[#5B7FF3]" />
                </div>
                <h3 className="text-gray-900" style={{ fontSize: '18px', fontWeight: 600 }}>
                  Logging Meals & Activities
                </h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Tap the floating <strong>+ button</strong> on the My CGM page to log:
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-[#5B7FF3]">🍽️</span>
                  <span><strong>Meals:</strong> Breakfast, lunch, dinner, or snacks with descriptions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5B7FF3]">🏃</span>
                  <span><strong>Activities:</strong> Exercise, walks, or physical activities</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5B7FF3]">😌</span>
                  <span><strong>Stress Events:</strong> Track how stress affects your glucose</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5B7FF3]">😴</span>
                  <span><strong>Sleep:</strong> Log sleep quality and duration</span>
                </li>
              </ul>
              <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                <p className="text-sm text-gray-700 leading-relaxed">
                  <strong className="text-[#5B7FF3]">💡 Pro Tip:</strong> Log meals 30-60 minutes before they appear as glucose spikes on your chart for accurate tracking.
                </p>
              </div>
            </div>

            {/* AI Pattern Detection */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-gray-900" style={{ fontSize: '18px', fontWeight: 600 }}>
                  Understanding AI Patterns
                </h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                The app automatically detects patterns in your glucose data and provides actionable suggestions:
              </p>
              <div className="space-y-3">
                <div className="flex gap-3 p-3 bg-red-50 rounded-xl">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900" style={{ fontWeight: 600 }}>Spikes</p>
                    <p className="text-xs text-gray-600">Post-meal glucose increases—get tips to stabilize them</p>
                  </div>
                </div>
                <div className="flex gap-3 p-3 bg-yellow-50 rounded-xl">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Activity className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900" style={{ fontWeight: 600 }}>Variability</p>
                    <p className="text-xs text-gray-600">High glucose swings—learn to create more stability</p>
                  </div>
                </div>
                <div className="flex gap-3 p-3 bg-green-50 rounded-xl">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Activity className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900" style={{ fontWeight: 600 }}>Stable Ranges</p>
                    <p className="text-xs text-gray-600">When you're doing well—see what's working!</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-4 bg-purple-50 rounded-xl">
                <p className="text-sm text-gray-700 leading-relaxed">
                  <strong className="text-purple-600">💡 Pro Tip:</strong> Tap "Add to Goals" on pattern suggestions to turn insights into actionable habits.
                </p>
              </div>
            </div>

            {/* Working with Olivia */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#5B7FF3] to-[#7B9FF9] rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-gray-900" style={{ fontSize: '18px', fontWeight: 600 }}>
                  Working with Olivia
                </h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Olivia is your AI health coach who has access to your CGM data and can help you:
              </p>
              <ul className="space-y-2 text-sm text-gray-600 mb-4">
                <li className="flex items-start gap-2">
                  <span className="text-[#5B7FF3]">✓</span>
                  <span>Understand why your glucose spiked after a specific meal</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5B7FF3]">✓</span>
                  <span>Get personalized meal and exercise recommendations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5B7FF3]">✓</span>
                  <span>Learn about CGM basics and advanced optimization</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5B7FF3]">✓</span>
                  <span>Review your weekly progress and patterns</span>
                </li>
              </ul>
              <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                <p className="text-sm text-gray-700 leading-relaxed mb-2">
                  <strong className="text-[#5B7FF3]">Example Questions to Ask:</strong>
                </p>
                <ul className="space-y-1 text-xs text-gray-600">
                  <li>• "Why did my glucose spike this morning?"</li>
                  <li>• "What should I eat before my workout?"</li>
                  <li>• "How can I improve my overnight stability?"</li>
                  <li>• "What patterns do you see in my last week?"</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Tips for Success */}
        <section>
          <h2 className="text-gray-900 mb-4" style={{ fontSize: '22px', fontWeight: 700 }}>
            <Settings className="w-6 h-6 inline mr-2 text-[#5B7FF3]" />
            Tips for Success
          </h2>

          <div className="space-y-3">
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <h4 className="text-gray-900 mb-2" style={{ fontSize: '15px', fontWeight: 600 }}>
                1. Log Consistently
              </h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                The more you log meals and activities, the better AI insights you'll get. Make it a habit to log as you eat.
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <h4 className="text-gray-900 mb-2" style={{ fontSize: '15px', fontWeight: 600 }}>
                2. Review Daily Patterns
              </h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Check your CGM graph each evening to understand what worked well and what didn't. Look for trends over time.
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <h4 className="text-gray-900 mb-2" style={{ fontSize: '15px', fontWeight: 600 }}>
                3. Start with One Goal
              </h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Don't try to change everything at once. Pick one AI-suggested goal and focus on it for a week before adding more.
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <h4 className="text-gray-900 mb-2" style={{ fontSize: '15px', fontWeight: 600 }}>
                4. Ask Olivia Questions
              </h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Olivia is here to help! Don't hesitate to ask about patterns, meals, or anything glucose-related.
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <h4 className="text-gray-900 mb-2" style={{ fontSize: '15px', fontWeight: 600 }}>
                5. Join the Community
              </h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Share your wins and learn from others. The community feed is full of practical tips and motivation.
              </p>
            </div>
          </div>
        </section>

        {/* Getting Help */}
        <section>
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
            <h2 className="text-gray-900 mb-3" style={{ fontSize: '20px', fontWeight: 700 }}>
              Need Help?
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              If you have questions or run into issues:
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <Bell className="w-4 h-4 text-[#5B7FF3] mt-0.5 flex-shrink-0" />
                <span>Check the Community Resources tab for tutorials and guides</span>
              </li>
              <li className="flex items-start gap-2">
                <MessageCircle className="w-4 h-4 text-[#5B7FF3] mt-0.5 flex-shrink-0" />
                <span>Ask Olivia—she can answer most questions about the app</span>
              </li>
              <li className="flex items-start gap-2">
                <Users className="w-4 h-4 text-[#5B7FF3] mt-0.5 flex-shrink-0" />
                <span>Post in the Community Feed—other users love to help!</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Ready to Start */}
        <section>
          <div className="bg-gradient-to-br from-[#5B7FF3] to-[#7B9FF9] rounded-2xl p-6 text-white text-center">
            <h2 className="text-white mb-3" style={{ fontSize: '24px', fontWeight: 700 }}>
              Ready to Start?
            </h2>
            <p className="text-white/90 text-sm leading-relaxed mb-6">
              You're all set! Head to My CGM to view your glucose data, or chat with Olivia to get personalized guidance.
            </p>
            <button
              onClick={() => navigate('/overview')}
              className="bg-white text-[#5B7FF3] px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
              style={{ fontWeight: 600, fontSize: '15px' }}
            >
              Go to My CGM
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
