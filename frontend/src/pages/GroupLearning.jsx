import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useUser } from "@clerk/clerk-react";

// UI helpers
function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative w-[420px] max-w-[92vw] rounded-xl bg-white p-5 shadow-xl">
        <button
          className="absolute right-3 top-3 text-[#8C3B26] hover:text-[#D94F3D]"
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

  // Fetch user groups (on mount)
  useEffect(() => {
    const load = async () => {
      const clerkId = user?.id || currentUser?._id;
      if (!clerkId) return;
      try {
        const { data } = await axios.get(`http://localhost:5000/api/groups`, { params: { clerkId } });
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
        const { data } = await axios.get(`http://localhost:5000/api/groups/${activeGroup._id}/chat`);
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
      const { data } = await axios.post(`http://localhost:5000/api/groups`, { name: groupName, adminClerkId });
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
      const { data } = await axios.post(`http://localhost:5000/api/groups/join`, { inviteCode, clerkId });
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
      await axios.post(`http://localhost:5000/api/groups/${activeGroup._id}/chat`, { clerkId, message: chatText });
      setGroupChat([...groupChat, { clerkId, name: user?.fullName || currentUser?.name || 'You', message: chatText, createdAt: new Date().toISOString() }]);
      setChatText("");
    } catch (e) {
      console.error('Failed to send message', e);
    }
  };

  const handleProgressReport = async () => {
    if (!activeGroup?._id) return;
    try {
      const { data } = await axios.get(`http://localhost:5000/api/groups/${activeGroup._id}/progress`);
      setProgressReport(data);
      setSelectedMemberReport(null);
    } catch (e) {
      console.error('Failed to load progress', e);
      setProgressReport(null);
    }
  };

  const loadMemberReport = async (clerkId) => {
    if (!activeGroup?._id || !clerkId) return;
    try {
      const safeId = encodeURIComponent(clerkId);
      const [detailRes, sessionsRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/groups/${activeGroup._id}/member-progress`, { params: { clerkId } }),
        axios.get(`http://localhost:5000/api/users/${safeId}/sessions`)
      ]);
      setSelectedMemberReport(detailRes.data);
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

  const isDetail = Boolean(activeGroup);
  return (
    <div className="min-h-screen bg-[#2a1a06]/95 pt-20 px-4">
      {/* HEADER BAR WHEN IN DETAIL VIEW */}
      {isDetail && (
        <div className="mx-auto mb-4 flex max-w-6xl items-center justify-between rounded-xl border border-[#FFD34E]/30 bg-white/95 p-3 shadow-md">
          <div className="flex items-center gap-3">
            <button onClick={() => { setActiveGroup(null); setProgressReport(null); }} className="rounded-md bg-[#FFF9E6] px-3 py-1 text-[#8C3B26] hover:bg-[#FFD34E]/40">← Back to Groups</button>
            <div>
              <div className="text-lg font-semibold text-[#8B4513]">{activeGroup.name}</div>
              <div className="text-xs text-[#8C3B26]/70">{activeGroup.members.length} members</div>
            </div>
          </div>
          <div className="hidden md:block text-xs text-[#8C3B26]/70">Admin: {activeGroup.adminClerkId}</div>
        </div>
      )}
      <div className={`mx-auto grid max-w-6xl grid-cols-1 gap-6 ${isDetail ? 'md:grid-cols-[1fr,320px]' : 'md:grid-cols-[320px,1fr]'}` }>
        {!isDetail && (
        <div className="rounded-xl border border-[#FFD34E]/30 bg-white/95 p-4 shadow-md">
          <h3 className="mb-3 text-lg font-semibold text-[#8B4513]">Groups</h3>
          <button
            onClick={() => setShowGroupModal(true)}
            className="mb-3 w-full rounded-lg bg-gradient-to-r from-[#D94F3D] to-[#8B0000] px-4 py-2 text-white transition hover:from-[#B33C2D] hover:to-[#660000]"
          >
          Create Group
        </button>
          <div className="mt-2">
          <input
            value={inviteCode}
            onChange={e=>setInviteCode(e.target.value)}
            placeholder="Enter invite code to join"
              className="mb-2 w-full rounded-md border border-[#FFD34E]/50 bg-[#FFF9E6] px-3 py-2 text-[#8C3B26] placeholder-[#8C3B26]/60 focus:outline-none focus:ring-2 focus:ring-[#FFD34E]"
            />
            <button
              onClick={joinGroup}
              className="w-full rounded-lg bg-[#D94F3D] px-4 py-2 text-white transition hover:bg-[#8B0000]"
            >
              Join Group
            </button>
        </div>
        {errorMsg && (
            <div className="mt-2 text-sm text-red-700">{errorMsg}</div>
        )}
          <ul className="mt-3 space-y-2">
          {groups.map(g => (
              <li key={g._id}>
                <button
                  className={`w-full rounded-md border px-3 py-2 text-left transition ${activeGroup && activeGroup._id===g._id ? 'border-[#5CC8FF] bg-[#E6F7FF]' : 'border-[#FFD34E]/40 bg-white hover:bg-[#FFF9E6]'}`}
                  onClick={()=>setActiveGroup(g)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[#8C3B26]">{g.name}</span>
                    <span className="text-xs text-[#8C3B26]/70">{g.adminClerkId === (user?.id || currentUser?._id) ? 'Admin' : ''}</span>
                  </div>
                </button>
            </li>
          ))}
        </ul>
      </div>
        )}

        {/* Center: Chat */}
        <div className="rounded-xl border border-[#FFD34E]/30 bg-white/95 p-0 shadow-md">
        {activeGroup ? (
            <div className="flex h-[70vh] min-h-[460px] flex-col">
              <div className="flex items-center justify-between border-b border-[#FFD34E]/40 px-4 py-3">
            <div>
                  <h2 className="text-lg font-semibold text-[#8B4513]">{activeGroup.name}</h2>
                  <div className="text-xs text-[#8C3B26]/70">{activeGroup.members.length} members</div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-3">
                <div className="space-y-2 text-[#8C3B26]">
                  {groupChat.map((msg,idx) => {
                    const ts = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : '';
                    const mine = (msg.clerkId === (user?.id || currentUser?._id));
                    return (
                      <div key={idx} className={`max-w-[80%] rounded-lg px-3 py-2 text-sm shadow-sm ${mine ? 'ml-auto bg-[#E6F7FF] text-[#074f57]' : 'bg-[#FFF9E6] text-[#8C3B26]'}`}>
                        <div className="mb-0.5 flex items-center justify-between gap-4">
                          <b className="text-xs">{msg.name || msg.clerkId}</b>
                          <span className="text-[10px] text-gray-500">{ts}</span>
                        </div>
                        <div>{msg.message}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="border-t border-[#FFD34E]/40 p-3">
                <div className="flex gap-2">
                  <input
                    value={chatText}
                    onChange={e=>setChatText(e.target.value)}
                    onKeyDown={e=>{if(e.key==="Enter")sendMessage();}}
                    placeholder="Type a message"
                    className="flex-1 rounded-full border border-[#FFD34E]/50 bg-white px-4 py-2 text-[#8C3B26] placeholder-[#8C3B26]/60 focus:outline-none focus:ring-2 focus:ring-[#FFD34E]"
                  />
                  <button
                    onClick={sendMessage}
                    className="rounded-full bg-[#D94F3D] px-5 py-2 text-white hover:bg-[#8B0000]"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="m-10 text-[#666]">Select a group to start collaborating.</div>
          )}
        </div>

        {/* Right: Details & Progress */}
        {isDetail && (
          <div className="hidden rounded-xl border border-[#FFD34E]/30 bg-white/95 p-4 shadow-md md:block">
            <div className="mb-4">
              <div className="mb-2 text-sm font-semibold text-[#8B4513]">Members</div>
              <ul className="max-h-56 space-y-1 overflow-y-auto rounded-md border border-[#FFD34E]/40 bg-[#FFF9E6] p-2 text-sm text-[#8C3B26]">
                {activeGroup.members.map(m => {
                  const isSel = selectedMemberReport?.member?.clerkId === m.clerkId;
                  return (
                    <li key={m.clerkId || m.name}>
                      <button
                        onClick={() => loadMemberReport(m.clerkId)}
                        className={`w-full rounded px-2 py-1 text-left hover:bg-white ${isSel ? 'bg-white font-semibold' : ''}`}
                      >
                        {m.name}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
              {activeGroup.adminClerkId === (user?.id || currentUser?._id) && (
              <button
                onClick={handleProgressReport}
                className="mb-3 w-full rounded-lg bg-gradient-to-r from-[#FFD34E] to-[#D94F3D] px-3 py-2 text-[#8B4513] hover:from-[#F2C736] hover:to-[#C53A29]"
              >
                  Generate Progress Report
                </button>
              )}
            {selectedMemberReport ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <h4 className="mb-2 font-semibold text-amber-900">{selectedMemberReport.member?.name}</h4>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="rounded-md bg-white p-2 text-center shadow-sm">Total<br/><span className="text-lg font-bold text-amber-700">{selectedMemberReport.totalPoints}</span></div>
                  <div className="rounded-md bg-white p-2 text-center shadow-sm">Avg<br/><span className="text-lg font-bold text-amber-700">{Math.round(selectedMemberReport.average || 0)}</span></div>
                  <div className="rounded-md bg-white p-2 text-center shadow-sm">Sessions<br/><span className="text-lg font-bold text-amber-700">{selectedMemberReport.sessionsCount}</span></div>
                </div>
                <div className="mt-3 max-h-32 overflow-y-auto rounded-md bg-white p-2 text-xs text-[#8C3B26] shadow-inner">
                  {selectedMemberReport.sessions?.slice(-20).map((s, i) => (
                    <div key={i} className="flex items-center justify-between border-b py-1 last:border-b-0">
                      <span>Points: {s.points}</span>
                      <span className="text-[10px] text-gray-500">{s.startedAt ? new Date(s.startedAt).toLocaleDateString() : ''}</span>
                    </div>
                  ))}
                </div>
                <button onClick={()=>setShowMemberModal(true)} className="mt-3 w-full rounded-md bg-[#D94F3D] px-3 py-2 text-sm text-white hover:bg-[#8B0000]">View full report</button>
              </div>
            ) : progressReport && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                <h4 className="mb-2 font-semibold text-emerald-800">Group Progress</h4>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="rounded-md bg-white p-2 text-center shadow-sm">Avg<br/><span className="text-lg font-bold text-emerald-700">{Math.round(progressReport.average || 0)}</span></div>
                  <div className="rounded-md bg-white p-2 text-center shadow-sm">Median<br/><span className="text-lg font-bold text-emerald-700">{Math.round(progressReport.median || 0)}</span></div>
                  <div className="rounded-md bg-white p-2 text-center shadow-sm">Mode<br/><span className="text-lg font-bold text-emerald-700">{Math.round(progressReport.mode || 0)}</span></div>
                </div>
                <div className="mt-3">
                  <strong className="text-emerald-900">Members:</strong>
                  <ul className="mt-1 list-disc pl-5 text-emerald-900">
                      {progressReport.memberSummaries?.map(m => (
                        <li key={m.clerkId}>{m.name} — {m.totalPoints} pts across {m.sessions} sessions</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
        )}

        {/* Member Detailed Report Modal */}
        {showMemberModal && selectedMemberReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="max-h-[90vh] w-[900px] max-w-[95vw] overflow-y-auto rounded-xl bg-white p-5 shadow-xl">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold text-[#8B4513]">{selectedMemberReport.member?.name}</div>
                  <div className="text-xs text-[#8C3B26]/70">Detailed Progress</div>
                </div>
                <button className="rounded-md px-3 py-1 text-[#8C3B26] hover:bg-[#FFF9E6]" onClick={()=>setShowMemberModal(false)}>Close</button>
              </div>
              {memberAnalytics && (
                <>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="rounded-2xl border border-[#FFD34E]/30 bg-white p-4">
                      <div className="text-sm text-[#8C3B26]">Overall Progress</div>
                      <div className="text-2xl font-bold text-[#8B4513]">{memberAnalytics.overallProgress}%</div>
                    </div>
                    <div className="rounded-2xl border border-[#FFD34E]/30 bg-white p-4">
                      <div className="text-sm text-[#8C3B26]">Practice Time</div>
                      <div className="text-2xl font-bold text-[#8B4513]">{memberAnalytics.totalPracticeTime}</div>
                    </div>
                    <div className="rounded-2xl border border-[#FFD34E]/30 bg-white p-4">
                      <div className="text-sm text-[#8C3B26]">Sessions</div>
                      <div className="text-2xl font-bold text-[#8B4513]">{memberAnalytics.sessionsCompleted}</div>
                    </div>
                    <div className="rounded-2xl border border-[#FFD34E]/30 bg-white p-4">
                      <div className="text-sm text-[#8C3B26]">Current Streak</div>
                      <div className="text-2xl font-bold text-[#8B4513]">{memberAnalytics.currentStreak} days</div>
                    </div>
                  </div>
                  <div className="mt-4 rounded-2xl border border-[#FFD34E]/30 bg-white p-4">
                    <div className="mb-2 flex items-center justify-between text-[#8B4513]">
                      <div>Accuracy Trend</div>
                    </div>
                    <div className="flex h-48 items-end justify-between space-x-2">
                      {memberSessions.map((s, index) => {
                        const value = Math.min(100, Math.round((Number(s.points) || 0) * 1));
                        const label = new Date(s.startedAt).toLocaleDateString();
                        return (
                          <div key={index} className="flex flex-1 flex-col items-center">
                            <div className="mb-1 text-xs text-[#8C3B26]">{value}</div>
                            <div className="w-full rounded-t-lg bg-gradient-to-t from-[#D94F3D] to-[#FFD34E]" style={{ height: `${(value / 100) * 160}px` }}></div>
                            <div className="mt-1 text-xs text-[#8C3B26]">{label}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-[#FFD34E]/30 bg-white p-4">
                      <div className="mb-2 text-[#8B4513]">Mudra Performance</div>
                      <div className="space-y-3">
                        {memberAnalytics.mudraBreakdown.map((mudra, index) => (
                          <div key={index} className="rounded-lg border border-[#FFD34E]/50 bg-[#FFF9E6] p-3">
                            <div className="mb-1 flex items-center justify-between">
                              <div className="font-semibold text-[#8B4513]">{mudra.name}</div>
                              <div className="text-lg font-bold text-[#D94F3D]">{mudra.accuracy}%</div>
                            </div>
                            <div className="h-2 w-full rounded-full bg-gray-200">
                              <div className="h-2 rounded-full bg-gradient-to-r from-[#FFD34E] to-[#D94F3D]" style={{ width: `${mudra.accuracy}%` }}></div>
                            </div>
                            <div className="mt-1 flex justify-between text-xs text-[#8C3B26]"><span>Practiced {mudra.practiceCount} times</span><span>{mudra.improvement >= 0 ? '↑' : '↓'} {Math.abs(mudra.improvement)}%</span></div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-[#FFD34E]/30 bg-white p-4">
                      <div className="mb-2 text-[#8B4513]">Focus Areas</div>
                      <div className="space-y-3">
                        {memberAnalytics.improvementAreas.map((area, index) => (
                          <div key={index} className="rounded-lg border border-[#FFD34E]/50 bg-[#FFF9E6] p-3">
                            <div className="mb-1 flex items-center justify-between">
                              <div className="font-semibold text-[#8B4513]">{area.mudra}</div>
                              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${area.priority === 'high' ? 'bg-red-100 text-red-800' : area.priority === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>{area.priority} priority</span>
                            </div>
                            <div className="text-sm text-[#8C3B26]">{area.issue}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

      {/* Modal for new group */}
      <Modal open={showGroupModal} onClose={()=>setShowGroupModal(false)}>
          <h3 className="mb-3 text-lg font-semibold text-[#8B4513]">Create New Group</h3>
        <form onSubmit={e=>{e.preventDefault(); createGroup();}}>
          <input
            value={groupName}
            onChange={e=>setGroupName(e.target.value)}
            placeholder="Group name"
            required
              className="mb-3 w-full rounded-md border border-[#FFD34E]/50 bg-[#FFF9E6] px-3 py-2 text-[#8C3B26] placeholder-[#8C3B26]/60 focus:outline-none focus:ring-2 focus:ring-[#FFD34E]"
          />
            <button type="submit" className="w-full rounded-lg bg-gradient-to-r from-[#FFD34E] to-[#D94F3D] px-4 py-2 text-[#8B4513] hover:from-[#F2C736] hover:to-[#C53A29]">Create</button>
        </form>
        {shareCode && (
            <div className="mt-3 text-sm text-[#8C3B26]">
            Share this invite code with members: <b>{shareCode}</b>
          </div>
        )}
      </Modal>
      </div>

      {shareCode && (
        <div className="fixed bottom-4 right-4 rounded-xl border border-[#FFD34E]/40 bg-white p-4 shadow-lg">
          <div className="mb-1 font-semibold text-[#8B4513]">Invite</div>
          <div className="text-sm text-[#8C3B26]">Code: <b>{shareCode}</b></div>
          {shareLink && (
            <div className="mt-2">
              <div className="break-all text-xs text-[#8C3B26]">{shareLink}</div>
              <button onClick={() => { navigator.clipboard.writeText(shareLink); }} className="mt-2 rounded-md bg-[#D94F3D] px-3 py-1 text-xs text-white hover:bg-[#8B0000]">Copy Link</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GroupLearning;
