import sys
print(sys.executable)
import streamlit as st
from langgraph_backend import chatbot
from langchain_core.messages import HumanMessage, SystemMessage
import uuid

# Set wide layout
st.set_page_config(layout="wide", initial_sidebar_state="expanded")

# Custom CSS
st.markdown("""
<style>
    /* Main app background */
    .stApp {
        background: linear-gradient(135deg, #FFFBFF 0%, #FFF8F5 100%);
    }
    
    /* Headers */
    .main-header {
        font-size: 3rem;
        background: linear-gradient(135deg, #FFB74D 0%, #FF9800 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-align: center;
        margin-bottom: 1rem;
        font-weight: 700;
        font-family: 'Georgia', serif;
    }
    
    /* Chat messages */
    .chat-message {
        padding: 0.8rem;
        border-radius: 15px;
        margin: 0.5rem 0;
        box-shadow: 0 2px 8px rgba(139, 69, 19, 0.08);
        border: 1px solid;
        font-size: 0.9rem; /* smaller text */
        width: fit-content;
    }
    
    .user-message {
        background: linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%);
        border-color: #FFD54F;
        border-left: 5px solid #FFB74D;
        margin-left: auto !important;
        margin-right: 0 !important;
        text-align: left;
        max-width: 70%;
    }
    
    .assistant-message {
        background: linear-gradient(135deg, #F1F8E9 0%, #E8F5E8 100%);
        border-color: #AED581;
        border-left: 5px solid #81C784;
        margin-right: auto !important;
        margin-left: 0 !important;
        text-align: left;
        max-width: 70%;
    }
    
    /* Sidebar styling */
    section[data-testid="stSidebar"] {
        background: linear-gradient(180deg, #E8F5E9 0%, #C8E6C9 100%) !important;
        width: 400px !important; /* increased width */
    }
    
    section[data-testid="stSidebar"] > div {
        background: transparent !important;
    }
    
    .sidebar-content {
        background: rgba(255, 255, 255, 0.9);
        padding: 1.5rem;
        border-radius: 15px;
        margin: 0.5rem 0;
        border: 1px solid rgba(255, 255, 255, 0.5);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
    
    /* Buttons */
    .stButton button {
        background: linear-gradient(135deg, #C8E6C9 0%, #81C784 100%) !important;
        color: #2E7D32 !important;
        border: none !important;
        padding: 0.7rem 1rem !important;
        border-radius: 12px !important;
        font-weight: 500 !important;
        transition: all 0.3s ease !important;
        box-shadow: 0 2px 6px rgba(129, 199, 132, 0.3) !important;
    }
    
    .stButton button:hover {
        transform: translateY(-1px) !important;
        box-shadow: 0 3px 10px rgba(129, 199, 132, 0.5) !important;
        background: linear-gradient(135deg, #81C784 0%, #66BB6A 100%) !important;
        color: #1B5E20 !important;
    }
    
    /* Toggle */
    .stToggle {
        background: rgba(255, 255, 255, 0.8);
        border-radius: 12px;
        padding: 0.5rem;
        border: 1px solid rgba(255, 181, 77, 0.3);
    }
    
    /* Chat input */
    .stChatInput input {
        background: rgba(255, 255, 255, 0.95);
        border: 2px solid #FFE0B2;
        border-radius: 25px;
        color: #8D6E63;
        padding: 1rem 1.5rem;
    }
    
    .stChatInput input:focus {
        border-color: #AED581;
        box-shadow: 0 0 0 2px rgba(174, 213, 129, 0.2);
    }
    
    /* Mudra info box */
    .mudra-info {
        background: linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%);
        padding: 1.5rem;
        border-radius: 15px;
        border-left: 5px solid #FFD54F;
        margin: 1rem 0;
        box-shadow: 0 2px 8px rgba(139, 69, 19, 0.05);
    }
    
    /* Force main container to use full width */
    .main .block-container {
        padding-left: 2rem;
        padding-right: 2rem;
        max-width: 100%;
    }
</style>
""", unsafe_allow_html=True)

# Session state
if 'message_history' not in st.session_state:
    st.session_state.message_history = []
if 'thread_id' not in st.session_state:
    st.session_state.thread_id = str(uuid.uuid4())
if 'expert_mode' not in st.session_state:
    st.session_state.expert_mode = False

# Header
st.markdown('<div class="main-header">🪷 NrityaLens AI Assistant</div>', unsafe_allow_html=True)

