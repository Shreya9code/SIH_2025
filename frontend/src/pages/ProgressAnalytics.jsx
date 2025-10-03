import React, { useState, useEffect } from 'react';
import { TrendingUp, Target, Calendar, Award, AlertTriangle, Clock, BarChart3, ChevronRight } from 'lucide-react';
import { useUser } from "@clerk/clerk-react";
import axios from 'axios';

const ProgressAnalytics = () => {
  const { user } = useUser();
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [progressData, setProgressData] = useState(null);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      try {
        const { data } = await axios.get(`http://localhost:5000/api/users/${user.id}/sessions`);
        const sess = Array.isArray(data?.sessions) ? data.sessions : [];
        setSessions(sess);

        const totalPoints = sess.reduce((sum, s) => sum + (Number(s.points) || 0), 0);
        const totalDurationSec = sess.reduce((sum, s) => sum + (Number(s.durationSec) || 0), 0);
        const streak = computeStreak(sess);

        setProgressData({
          overallProgress: sess.length ? Math.min(100, Math.round(totalPoints / (sess.length * 100) * 100)) : 0,
          sessionsCompleted: sess.length,
          totalPracticeTime: formatDuration(totalDurationSec),
          currentStreak: streak,
          mudrasMastered: estimateMastered(sess),
          accuracyTrend: sess.map(s => Math.min(100, Math.round((Number(s.points) || 0) * 10))),
          mudraBreakdown: exampleMudraBreakdown(sess),
          improvementAreas: exampleImprovementAreas(sess),
          weeklyGoals: exampleWeeklyGoals(sess),
        });
      } catch (e) {
        console.error('Failed to load sessions', e);
        setSessions([]);
        setProgressData(null);
      }
    };
    load();
  }, [user?.id, selectedTimeframe]);

  const computeStreak = (sess) => {
    const days = new Set(sess.map(s => new Date(s.startedAt).toDateString()));
    let streak = 0;
    let d = new Date();
    for (;;) {
      const key = d.toDateString();
      if (days.has(key)) {
        streak += 1;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const formatDuration = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const estimateMastered = (sess) => {
    return sess.filter(s => (Number(s.points) || 0) >= 80).length;
  };

  const exampleMudraBreakdown = (sess) => {
    const avg = sess.length ? Math.round(sess.reduce((sum, s) => sum + (Number(s.points) || 0), 0) / sess.length) : 0;
    return [
      { name: 'Pataka', accuracy: Math.min(100, avg + 10), practiceCount: 5, improvement: 5 },
      { name: 'Tripataka', accuracy: Math.max(0, avg - 5), practiceCount: 4, improvement: 2 },
      { name: 'Ardhachandra', accuracy: avg, practiceCount: 3, improvement: 3 },
    ];
  };

  const exampleImprovementAreas = () => (
    [
      { mudra: 'Shikhara', issue: 'Thumb positioning', priority: 'high' },
      { mudra: 'Mushti', issue: 'Finger alignment', priority: 'medium' },
    ]
  );

  const exampleWeeklyGoals = (sess) => (
    [
      { goal: 'Practice 3 sessions', completed: sess.length >= 3 },
      { goal: 'Reach 80+ points in a session', completed: sess.some(s => (Number(s.points) || 0) >= 80) },
      { goal: 'Practice 60+ minutes total', completed: sess.reduce((a, s) => a + (Number(s.durationSec) || 0), 0) >= 3600 },
    ]
  );

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
              {sessions.map((s, index) => {
                const value = Math.min(100, Math.round((Number(s.points) || 0) * 1));
                const label = new Date(s.startedAt).toLocaleDateString();
                return (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div className="text-xs text-[#8C3B26] mb-1">{value}</div>
                    <div
                      className="w-full bg-gradient-to-t from-[#D94F3D] to-[#FFD34E] rounded-t-lg transition-all duration-500"
                      style={{ height: `${(value / 100) * 180}px` }}
                    ></div>
                    <div className="text-xs text-[#8C3B26] mt-1">{label}</div>
                  </div>
                );
              })}
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
                        : 'bg-amber-100 text-amber-800'
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