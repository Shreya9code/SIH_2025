import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useUser } from "@clerk/clerk-react";
import { Users, BarChart3, MessageCircle, Trophy, Clock, Target, TrendingUp, Crown, Share2, Copy, ArrowLeft, Calendar, Award, Activity, Sparkles } from "lucide-react";

// UI helpers
function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-[420px] max-w-[92vw] rounded-2xl bg-gradient-to-br from-white to-amber-50 p-6 shadow-2xl border border-amber-200">
        <button
          className="absolute right-4 top-4 text-amber-600 hover:text-amber-800 transition-colors"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  )
}

// Main group learning component
function GroupLearning({ currentUser }) {
  const { user } = useUser();
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupChat, setGroupChat] = useState([]);
  const [chatText, setChatText] = useState("");
  const [progressReport, setProgressReport] = useState(null);
  const [inviteCode, setInviteCode] = useState("");
  const [shareCode, setShareCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [selectedMemberReport, setSelectedMemberReport] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberSessions, setMemberSessions] = useState([]);
  const [memberAnalytics, setMemberAnalytics] = useState(null);
  const [showMembersList, setShowMembersList] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);  // Fetch user groups (on mount)
  useEffect(() => {
    const load = async () => {
      const clerkId = user?.id || currentUser?._id;
      if (!clerkId) return;
      try {
        const { data } = await axios.get(`https://nrityalens-backend.onrender.com/api/groups`, { params: { clerkId } });
        setGroups(data.groups || []);
      } catch (e) {
        console.error('Failed to load groups', e);
      }
    };
    load();
  }, [user?.id, currentUser]);

  // Auto-join via invite link (?code=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code && !inviteCode) {
      setInviteCode(code);
      setTimeout(() => {
        joinGroup();
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch group chat when switching groups
  useEffect(() => {
    const loadChat = async () => {
      if (!activeGroup?._id) return;
      try {
        const { data } = await axios.get(`https://nrityalens-backend.onrender.com/api/groups/${activeGroup._id}/chat`);
        setGroupChat(data.chats || []);
        setProgressReport(null);
        setSelectedMemberReport(null);
      } catch (e) {
        console.error('Failed to load chat', e);
        setGroupChat([]);
      }
    };
    loadChat();
  }, [activeGroup]);

  const createGroup = async () => {
    const adminClerkId = user?.id || currentUser?._id;
    if (!adminClerkId || !groupName) return;
    try {
      const { data } = await axios.post(`https://nrityalens-backend.onrender.com/api/groups`, { name: groupName, adminClerkId });
      setGroups([data.group, ...groups]);
      setShareCode(data.group.inviteCode);
      const origin = window.location.origin;
      setShareLink(`${origin}/groups?code=${data.group.inviteCode}`);
      setShowGroupModal(false);
      setGroupName("");
    } catch (e) {
      console.error('Failed to create group', e);
      const msg = e?.response?.data?.message || e?.message || 'Failed to create group';
      setErrorMsg(msg);
      alert(msg);
    }
  };

  const joinGroup = async () => {
    const clerkId = user?.id || currentUser?._id;
    if (!inviteCode || !clerkId) return;
    try {
      const { data } = await axios.post(`https://nrityalens-backend.onrender.com/api/groups/join`, { inviteCode, clerkId });
      const exists = groups.find(g => g._id === data.group._id);
      setGroups(exists ? groups.map(g => g._id === data.group._id ? data.group : g) : [data.group, ...groups]);
      setInviteCode("");
    } catch (e) {
      console.error('Failed to join group', e);
      const msg = e?.response?.data?.message || e?.message || 'Failed to join group';
      setErrorMsg(msg);
      alert(msg);
    }
  };

  const sendMessage = async () => {
    if (!chatText || !activeGroup?._id) return;
    const clerkId = user?.id || currentUser?._id;
    try {
      await axios.post(`https://nrityalens-backend.onrender.com/api/groups/${activeGroup._id}/chat`, { clerkId, message: chatText });
      setGroupChat([...groupChat, { clerkId, name: user?.fullName || currentUser?.name || 'You', message: chatText, createdAt: new Date().toISOString() }]);
      setChatText("");
    } catch (e) {
      console.error('Failed to send message', e);
    }
  };

  const loadMemberReport = async (member) => {
    if (!activeGroup?._id || !member?.clerkId) return;
    try {
      const safeId = encodeURIComponent(member.clerkId);
      const [detailRes, sessionsRes] = await Promise.all([
        axios.get(`https://nrityalens-backend.onrender.com/api/groups/${activeGroup._id}/member-progress`, { params: { clerkId: member.clerkId } }),
        axios.get(`https://nrityalens-backend.onrender.com/api/users/${safeId}/sessions`)
      ]);
      setSelectedMemberReport({ ...detailRes.data, member });
      const sess = Array.isArray(sessionsRes?.data?.sessions) ? sessionsRes.data.sessions : [];
      setMemberSessions(sess);
      setMemberAnalytics(computeMemberAnalytics(sess));
      setShowMemberModal(true);
    } catch (e) {
      console.error('Failed to load member report', e);
      setSelectedMemberReport(null);
      setMemberSessions([]);
      setMemberAnalytics(null);
    }
  };

  const computeMemberAnalytics = (sess) => {
    const totalPoints = sess.reduce((sum, s) => sum + (Number(s.points) || 0), 0);
    const totalDurationSec = sess.reduce((sum, s) => sum + (Number(s.durationSec) || 0), 0);
    const streak = computeStreak(sess);
    return {
      overallProgress: sess.length ? Math.min(100, Math.round(totalPoints / (sess.length * 100) * 100)) : 0,
      sessionsCompleted: sess.length,
      totalPracticeTime: formatDuration(totalDurationSec),
      currentStreak: streak,
      accuracyTrend: sess.map(s => Math.min(100, Math.round((Number(s.points) || 0) * 1))),
      mudraBreakdown: exampleMudraBreakdown(sess),
      improvementAreas: exampleImprovementAreas(sess),
      weeklyGoals: exampleWeeklyGoals(sess),
    };
  };

  const computeStreak = (sess) => {
    const days = new Set(sess.map(s => new Date(s.startedAt).toDateString()));
    let streak = 0;
    let d = new Date();
    for (; ;) {
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
    const h = Math.floor((sec || 0) / 3600);
    const m = Math.floor(((sec || 0) % 3600) / 60);
    return `${h}h ${m}m`;
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

  const isAdmin = activeGroup?.adminClerkId === (user?.id || currentUser?._id);
  const isDetail = Boolean(activeGroup);

  return (

    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 pt-20 px-4 pb-8">
      {/* HEADER BAR WHEN IN DETAIL VIEW */}

      {isDetail && (

        <div className="mx-auto mb-6 max-w-7xl">

          <div className="rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 p-6 shadow-2xl border border-amber-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setActiveGroup(null);
                    setProgressReport(null);
                    setSelectedMemberReport(null);
                    setShowMembersList(false);
                  }}
                  className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-white backdrop-blur-sm hover:bg-white/30 transition-all duration-300"
                >
                  <ArrowLeft size={18} />
                  Back to Groups
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    {activeGroup.name}
                    {isAdmin && <Crown size={20} className="text-yellow-300" />}
                  </h1>
                  <button
                    onClick={() => setShowMembersList(!showMembersList)}
                    className="flex items-center gap-2 mt-1 text-amber-100 hover:text-white transition-colors"
                  >
                    <Users size={16} />
                    <span>{activeGroup.members.length} members</span>
                  </button>
                </div>
              </div>

              {/* ADDED: Show Invite Code Button for Admin */}
              {isAdmin && (
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-white backdrop-blur-sm hover:bg-white/30 transition-all duration-300"
                >
                  <Share2 size={18} />
                  Show Invite Code
                </button>
              )}
            </div>

            {/* Members List Dropdown - Made scrollable */}
            {showMembersList && (
              <div className="mt-4 rounded-xl bg-white/20 backdrop-blur-sm p-4 border border-white/30">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Users size={18} />
                  Group Members
                </h3>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {activeGroup.members.map((member, index) => (
                    <div
                      key={member.clerkId || member.name}
                      className="bg-white/10 rounded-lg p-3 border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer"
                      onClick={() => loadMemberReport(member)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white text-sm font-bold">
                            {member.name?.charAt(0) || 'U'}
                          </div>
                          <span className="text-white font-medium">{member.name}</span>
                        </div>
                        {member.clerkId === activeGroup.adminClerkId && (
                          <Crown size={14} className="text-yellow-300" />
                        )}
                      </div>
                      <div className="mt-2 flex justify-between text-xs text-amber-100">
                        <span>View Progress</span>
                        <TrendingUp size={12} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="mx-auto max-w-7xl">
        {!isDetail ? (
          /* GROUPS LIST VIEW - When no group is selected */


          <div className="grid grid-cols-1 lg:grid-cols-[350px,1fr] gap-6">
            {/* Welcome/Empty State */}
            <div className="rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-8 text-white shadow-2xl border border-amber-300">
              <div className="text-center max-w-2xl mx-auto">
                <Sparkles size={48} className="mx-auto mb-4 text-yellow-300" />
                <h2
                  className="text-4xl font-bold mb-4 !text-white"
                >
                  Group Learning
                </h2>
                <p className="text-amber-100 text-lg mb-6">
                  Collaborate with fellow Bharatanatyam enthusiasts! Create or join a group to track progress,
                  share insights, and learn together.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                    <BarChart3 size={24} className="mx-auto mb-2" />
                    <h3 className="font-semibold">Track Progress</h3>
                    <p className="text-amber-100 text-sm">Monitor group member achievements</p>
                  </div>
                  <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                    <Users size={24} className="mx-auto mb-2" />
                    <h3 className="font-semibold">Collaborate</h3>
                    <p className="text-amber-100 text-sm">Learn together with peers</p>
                  </div>
                  <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                    <Trophy size={24} className="mx-auto mb-2" />
                    <h3 className="font-semibold">Achieve Goals</h3>
                    <p className="text-amber-100 text-sm">Reach milestones as a team</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Groups Sidebar */}
            <div className="rounded-2xl bg-white p-6 shadow-xl border border-amber-200">
              <div className="flex items-center gap-3 mb-6">
                <Users className="text-amber-600" size={24} />
                <h2 className="text-xl font-bold text-amber-900">Your Groups</h2>
              </div>

              {/* UPDATED: Buttons side by side */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => setShowGroupModal(true)}
                  className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-white font-semibold shadow-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Users size={18} />
                  Create
                </button>
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3 text-white font-semibold shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Share2 size={18} />
                  Join
                </button>
              </div>

              {errorMsg && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-red-700 text-sm mb-4">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-3">
                {groups.map(group => (
                  <div
                    key={group._id}
                    className="rounded-xl border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 hover:border-amber-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => setActiveGroup(group)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-amber-900">{group.name}</h3>
                      {group.adminClerkId === (user?.id || currentUser?._id) && (
                        <Crown size={16} className="text-amber-600" />
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm text-amber-700">
                      <span className="flex items-center gap-1">
                        <Users size={14} />
                        {group.members.length} members
                      </span>
                      <span className="bg-amber-200 text-amber-800 px-2 py-1 rounded-full text-xs">
                        {group.adminClerkId === (user?.id || currentUser?._id) ? 'Admin' : 'Member'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>





          </div>
        ) : (
          /* GROUP DETAIL VIEW - When a group is selected */
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* LEFT COLUMN: PROGRESS TRACKING */}
            <div className="space-y-6">
              {/* Group Progress Overview */}
              {progressReport && (
                <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-indigo-600 p-6 text-white shadow-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <Trophy size={24} />
                    <h3 className="text-xl font-bold">Group Progress Overview</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{Math.round(progressReport.average || 0)}</div>
                      <div className="text-amber-100 text-sm">Average</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{Math.round(progressReport.median || 0)}</div>
                      <div className="text-amber-100 text-sm">Median</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{Math.round(progressReport.mode || 0)}</div>
                      <div className="text-amber-100 text-sm">Mode</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {progressReport.memberSummaries?.map((member, index) => (
                      <div key={member.clerkId} className="flex items-center justify-between bg-white/20 rounded-lg p-3">
                        <span className="font-medium">{member.name}</span>
                        <span className="text-amber-100">{member.totalPoints} pts • {member.sessions} sessions</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Member List - UPDATED: Same height as chat and scrollable */}
              <div className="rounded-2xl bg-white shadow-xl border border-amber-200 h-[600px] flex flex-col">
                <div className="flex items-center gap-3 border-b border-amber-200 px-6 py-4">
                  <Users className="text-amber-600" size={20} />
                  <h3 className="font-bold text-amber-900">Member Progress</h3>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-3">
                    {activeGroup.members.map((member) => {
                      const isSelected = selectedMemberReport?.member?.clerkId === member.clerkId;
                      return (
                        <div
                          key={member.clerkId}
                          onClick={() => loadMemberReport(member)}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${isSelected
                            ? 'border-amber-500 bg-gradient-to-r from-amber-50 to-orange-50 shadow-lg'
                            : 'border-amber-200 bg-amber-50 hover:border-amber-300 hover:shadow-md'
                            }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold">
                                {member.name?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <div className="font-semibold text-amber-900">{member.name}</div>
                                <div className="text-xs text-amber-600">
                                  {member.clerkId === activeGroup.adminClerkId ? 'Admin' : 'Member'}
                                </div>
                              </div>
                            </div>
                            {isSelected && (
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            )}
                          </div>
                          <div className="flex justify-between items-center text-sm text-amber-700">
                            <span>Click to view progress</span>
                            <TrendingUp size={14} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: GROUP CHAT */}
            <div className="rounded-2xl bg-white shadow-xl border border-amber-200 h-[600px] flex flex-col">
              <div className="flex items-center gap-3 border-b border-amber-200 px-6 py-4">
                <MessageCircle className="text-amber-600" size={20} />
                <h3 className="font-bold text-amber-900">Group Chat</h3>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                {groupChat.map((msg, idx) => {
                  const ts = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : '';
                  const mine = (msg.clerkId === (user?.id || currentUser?._id));
                  return (
                    <div key={idx} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${mine ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' : 'bg-amber-100 text-amber-900'}`}>
                        <div className="flex items-center justify-between gap-3 mb-1">
                          <span className="text-sm font-semibold">{msg.name || msg.clerkId}</span>
                          <span className="text-xs opacity-70">{ts}</span>
                        </div>
                        <div className="text-sm">{msg.message}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-amber-200 p-4">
                <div className="flex gap-2">
                  <input
                    value={chatText}
                    onChange={e => setChatText(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") sendMessage(); }}
                    placeholder="Type your message..."
                    className="flex-1 rounded-xl border border-amber-300 !bg-amber-50 px-4 py-2 !text-amber-900 placeholder-amber-600/60 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                  <button
                    onClick={sendMessage}
                    className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-2 text-white font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-300"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      <Modal open={showGroupModal} onClose={() => setShowGroupModal(false)}>
        <h3 className="mb-4 text-xl font-bold text-amber-900 text-center">Create New Group</h3>
        <form onSubmit={e => { e.preventDefault(); createGroup(); }}>
          <input
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
            placeholder="Enter group name"
            required
            className="w-full rounded-xl border !border-amber-300 !bg-amber-50 px-4 py-3 !text-amber-900 placeholder-amber-600/60 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:!border-transparent mb-4"
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-white font-semibold shadow-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-300"
          >
            Create Group
          </button>
        </form>
        {shareCode && (
          <div className="mt-4 p-3 rounded-xl bg-amber-100 border border-amber-300">
            <div className="text-sm text-amber-800 font-semibold mb-2">Invite Code:</div>
            <div className="flex items-center justify-between">
              <code className="text-amber-900 font-bold">{shareCode}</code>
              <button
                onClick={() => navigator.clipboard.writeText(shareCode)}
                className="flex items-center gap-1 text-amber-700 hover:text-amber-900"
              >
                <Copy size={14} />
                Copy
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Join Group Modal */}
      <Modal open={showJoinModal} onClose={() => setShowJoinModal(false)}>
        <h3 className="mb-4 text-xl font-bold text-amber-900 text-center">Join Group</h3>
        <div className="space-y-4">
          <input
            value={inviteCode}
            onChange={e => setInviteCode(e.target.value)}
            placeholder="Enter invite code"
            className="w-full rounded-xl border !border-amber-300 !bg-amber-50 px-4 py-3 !text-amber-900 placeholder-amber-600/60 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:!border-transparent"
          />
          <button
            onClick={joinGroup}
            className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3 text-white font-semibold shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Share2 size={18} />
            Join Group
          </button>
        </div>
      </Modal>
      {/* ADDED: Invite Code Modal */}
      <Modal open={showInviteModal} onClose={() => setShowInviteModal(false)}>
        <h3 className="mb-4 text-xl font-bold text-amber-900 text-center">Group Invite Code</h3>
        <div className="text-center mb-4">
          <div className="text-2xl font-bold text-amber-600 bg-amber-100 rounded-xl py-4 px-6 mb-3">
            {activeGroup?.inviteCode || shareCode}
          </div>
          <p className="text-amber-600 text-sm mb-4">
            Share this code with others to join your group
          </p>
        </div>
        <div className="space-y-3">
          <input
            value={shareLink || `${window.location.origin}/groups?code=${activeGroup?.inviteCode || shareCode}`}
            readOnly
            className="w-full rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900 text-sm"
          />
          <button
            onClick={async () => {
              try {
                const linkToCopy = shareLink || `${window.location.origin}/groups?code=${activeGroup?.inviteCode || shareCode}`;
                await navigator.clipboard.writeText(linkToCopy);
                alert('Invite link copied to clipboard!');
              } catch (err) {
                console.error('Failed to copy: ', err);
                // Fallback method
                const input = document.createElement('input');
                input.value = shareLink || `${window.location.origin}/groups?code=${activeGroup?.inviteCode || shareCode}`;
                document.body.appendChild(input);
                input.select();
                document.execCommand('copy');
                document.body.removeChild(input);
                alert('Invite link copied to clipboard!');
              }
            }}
            className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-white font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Copy size={18} />
            Copy Invite Link
          </button>
        </div>
      </Modal>

      {/* Member Detailed Report Modal */}
      {showMemberModal && selectedMemberReport && memberAnalytics && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="max-h-[90vh] w-[1000px] max-w-[95vw] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl border border-amber-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-amber-900">{selectedMemberReport.member?.name}'s Detailed Progress</h2>
                <div className="text-amber-600">Comprehensive performance analytics</div>
              </div>
              <button
                className="rounded-xl bg-amber-100 px-4 py-2 text-amber-700 hover:bg-amber-200 transition-colors"
                onClick={() => setShowMemberModal(false)}
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-indigo-600 p-4 text-white text-center">
                  <div className="text-2xl font-bold">{memberAnalytics.overallProgress}%</div>
                  <div className="text-amber-100 text-sm">Overall Progress</div>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 p-4 text-white text-center">
                  <div className="text-2xl font-bold">{memberAnalytics.sessionsCompleted}</div>
                  <div className="text-green-100 text-sm">Sessions</div>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 p-4 text-white text-center">
                  <div className="text-2xl font-bold">{memberAnalytics.totalPracticeTime}</div>
                  <div className="text-orange-100 text-sm">Practice Time</div>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 p-4 text-white text-center">
                  <div className="text-2xl font-bold">{memberAnalytics.currentStreak}</div>
                  <div className="text-purple-100 text-sm">Day Streak</div>
                </div>
              </div>

              {/* Accuracy Trend Chart */}
              <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-6 border border-amber-200">
                <h3 className="text-lg font-bold text-amber-900 mb-4">Accuracy Trend</h3>
                <div className="flex items-end justify-between h-48 space-x-2">
                  {memberSessions.map((session, index) => {
                    const value = Math.min(100, Math.round((Number(session.points) || 0) * 1));
                    const label = new Date(session.startedAt).toLocaleDateString();
                    return (
                      <div key={index} className="flex flex-1 flex-col items-center">
                        <div className="mb-2 text-sm font-semibold text-amber-700">{value}%</div>
                        <div
                          className="w-full rounded-t-lg bg-gradient-to-t from-amber-500 to-orange-500 transition-all duration-500"
                          style={{ height: `${(value / 100) * 160}px` }}
                        ></div>
                        <div className="mt-2 text-xs text-amber-600">{label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mudra Performance & Focus Areas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 p-6 border border-green-200">
                  <h3 className="text-lg font-bold text-green-900 mb-4">Mudra Performance</h3>
                  <div className="space-y-4">
                    {memberAnalytics.mudraBreakdown.map((mudra, index) => (
                      <div key={index} className="rounded-xl bg-white p-4 shadow-sm border border-green-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-green-900">{mudra.name}</span>
                          <span className="text-lg font-bold text-green-600">{mudra.accuracy}%</span>
                        </div>
                        <div className="w-full bg-green-100 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${mudra.accuracy}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-sm text-green-700 mt-1">
                          <span>Practiced {mudra.practiceCount} times</span>
                          <span className={mudra.improvement >= 0 ? 'text-green-600' : 'text-red-500'}>
                            {mudra.improvement >= 0 ? '↑' : '↓'} {Math.abs(mudra.improvement)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 p-6 border border-rose-200">
                  <h3 className="text-lg font-bold text-rose-900 mb-4">Focus Areas</h3>
                  <div className="space-y-4">
                    {memberAnalytics.improvementAreas.map((area, index) => (
                      <div key={index} className="rounded-xl bg-white p-4 shadow-sm border border-rose-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-rose-900">{area.mudra}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${area.priority === 'high' ? 'bg-red-100 text-red-800' :
                            area.priority === 'medium' ? 'bg-amber-100 text-amber-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                            {area.priority} priority
                          </span>
                        </div>
                        <div className="text-sm text-rose-700">{area.issue}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GroupLearning;