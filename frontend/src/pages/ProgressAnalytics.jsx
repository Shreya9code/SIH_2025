import React, { useState, useEffect } from 'react';
import { TrendingUp, Target, Calendar, Award, AlertTriangle, Clock, BarChart3, ChevronRight, Sparkles } from 'lucide-react';
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
        const { data } = await axios.get(`https://nrityalens-backend.onrender.com/api/users/${user.id}/sessions`);
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
      <div className="min-h-screen !bg-gradient-to-br !from-amber-50 !via-orange-50 !to-rose-50 pt-20 px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 !bg-amber-200 !rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="!bg-white !rounded-2xl p-6 h-64 !border !border-amber-200"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen !bg-gradient-to-br !from-amber-50 !via-orange-50 !to-rose-50 pt-20 px-4 pb-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Banner */}
        <div className="text-center mb-8">
          <div className="!rounded-2xl !bg-gradient-to-r !from-amber-400 !to-orange-500 p-8 !shadow-2xl !border !border-amber-300 mb-6">
            <Sparkles size={48} className="mx-auto mb-4 !text-yellow-300" />
            <h1 className="text-4xl font-bold !text-white mb-3">Progress Analytics</h1>
            <p className="!text-amber-100 text-lg">
              Detailed insights into your learning journey and improvement areas
            </p>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-2 !bg-white !rounded-xl p-1 !border !border-amber-200 !shadow-lg">
            {['day', 'week', 'month', 'all'].map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-6 py-3 !rounded-lg font-medium capitalize transition-all ${
                  selectedTimeframe === timeframe
                    ? '!bg-gradient-to-r !from-amber-500 !to-orange-500 !text-white !shadow-lg'
                    : '!text-amber-700 hover:!bg-amber-50'
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
            icon={<TrendingUp className="w-6 h-6 !text-amber-600" />}
            title="Overall Progress"
            value={`${progressData.overallProgress}%`}
            description="Accuracy across all mudras"
            gradient="from-amber-400 to-orange-500"
          />
          <MetricCard
            icon={<Clock className="w-6 h-6 !text-green-600" />}
            title="Practice Time"
            value={progressData.totalPracticeTime}
            description="Total dedicated practice"
            gradient="from-green-500 to-emerald-600"
          />
          <MetricCard
            icon={<Award className="w-6 h-6 !text-amber-600" />}
            title="Mudras Mastered"
            value={progressData.mudrasMastered}
            description="Perfect form achieved"
            gradient="from-amber-500 to-yellow-500"
          />
          <MetricCard
            icon={<Calendar className="w-6 h-6 !text-rose-600" />}
            title="Current Streak"
            value={`${progressData.currentStreak} days`}
            description="Consistent practice"
            gradient="from-rose-500 to-red-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Accuracy Trend Chart */}
          <div className="!bg-white !rounded-2xl !shadow-xl !border !border-amber-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold !text-amber-900">Accuracy Trend</h2>
              <BarChart3 className="w-5 h-5 !text-amber-600" />
            </div>
            <div className="h-64 flex items-end justify-between space-x-2">
              {sessions.map((s, index) => {
                const value = Math.min(100, Math.round((Number(s.points) || 0) * 1));
                const label = new Date(s.startedAt).toLocaleDateString();
                return (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div className="text-xs !text-amber-700 mb-1 font-semibold">{value}%</div>
                    <div
                      className="w-full !bg-gradient-to-t !from-amber-500 !to-orange-500 !rounded-t-lg transition-all duration-500"
                      style={{ height: `${(value / 100) * 180}px` }}
                    ></div>
                    <div className="text-xs !text-amber-600 mt-1">{label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weekly Goals */}
          <div className="!bg-white !rounded-2xl !shadow-xl !border !border-amber-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold !text-amber-900">Weekly Goals</h2>
              <Target className="w-5 h-5 !text-amber-600" />
            </div>
            <div className="space-y-4">
              {progressData.weeklyGoals.map((goal, index) => (
                <div key={index} className="flex items-center justify-between p-4 !bg-gradient-to-r !from-amber-50 !to-orange-50 !rounded-lg !border !border-amber-200 hover:!from-amber-100 hover:!to-orange-100 transition-all">
                  <span className="!text-amber-800 font-medium">{goal.goal}</span>
                  <div className={`w-8 h-8 !rounded-full flex items-center justify-center !text-white font-bold ${
                    goal.completed 
                      ? '!bg-gradient-to-r !from-green-500 !to-emerald-600 !shadow-lg' 
                      : '!bg-gradient-to-r !from-amber-400 !to-orange-400 !shadow-lg'
                  }`}>
                    {goal.completed ? '✓' : '⋯'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mudra Performance Breakdown */}
          <div className="!bg-white !rounded-2xl !shadow-xl !border !border-amber-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold !text-amber-900">Mudra Performance</h2>
              <TrendingUp className="w-5 h-5 !text-amber-600" />
            </div>
            <div className="space-y-4">
              {progressData.mudraBreakdown.map((mudra, index) => (
                <div key={index} className="p-4 !bg-gradient-to-r !from-amber-50 !to-orange-50 !rounded-lg !border !border-amber-200 hover:!from-amber-100 hover:!to-orange-100 transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold !text-amber-900">{mudra.name}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold !text-amber-700">{mudra.accuracy}%</span>
                      <div className={`flex items-center text-sm font-semibold ${
                        mudra.improvement >= 0 ? '!text-green-600' : '!text-red-600'
                      }`}>
                        {mudra.improvement >= 0 ? '↑' : '↓'} {Math.abs(mudra.improvement)}%
                      </div>
                    </div>
                  </div>
                  <div className="w-full !bg-amber-200 !rounded-full h-3 mb-2">
                    <div
                      className="!bg-gradient-to-r !from-amber-500 !to-orange-500 h-3 !rounded-full transition-all duration-1000"
                      style={{ width: `${mudra.accuracy}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm !text-amber-700">
                    <span>Practiced {mudra.practiceCount} times</span>
                    <span>Last session</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Improvement Areas */}
          <div className="!bg-white !rounded-2xl !shadow-xl !border !border-amber-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold !text-amber-900">Focus Areas</h2>
              <AlertTriangle className="w-5 h-5 !text-amber-600" />
            </div>
            <div className="space-y-4">
              {progressData.improvementAreas.map((area, index) => (
                <div key={index} className="p-4 !bg-gradient-to-br !from-rose-50 !to-pink-50 !rounded-lg !border !border-rose-200 hover:!from-rose-100 hover:!to-pink-100 transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold !text-rose-900">{area.mudra}</h3>
                    <span className={`px-3 py-1 !rounded-full text-xs font-medium ${
                      area.priority === 'high' 
                        ? '!bg-red-500 !text-white' 
                        : '!bg-amber-500 !text-white'
                    }`}>
                      {area.priority} priority
                    </span>
                  </div>
                  <p className="!text-rose-700 mb-3">{area.issue}</p>
                  <button className="flex items-center space-x-1 !text-rose-600 font-medium text-sm hover:!text-rose-700 transition-colors">
                    <span>Practice this mudra</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="!bg-gradient-to-r !from-amber-400 !to-orange-500 !rounded-2xl !shadow-2xl p-8 mt-8 !border !border-amber-300">
          <h2 className="text-2xl font-bold !text-white mb-6 text-center">Personalized Recommendations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="!bg-white/20 !backdrop-blur-sm !rounded-xl p-6 !border !border-white/30 hover:!bg-white/30 transition-all">
              <div className="!text-white font-bold text-lg mb-3">Daily Practice</div>
              <p className="!text-amber-100 text-sm">Focus on Shikhara mudra for 15 minutes daily to improve thumb positioning</p>
            </div>
            <div className="!bg-white/20 !backdrop-blur-sm !rounded-xl p-6 !border !border-white/30 hover:!bg-white/30 transition-all">
              <div className="!text-white font-bold text-lg mb-3">Weekly Goal</div>
              <p className="!text-amber-100 text-sm">Aim for 5 practice sessions this week to maintain your streak</p>
            </div>
            <div className="!bg-white/20 !backdrop-blur-sm !rounded-xl p-6 !border !border-white/30 hover:!bg-white/30 transition-all">
              <div className="!text-white font-bold text-lg mb-3">Technique Focus</div>
              <p className="!text-amber-100 text-sm">Work on wrist flexibility exercises for better Ardhachandra form</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ icon, title, value, description, gradient = "from-amber-500 to-orange-500" }) => (
  <div className="!bg-white !rounded-2xl !shadow-xl !border !border-amber-200 p-6 hover:!shadow-2xl transition-all duration-300">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 !bg-gradient-to-r ${gradient} !rounded-xl flex items-center justify-center !text-white`}>
        {icon}
      </div>
    </div>
    <h3 className="text-2xl font-bold !text-amber-900 mb-1">{value}</h3>
    <p className="font-semibold !text-amber-800 mb-1">{title}</p>
    <p className="text-sm !text-amber-600">{description}</p>
  </div>
);

export default ProgressAnalytics;