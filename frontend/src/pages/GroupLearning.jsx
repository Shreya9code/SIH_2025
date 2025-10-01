import React, { useState, useEffect } from "react";

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
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupChat, setGroupChat] = useState([]);
  const [chatText, setChatText] = useState("");
  const [progressReport, setProgressReport] = useState(null);

  // Fetch user groups (on mount)
  useEffect(() => {
    // Replace with your fetch (GET /api/groups)
    // Example: fetch(`/api/groups?userId=${currentUser._id}`)
    setGroups([]); // placeholder: []
  }, [currentUser]);

  // Fetch group chat when switching groups
  useEffect(() => {
    if (activeGroup) {
      // Replace with actual fetch (GET /api/groups/:id/chat)
      setGroupChat([]); // placeholder: []
      setProgressReport(null);
    }
  }, [activeGroup]);

  const createGroup = async () => {
    // Replace with POST /api/groups
    // Example payload: { name: groupName, adminId: currentUser._id }
    const newGroup = {
      _id: Date.now()+""+Math.random(),
      name: groupName,
      admin: currentUser,
      members: [currentUser],
    };
    setGroups([...groups, newGroup]);
    setShowGroupModal(false);
    setGroupName("");
  };

  const sendMessage = async () => {
    if (!chatText) return;
    // POST /api/groups/:groupId/chat
    setGroupChat([...groupChat, {user: currentUser, message: chatText, time: new Date().toLocaleTimeString()}]);
    setChatText("");
  };

  const handleProgressReport = async () => {
    // GET /api/groups/:groupId/progress
    setProgressReport({
      completedTasks: Math.floor(Math.random()*20),
      totalTasks: 20,
      members: activeGroup.members,
    });
  };

  return (
    <div style={{display:"flex", gap:40}}>
      <div style={{flex:"0 0 200px"}}>
        <h3>Groups</h3>
        <button onClick={() => setShowGroupModal(true)}>
          Create Group
        </button>
        <ul style={{listStyle:"none", padding:0}}>
          {groups.map(g => (
            <li key={g._id} style={{margin:"10px 0"}}>
                <button style={{
                  width:"100%", padding:8, background:activeGroup && activeGroup._id===g._id ? "#D3F2FF":"#fff"
                }} onClick={()=>setActiveGroup(g)}>
                  {g.name}
                  {g.admin._id === currentUser._id && " (Admin)"}
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
              <strong>Admin:</strong> {activeGroup.admin.name}
            </div>
            <div>
              <strong>Members:</strong> {activeGroup.members.map(m=>m.name).join(", ")}
            </div>
            <div style={{margin:"16px 0"}}>
              {activeGroup.admin._id === currentUser._id && (
                <button onClick={handleProgressReport}>
                  Generate Progress Report
                </button>
              )}
              {progressReport && (
                <div style={{marginTop:8, background:"#e6f0fa",padding:10, borderRadius:6}}>
                  <h4>Progress Report</h4>
                  Completed: {progressReport.completedTasks} / {progressReport.totalTasks}<br/>
                  Members: {progressReport.members.map(m=>m.name).join(", ")}
                </div>
              )}
            </div>

            <div style={{
              border:"1px solid #ddd", padding:10, borderRadius:6, background:"#f6f6f6", marginBottom:10
            }}>
              <h4>Group Chat</h4>
              <div style={{maxHeight:200, overflowY:"auto", marginBottom: 6}}>
                {groupChat.map((msg,idx) =>
                  <div key={idx}>
                    <b>{msg.user.name}:</b> {msg.message}
                    <span style={{fontSize:"0.8em",color:"#888", marginLeft:10}}>{msg.time}</span>
                  </div>
                )}
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
      </Modal>
    </div>
  );
}

export default GroupLearning;
