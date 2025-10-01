import React, { useState, useEffect } from 'react';
import { TrendingUp, Target, Calendar, Award, AlertTriangle, Clock, BarChart3, ChevronRight } from 'lucide-react';

const ProgressAnalytics = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [progressData, setProgressData] = useState(null);

  useEffect(() => {
    // Simulate loading progress data
    const loadProgressData = () => {
      setTimeout(() => {
        setProgressData({
          overallProgress: 78,
          sessionsCompleted: 24,
          totalPracticeTime: '12h 45m',
          currentStreak: 7,
          mudrasMastered: 8,
          accuracyTrend: [65, 72, 68, 75, 78, 82, 78],
          mudraBreakdown: [
            { name: 'Pataka', accuracy: 92, practiceCount: 15, improvement: 15 },
            { name: 'Tripataka', accuracy: 85, practiceCount: 12, improvement: 8 },
            { name: 'Ardhachandra', accuracy: 78, practiceCount: 10, improvement: 12 },
            { name: 'Mushti', accuracy: 65, practiceCount: 8, improvement: 5 },
            { name: 'Shikhara', accuracy: 58, practiceCount: 6, improvement: -2 }
          ],
          improvementAreas: [
            { mudra: 'Shikhara', issue: 'Thumb positioning', priority: 'high' },
            { mudra: 'Mushti', issue: 'Finger alignment', priority: 'medium' },
            { mudra: 'Ardhachandra', issue: 'Wrist flexibility', priority: 'low' }
          ],
          weeklyGoals: [
            { goal: 'Practice 5 sessions', completed: true },
            { goal: 'Master Tripataka mudra', completed: true },
            { goal: 'Improve overall accuracy to 80%', completed: false },
            { goal: 'Learn 2 new mudras', completed: false }
          ]
        });
      }, 1000);
    };

    loadProgressData();
  }, [selectedTimeframe]);

  if (!progressData) {
    return (
      <div className="min-h-screen bg-[#FFF9E6] pt-16">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 h-64"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9E6] pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#8B4513] mb-2">Progress Analytics</h1>
            <p className="text-lg text-[#8C3B26] max-w-2xl">
              Detailed insights into your learning journey and improvement areas
            </p>
          </div>
          
          {/* Timeframe Selector */}
          <div className="flex space-x-2 bg-white rounded-xl p-1 border border-[#FFD34E]/30 mt-4 lg:mt-0">
            {['day', 'week', 'month', 'all'].map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-4 py-2 rounded-lg font-medium capitalize transition-all ${
                  selectedTimeframe === timeframe
                    ? 'bg-[#FFD34E] text-[#8B4513] shadow-sm'
                    : 'text-[#8C3B26] hover:bg-[#FFF9E6]'
                }`}
              >
                {timeframe}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Overall Progress"
            value={`${progressData.overallProgress}%`}
            description="Accuracy across all mudras"
            trend="up"
          />
          <MetricCard
            icon={<Clock className="w-6 h-6" />}
            title="Practice Time"
            value={progressData.totalPracticeTime}
            description="Total dedicated practice"
          />
          <MetricCard
            icon={<Award className="w-6 h-6" />}
            title="Mudras Mastered"
            value={progressData.mudrasMastered}
            description="Perfect form achieved"
          />
          <MetricCard
            icon={<Calendar className="w-6 h-6" />}
            title="Current Streak"
            value={`${progressData.currentStreak} days`}
            description="Consistent practice"
            trend="fire"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Accuracy Trend Chart */}
          <div className="bg-white rounded-2xl shadow-lg border border-[#FFD34E]/30 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#8B4513]">Accuracy Trend</h2>
              <BarChart3 className="w-5 h-5 text-[#D94F3D]" />
            </div>
            <div className="h-64 flex items-end justify-between space-x-2">
              {progressData.accuracyTrend.map((value, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className="text-xs text-[#8C3B26] mb-1">{value}%</div>
                  <div
                    className="w-full bg-gradient-to-t from-[#D94F3D] to-[#FFD34E] rounded-t-lg transition-all duration-500"
                    style={{ height: `${(value / 100) * 180}px` }}
                  ></div>
                  <div className="text-xs text-[#8C3B26] mt-1">Day {index + 1}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Goals */}
          <div className="bg-white rounded-2xl shadow-lg border border-[#FFD34E]/30 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#8B4513]">Weekly Goals</h2>
              <Target className="w-5 h-5 text-[#D94F3D]" />
            </div>
            <div className="space-y-4">
              {progressData.weeklyGoals.map((goal, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-[#FFF9E6] rounded-lg border border-[#FFD34E]/50">
                  <span className="text-[#8C3B26] font-medium">{goal.goal}</span>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    goal.completed 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {goal.completed ? '✓' : '⋯'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mudra Performance Breakdown */}
          <div className="bg-white rounded-2xl shadow-lg border border-[#FFD34E]/30 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#8B4513]">Mudra Performance</h2>
              <TrendingUp className="w-5 h-5 text-[#D94F3D]" />
            </div>
            <div className="space-y-4">
              {progressData.mudraBreakdown.map((mudra, index) => (
                <div key={index} className="p-4 bg-[#FFF9E6] rounded-lg border border-[#FFD34E]/50">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-[#8B4513]">{mudra.name}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-[#D94F3D]">{mudra.accuracy}%</span>
                      <div className={`flex items-center text-sm ${
                        mudra.improvement >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {mudra.improvement >= 0 ? '↑' : '↓'} {Math.abs(mudra.improvement)}%
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[#FFD34E] to-[#D94F3D] h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${mudra.accuracy}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-[#8C3B26] mt-2">
                    <span>Practiced {mudra.practiceCount} times</span>
                    <span>Last session</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Improvement Areas */}
          <div className="bg-white rounded-2xl shadow-lg border border-[#FFD34E]/30 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#8B4513]">Focus Areas</h2>
              <AlertTriangle className="w-5 h-5 text-[#D94F3D]" />
            </div>
            <div className="space-y-4">
              {progressData.improvementAreas.map((area, index) => (
                <div key={index} className="p-4 bg-[#FFF9E6] rounded-lg border border-[#FFD34E]/50">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-[#8B4513]">{area.mudra}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      area.priority === 'high' 
                        ? 'bg-red-100 text-red-800' 
                        : area.priority === 'medium'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {area.priority} priority
                    </span>
                  </div>
                  <p className="text-[#8C3B26] mb-3">{area.issue}</p>
                  <button className="flex items-center space-x-1 text-[#D94F3D] font-medium text-sm hover:text-[#B33C2D] transition-colors">
                    <span>Practice this mudra</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-gradient-to-r from-[#FFD34E] to-[#D94F3D] rounded-2xl shadow-lg p-6 mt-8">
          <h2 className="text-xl font-semibold text-white mb-4">Personalized Recommendations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
              <div className="text-white font-semibold mb-2">Daily Practice</div>
              <p className="text-white/90 text-sm">Focus on Shikhara mudra for 15 minutes daily to improve thumb positioning</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
              <div className="text-white font-semibold mb-2">Weekly Goal</div>
              <p className="text-white/90 text-sm">Aim for 5 practice sessions this week to maintain your streak</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
              <div className="text-white font-semibold mb-2">Technique Focus</div>
              <p className="text-white/90 text-sm">Work on wrist flexibility exercises for better Ardhachandra form</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ icon, title, value, description, trend }) => (
  <div className="bg-white rounded-2xl shadow-lg border border-[#FFD34E]/30 p-6">
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 bg-[#FFD34E]/20 rounded-xl flex items-center justify-center">
        {icon}
      </div>
      {trend === 'fire' && (
        <div className="text-2xl">🔥</div>
      )}
    </div>
    <h3 className="text-2xl font-bold text-[#8B4513] mb-1">{value}</h3>
    <p className="font-semibold text-[#8C3B26] mb-1">{title}</p>
    <p className="text-sm text-[#8C3B26]/70">{description}</p>
  </div>
);

export default ProgressAnalytics;