# Sidebar
with st.sidebar:
    # Sidebar header - now greenish
    st.markdown("""
    <div style='
        background: linear-gradient(135deg, #C8E6C9 0%, #81C784 100%);
        padding: 1.5rem;
        border-radius: 15px;
        margin-bottom: 1.5rem;
        color: #2E7D32;
        text-align: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    '>
        <h2 style='color: #2E7D32; margin: 0; font-family: Georgia, serif;'>🎭 Mudra Guide</h2>
        <p style='margin: 0.5rem 0 0 0; opacity: 0.8;'>Your hand gesture expert</p>
    </div>
    """, unsafe_allow_html=True)

    # Mudra reference
    st.markdown("""
    **Common Mudras to explore:**
    - 🟫 **Pataka** (flag) - Starting, clouds
    - 🟧 **Tripataka** (three-part flag) - Crown, tree
    - 🟨 **Ardhapataka** (half flag) - Spear, tower  
    - 🟩 **Kartarimukha** (scissors) - Separation
    - 🟦 **Mayura** (peacock) - Elegance, beauty
    - 🌙 **Ardhachandra** (half moon) - Moon, grace
    - 🏔️ **Shikhara** (spire) - Strength, power
    - 🍎 **Kapitta** (elephant apple) - Offering
    - 🔗 **Kataka** (link) - Connection, chain
    - 🪡 **Suchi** (needle) - Pointing, focus
    """)
    
    st.divider()
        
    # Expert mode toggle
    expert_mode = st.toggle("🔬 Expert Mode", value=st.session_state.expert_mode,
                          help="Enable for detailed technical analysis")
    st.session_state.expert_mode = expert_mode
    
    if expert_mode:
        st.info("Detailed analysis enabled")
    
    # Quick Actions inside sidebar
    st.subheader("🚀 Quick Actions")
    
    if st.button("🆕 New Chat", use_container_width=True):
        st.session_state.message_history = []
        st.session_state.thread_id = str(uuid.uuid4())
        st.rerun()

    if st.button("💾 Save Conversation", use_container_width=True):
        st.success("Conversation saved!")
    
    st.markdown('</div>', unsafe_allow_html=True)

# Display chat messages
for message in st.session_state.message_history:
    if message["role"] == "user":
        st.markdown(f"""
        <div class="chat-message user-message">
            <strong style='color: #8D6E63;'>You:</strong><br>
            <div style='margin-top: 0.5rem; color: #8D6E63; line-height: 1.4; font-size: 0.9rem;'>{message["content"]}</div>
        </div>
        """, unsafe_allow_html=True)
    else:
        st.markdown(f"""
        <div class="chat-message assistant-message">
            <strong style='color: #689F38;'>🧘‍♀️ Mudra Expert:</strong><br>
            <div style='margin-top: 0.5rem; color: #558B2F; line-height: 1.4; font-size: 0.9rem;'>{message["content"]}</div>
        </div>
        """, unsafe_allow_html=True)

# Show welcome message only if no chat history
if not st.session_state.message_history:
    st.markdown("""
    <div style='
        text-align: center; 
        padding: 3rem; 
        color: #A1887F;
        background: rgba(255, 255, 255, 0.6);
        border-radius: 20px;
        margin: 2rem 0;
        border: 1px solid rgba(255, 213, 79, 0.2);
    '>
        <div style='font-size: 4rem; margin-bottom: 1rem;'>🪷</div>
        <h3 style='color: #8D6E63;'>Welcome to NrityaLens AI</h3>
        <p>Try these sample questions!</p>
        <p> "Explain the Pataka mudra",
            "What are the uses of Tripataka in Bharatanatyam?",
            "Show me mudras for expressing emotions",
            "Difference between Ardhapataka and Kartarimukha"
        </p>
    </div>
    """, unsafe_allow_html=True)

# Chat input
user_input = st.chat_input("💭 Ask about dance mudras...")

if user_input:
    # Immediately add user message to history and display it
    st.session_state.message_history.append({"role": "user", "content": user_input})
    
    # Rerun to show the user message immediately
    st.rerun()

# Process AI response after showing user message
if (st.session_state.message_history and 
    st.session_state.message_history[-1]["role"] == "user" and
    not any(msg["role"] == "assistant" for msg in st.session_state.message_history[-1:])):
    
    user_input = st.session_state.message_history[-1]["content"]
    
    messages = [HumanMessage(content=user_input)]
    if st.session_state.expert_mode:
        expert_prompt = "Provide detailed technical analysis including muscle movements, historical context, and advanced variations."
        messages.insert(0, SystemMessage(content=expert_prompt))
    
    with st.spinner("🔍 Analyzing mudra techniques..."):
        try:
            response = chatbot.invoke(
                {"messages": messages}, 
                config={"configurable": {"thread_id": st.session_state.thread_id}}
            )
            ai_response = response['messages'][-1].content
            
            st.session_state.message_history.append({
                "role": "assistant", 
                "content": ai_response
            })
            
            st.rerun()
        except Exception as e:
            error_msg = "I apologize, but I encountered an error. Please try again."
            st.error(error_msg)
            st.session_state.message_history.append({
                "role": "assistant", 
                "content": error_msg
            })
            st.rerun()

# Footer
st.markdown("---")
st.markdown("""
<div class="mudra-info">
    <strong style='color: #8D6E63;'>🎭 Cultural Heritage</strong><br>
    <span style='color: #8D6E63;'>
    There are 28 single-hand mudras (Asamyukta Hastas) and 
    24 combined-hand mudras (Samyukta Hastas) in Bharatanatyam. Each mudra can represent 
    various objects, gods, relationships, and actions when used in different contexts.
    </span>
</div>
""", unsafe_allow_html=True)