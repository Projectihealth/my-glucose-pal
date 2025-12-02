import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Utensils, TrendingDown, Activity, Brain, Moon, Scale, Target, CheckCircle2, AlertCircle, Sparkles, Clock, Users, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";

const WeightLossStrategies = () => {
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
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#5B7FF3] mb-2">WEIGHT MANAGEMENT</p>
          <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-3">
            Sustainable Weight Loss Strategies
          </h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            Evidence-based approaches to losing weight and keeping it off through lifestyle changes that actually work long-term.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8 space-y-8 max-w-2xl mx-auto pb-32">

        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-[#5B7FF3] to-[#7B9FF9] rounded-3xl p-6 text-white">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">The Truth About Weight Loss</h2>
              <p className="text-white/90 text-sm leading-relaxed">
                Forget fad diets and quick fixes. Sustainable weight loss is about building habits you can maintain for life. This guide focuses on science-backed strategies that work with your body, not against it.
              </p>
            </div>
          </div>
        </div>

        {/* Why Diets Fail */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-[#5B7FF3]" />
            Why Traditional Diets Don't Work
          </h2>

          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Research shows that 80-95% of people who lose weight on restrictive diets regain it within 1-5 years. Here's why:
            </p>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm mb-1">Metabolic adaptation</p>
                  <p className="text-xs text-gray-600">Your body slows metabolism to conserve energy when calories are severely restricted.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Brain className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm mb-1">Psychological deprivation</p>
                  <p className="text-xs text-gray-600">Labeling foods as "forbidden" creates cravings and eventual binges.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Activity className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm mb-1">Unsustainable habits</p>
                  <p className="text-xs text-gray-600">Extreme changes can't be maintained once "willpower" runs out.</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 mt-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong className="text-[#5B7FF3]">The Solution:</strong> Focus on gradual, sustainable changes that become part of your lifestyle rather than temporary restrictions.
              </p>
            </div>
          </div>
        </section>

        {/* Core Principles */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#5B7FF3]" />
            The 5 Pillars of Sustainable Weight Loss
          </h2>

          <div className="space-y-4">
            {/* Nutrition */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Utensils className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">1. Nutrition Quality Over Quantity</h3>
                  <p className="text-xs text-gray-600 mb-3">Prioritize what you eat, not just how much</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="font-medium text-sm text-gray-900 mb-2">Focus on whole foods</p>
                  <ul className="space-y-1 text-xs text-gray-700 ml-4">
                    <li>• Vegetables (aim for 5+ servings daily)</li>
                    <li>• Lean proteins (chicken, fish, legumes, tofu)</li>
                    <li>• Whole grains (brown rice, quinoa, oats)</li>
                    <li>• Healthy fats (avocado, nuts, olive oil)</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="font-medium text-sm text-gray-900 mb-2">Use the "plate method"</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-3 bg-green-500 rounded"></div>
                      <span className="text-xs text-gray-600">1/2 plate: Non-starchy vegetables</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-3 bg-blue-500 rounded"></div>
                      <span className="text-xs text-gray-600">1/4 plate: Lean protein</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-3 bg-orange-500 rounded"></div>
                      <span className="text-xs text-gray-600">1/4 plate: Whole grains or starchy vegetables</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-3">
                  <p className="text-xs text-gray-700">
                    <strong className="text-[#5B7FF3]">Pro Tip:</strong> Don't eliminate foods completely. The 80/20 rule (healthy 80% of the time) allows flexibility without derailing progress.
                  </p>
                </div>
              </div>
            </div>

            {/* Physical Activity */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Activity className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">2. Move More (But Smart)</h3>
                  <p className="text-xs text-gray-600 mb-3">Exercise for health, not punishment</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="font-medium text-sm text-gray-900 mb-2">The best exercise is the one you'll actually do</p>
                  <ul className="space-y-1 text-xs text-gray-700 ml-4">
                    <li>• <strong>Walking:</strong> 10,000 steps/day (or start with 5,000 and build up)</li>
                    <li>• <strong>Strength training:</strong> 2-3x per week to preserve muscle mass</li>
                    <li>• <strong>NEAT:</strong> Non-exercise activity thermogenesis (take stairs, park farther away)</li>
                    <li>• <strong>Enjoyable activity:</strong> Dancing, swimming, hiking—find what you love</li>
                  </ul>
                </div>

                <div className="border-l-4 border-orange-500 bg-orange-50 rounded-r-xl p-4">
                  <p className="font-bold text-gray-900 text-sm mb-2">Why strength training matters</p>
                  <p className="text-xs text-gray-700">
                    Muscle burns more calories at rest than fat. Preserving muscle during weight loss keeps your metabolism higher and makes maintenance easier.
                  </p>
                </div>
              </div>
            </div>

            {/* Sleep */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Moon className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">3. Prioritize Quality Sleep</h3>
                  <p className="text-xs text-gray-600 mb-3">Sleep is when your body recovers and regulates hormones</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-700 mb-3">
                    Poor sleep (less than 7 hours) disrupts hunger hormones:
                  </p>
                  <ul className="space-y-2 text-xs text-gray-700">
                    <li>• ↑ Ghrelin (hunger hormone) makes you crave high-calorie foods</li>
                    <li>• ↓ Leptin (fullness hormone) makes it harder to feel satisfied</li>
                    <li>• ↑ Cortisol (stress hormone) promotes fat storage, especially belly fat</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="font-medium text-sm text-gray-900 mb-2">Sleep better tonight:</p>
                  <ul className="space-y-1 text-xs text-gray-700 ml-4">
                    <li>• Aim for 7-9 hours per night</li>
                    <li>• Keep bedroom cool (65-68°F)</li>
                    <li>• Avoid screens 1 hour before bed</li>
                    <li>• Maintain consistent sleep/wake times</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Stress Management */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Brain className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">4. Manage Stress Effectively</h3>
                  <p className="text-xs text-gray-600 mb-3">Chronic stress sabotages weight loss efforts</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-700 mb-3">
                    Stress triggers cortisol release, which:
                  </p>
                  <ul className="space-y-1 text-xs text-gray-700 ml-4">
                    <li>• Increases appetite and cravings for comfort foods</li>
                    <li>• Promotes fat storage around the midsection</li>
                    <li>• Reduces sleep quality</li>
                    <li>• Makes it harder to stick to healthy habits</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="font-medium text-sm text-gray-900 mb-2">Stress-reduction strategies:</p>
                  <ul className="space-y-1 text-xs text-gray-700 ml-4">
                    <li>• Meditation or deep breathing (even 5 minutes helps)</li>
                    <li>• Regular exercise (natural stress reliever)</li>
                    <li>• Social connection (call a friend, join a community)</li>
                    <li>• Time in nature (proven to lower cortisol)</li>
                    <li>• Hobbies and activities you enjoy</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Consistency */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-pink-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">5. Embrace Consistency Over Perfection</h3>
                  <p className="text-xs text-gray-600 mb-3">Progress, not perfection, is the goal</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-700 mb-3">
                    <strong>The 1% improvement rule:</strong> Small, consistent changes compound over time. Being 1% better each day leads to being 37x better in a year.
                  </p>
                </div>

                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="font-medium text-sm text-gray-900 mb-2">Practical examples:</p>
                  <ul className="space-y-1 text-xs text-gray-700 ml-4">
                    <li>• Week 1: Add vegetables to one meal per day</li>
                    <li>• Week 2: Walk 10 minutes after dinner</li>
                    <li>• Week 3: Replace one sugary drink with water</li>
                    <li>• Week 4: Go to bed 15 minutes earlier</li>
                  </ul>
                  <p className="text-xs text-gray-700 mt-3">
                    By month 3, these small habits become automatic and sustainable.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Practical Strategies */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-[#5B7FF3]" />
            Actionable Strategies That Work
          </h2>

          <div className="space-y-4">
            {/* Mindful Eating */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3">Practice Mindful Eating</h3>
              <div className="space-y-2">
                <div className="flex gap-2 items-start">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">Eat slowly and without distractions (no phone/TV)</p>
                </div>
                <div className="flex gap-2 items-start">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">Stop eating when you're 80% full (it takes 20 minutes for your brain to register fullness)</p>
                </div>
                <div className="flex gap-2 items-start">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">Ask yourself: "Am I physically hungry or emotionally eating?"</p>
                </div>
              </div>
            </div>

            {/* Meal Prep */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3">Plan and Prep Meals</h3>
              <div className="space-y-2">
                <div className="flex gap-2 items-start">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">Prep vegetables and proteins on Sunday for the week</p>
                </div>
                <div className="flex gap-2 items-start">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">Keep healthy snacks visible (fruits, nuts, yogurt)</p>
                </div>
                <div className="flex gap-2 items-start">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">Remove tempting foods from sight ("out of sight, out of mind")</p>
                </div>
              </div>
            </div>

            {/* Protein Priority */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3">Prioritize Protein at Every Meal</h3>
              <p className="text-sm text-gray-600 mb-3">
                Protein increases satiety, preserves muscle mass, and has a higher thermic effect (burns more calories during digestion).
              </p>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-medium text-sm text-gray-900 mb-2">Aim for 20-30g protein per meal:</p>
                <ul className="space-y-1 text-xs text-gray-700 ml-4">
                  <li>• 4 oz chicken breast = 35g</li>
                  <li>• 1 cup Greek yogurt = 20g</li>
                  <li>• 2 eggs = 12g</li>
                  <li>• 1 cup cooked lentils = 18g</li>
                  <li>• 4 oz salmon = 25g</li>
                </ul>
              </div>
            </div>

            {/* Hydration */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3">Stay Hydrated</h3>
              <div className="space-y-2">
                <div className="flex gap-2 items-start">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">Drink 8-10 glasses of water daily (more if exercising)</p>
                </div>
                <div className="flex gap-2 items-start">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">Drink water before meals (can reduce intake by 13%)</p>
                </div>
                <div className="flex gap-2 items-start">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">Thirst is often mistaken for hunger—drink first, then assess</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tracking Progress */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Scale className="w-6 h-6 text-[#5B7FF3]" />
            Track Progress Beyond the Scale
          </h2>

          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <p className="text-sm text-gray-600 mb-4">
              Weight fluctuates daily due to water retention, hormones, and digestion. Focus on these metrics instead:
            </p>

            <div className="space-y-3">
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="font-semibold text-sm text-gray-900 mb-1">Energy levels</p>
                <p className="text-xs text-gray-600">Do you feel more energetic throughout the day?</p>
              </div>

              <div className="bg-green-50 rounded-xl p-4">
                <p className="font-semibold text-sm text-gray-900 mb-1">How clothes fit</p>
                <p className="text-xs text-gray-600">Body composition changes even when weight stays the same</p>
              </div>

              <div className="bg-purple-50 rounded-xl p-4">
                <p className="font-semibold text-sm text-gray-900 mb-1">Improved glucose control</p>
                <p className="text-xs text-gray-600">Better time in range and fewer spikes</p>
              </div>

              <div className="bg-orange-50 rounded-xl p-4">
                <p className="font-semibold text-sm text-gray-900 mb-1">Strength and endurance</p>
                <p className="text-xs text-gray-600">Can you walk farther? Lift heavier? Climb stairs easier?</p>
              </div>

              <div className="bg-pink-50 rounded-xl p-4">
                <p className="font-semibold text-sm text-gray-900 mb-1">Mood and mental clarity</p>
                <p className="text-xs text-gray-600">Improved focus, less brain fog, better emotional regulation</p>
              </div>
            </div>
          </div>
        </section>

        {/* Common Pitfalls */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-[#5B7FF3]" />
            Avoid These Common Pitfalls
          </h2>

          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="space-y-4">
              <div className="border-l-4 border-red-500 bg-red-50 rounded-r-xl p-4">
                <p className="font-bold text-sm text-gray-900 mb-1">❌ Cutting calories too drastically</p>
                <p className="text-xs text-gray-700">Aim for a modest 300-500 calorie deficit, not 1000+. Extreme restriction slows metabolism and is unsustainable.</p>
              </div>

              <div className="border-l-4 border-red-500 bg-red-50 rounded-r-xl p-4">
                <p className="font-bold text-sm text-gray-900 mb-1">❌ Doing excessive cardio without strength training</p>
                <p className="text-xs text-gray-700">Cardio alone can lead to muscle loss. Include resistance training 2-3x per week to preserve lean mass.</p>
              </div>

              <div className="border-l-4 border-red-500 bg-red-50 rounded-r-xl p-4">
                <p className="font-bold text-sm text-gray-900 mb-1">❌ Having an "all or nothing" mindset</p>
                <p className="text-xs text-gray-700">One "off" meal doesn't ruin progress. Get right back on track with your next meal—don't spiral into a binge.</p>
              </div>

              <div className="border-l-4 border-red-500 bg-red-50 rounded-r-xl p-4">
                <p className="font-bold text-sm text-gray-900 mb-1">❌ Comparing your progress to others</p>
                <p className="text-xs text-gray-700">Everyone's body responds differently. Focus on your own journey and celebrate your wins.</p>
              </div>

              <div className="border-l-4 border-red-500 bg-red-50 rounded-r-xl p-4">
                <p className="font-bold text-sm text-gray-900 mb-1">❌ Ignoring hunger and fullness cues</p>
                <p className="text-xs text-gray-700">Eating on a rigid schedule or continuing past fullness disrupts natural regulation. Listen to your body.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Building Community */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-[#5B7FF3]" />
            The Power of Community Support
          </h2>

          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <p className="text-sm text-gray-600 mb-4">
              Studies show people who lose weight with social support are 20% more likely to keep it off long-term.
            </p>

            <div className="space-y-3">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-sm text-gray-900 mb-2">Ways to build your support system:</p>
                <ul className="space-y-1 text-xs text-gray-700 ml-4">
                  <li>• Share your goals with friends and family</li>
                  <li>• Join the community feed to share wins and learn from others</li>
                  <li>• Find an accountability partner with similar goals</li>
                  <li>• Celebrate non-scale victories together</li>
                  <li>• Ask for help when you're struggling</li>
                </ul>
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-gray-700">
                  <strong className="text-[#5B7FF3]">Remember:</strong> You don't have to do this alone. Olivia is here to support you, and so is the entire My Glucose Pal community.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <div className="bg-gradient-to-br from-[#5B7FF3] to-[#7B9FF9] rounded-3xl p-6 text-white">
          <h3 className="text-xl font-bold mb-2">Ready to Start Your Journey?</h3>
          <p className="text-white/90 text-sm mb-4 leading-relaxed">
            Small, consistent changes lead to lasting results. Pick one habit from this guide to focus on this week, and build from there.
          </p>
          <button
            onClick={() => navigate('/goal')}
            className="w-full bg-white text-[#5B7FF3] py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors mb-3"
          >
            Set Your Weekly Goals
          </button>
          <button
            onClick={() => navigate('/coach')}
            className="w-full bg-white/10 border-2 border-white text-white py-3 rounded-xl font-semibold text-sm hover:bg-white/20 transition-colors"
          >
            Chat with Olivia for Personalized Guidance
          </button>
        </div>

        {/* Additional Resources */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-3">Continue Learning</h3>
          <div className="space-y-2">
            <button
              onClick={() => navigate('/learn-more/cgm-foundations')}
              className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <span className="text-sm font-medium text-gray-900">CGM Foundations</span>
              <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
            </button>
            <button
              onClick={() => navigate('/learn-more/user-guide')}
              className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <span className="text-sm font-medium text-gray-900">Complete User Guide</span>
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

export default WeightLossStrategies;
