import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useUser } from "@clerk/clerk-react";

// UI helpers
function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", top:0, left:0, right:0, bottom:0,
      background:"rgba(0,0,0,0.3)", display:"flex", alignItems:"center", justifyContent:"center"}}>
      <div style={{background:"white", padding:20, borderRadius:8, width:400}}>
        <button style={{float:"right"}} onClick={onClose}>x</button>
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
    } catch (e) {
      console.error('Failed to load progress', e);
      setProgressReport(null);
    }
  };

  return (
    <div style={{display:"flex", gap:40, paddingTop: 80}}>
      <div style={{flex:"0 0 260px"}}>
        <h3>Groups</h3>
        <button onClick={() => setShowGroupModal(true)}>
          Create Group
        </button>
        <div style={{ marginTop: 10 }}>
          <input
            value={inviteCode}
            onChange={e=>setInviteCode(e.target.value)}
            placeholder="Enter invite code to join"
            style={{width:"100%",padding:6, marginBottom:6}}
          />
          <button onClick={joinGroup} style={{ width: '100%' }}>Join Group</button>
        </div>
        {errorMsg && (
          <div style={{marginTop:8, color:'#b91c1c'}}>{errorMsg}</div>
        )}
        <ul style={{listStyle:"none", padding:0}}>
          {groups.map(g => (
            <li key={g._id} style={{margin:"10px 0"}}>
                <button style={{
                  width:"100%", padding:8, background:activeGroup && activeGroup._id===g._id ? "#D3F2FF":"#fff"
                }} onClick={()=>setActiveGroup(g)}>
                  {g.name}
                  {g.adminClerkId === (user?.id || currentUser?._id) && " (Admin)"}
                </button>
            </li>
          ))}
        </ul>
      </div>

      <div style={{flex:1}}>
        {activeGroup ? (
          <>
            <h2>Group: {activeGroup.name}</h2>
            <div>
              <strong>Admin:</strong> {activeGroup.adminClerkId}
            </div>
            <div>
              <strong>Members:</strong> {activeGroup.members.map(m=>m.name).join(", ")}
            </div>
            <div style={{margin:"16px 0"}}>
              {activeGroup.adminClerkId === (user?.id || currentUser?._id) && (
                <button onClick={handleProgressReport}>
                  Generate Progress Report
                </button>
              )}
              {progressReport && (
                <div style={{marginTop:8, background:"#e6f0fa",padding:10, borderRadius:6}}>
                  <h4>Group Progress</h4>
                  <div>Average: {Math.round(progressReport.average || 0)}</div>
                  <div>Median: {Math.round(progressReport.median || 0)}</div>
                  <div>Mode: {Math.round(progressReport.mode || 0)}</div>
                  <div style={{marginTop:6}}>
                    <strong>Members:</strong>
                    <ul>
                      {progressReport.memberSummaries?.map(m => (
                        <li key={m.clerkId}>{m.name} — {m.totalPoints} pts across {m.sessions} sessions</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div style={{
              border:"1px solid #ddd", padding:10, borderRadius:6, background:"#f6f6f6", marginBottom:10
            }}>
              <h4>Group Chat</h4>
              <div style={{maxHeight:200, overflowY:"auto", marginBottom: 6}}>
                {groupChat.map((msg,idx) => {
                  const ts = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : '';
                  return (
                    <div key={idx}>
                      <b>{msg.name || msg.clerkId}:</b> {msg.message}
                      <span style={{fontSize:"0.8em",color:"#888", marginLeft:10}}>{ts}</span>
                    </div>
                  );
                })}
              </div>
              <input
                value={chatText}
                onChange={e=>setChatText(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter")sendMessage();}}
                placeholder="Say something..."
                style={{width:"80%",padding:6,marginRight:8}}
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </>
        ) : (
          <div style={{margin:40, color:"#666"}}>Select a group to start collaborating.</div>
        )}
      </div>

      {/* Modal for new group */}
      <Modal open={showGroupModal} onClose={()=>setShowGroupModal(false)}>
        <h3>Create New Group</h3>
        <form onSubmit={e=>{e.preventDefault(); createGroup();}}>
          <input
            value={groupName}
            onChange={e=>setGroupName(e.target.value)}
            placeholder="Group name"
            required
            style={{width:"100%",padding:8, marginBottom:12}}
          />
          <button type="submit">Create</button>
        </form>
        {shareCode && (
          <div style={{marginTop:10, fontSize:"0.9em"}}>
            Share this invite code with members: <b>{shareCode}</b>
          </div>
        )}
      </Modal>
      {shareCode && (
        <div style={{position:'fixed', bottom:16, right:16, background:'#fff', border:'1px solid #ddd', borderRadius:8, padding:12, boxShadow:'0 2px 8px rgba(0,0,0,0.1)'}}>
          <div style={{fontWeight:600, marginBottom:6}}>Invite</div>
          <div style={{fontSize:'0.9em'}}>Code: <b>{shareCode}</b></div>
          {shareLink && (
            <div style={{marginTop:6}}>
              <div style={{fontSize:'0.85em', wordBreak:'break-all'}}>{shareLink}</div>
              <button onClick={() => { navigator.clipboard.writeText(shareLink); }} style={{marginTop:6}}>Copy Link</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GroupLearning;
