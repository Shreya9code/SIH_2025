# NrityaLens (Observing Dance Through AI)

**Where Tradition Meets AI Innovation**

---

## Overview
**NrityaLens** is an AI-powered platform designed to preserve, educate, and assist learners of **Bharatanatyam**, one of India’s classical dance forms.  
It leverages **React + Vite, Node.js, Tailwind CSS, and Python (for ML models)** to deliver an immersive learning experience.

NrityaLens serves both casual users and dedicated learners. Free users can explore and learn about Mudras, while registered learners gain access to advanced tools like Mudra assessment, group learning, and progress analytics.

---

## Features

### Free Features

| Feature | Description |
|---------|-------------|
| **Mudra Detection** | Upload images or perform a Mudra on camera. The system identifies the Mudra, evaluates **shape accuracy**, and provides its **meaning and historical context**. |
| **Digital Library** | Explore a comprehensive collection of Bharatanatyam Mudras including **names, meanings, bhava tags, video references, regional variations, and historical knowledge**. Filter Mudras based on categories, e.g., all Mudras related to animals, and access clips instantly. |
| **AI Assistant** | Ask any Bharatanatyam-related question and get accurate, instant answers powered by AI. |

### Premium Features

| Feature | Description |
|---------|-------------|
| **Mudra Assessment** | Practice Mudras in guided assessment mode. Get **shape accuracy feedback**, identify **common mistakes**, earn points, and track progress. |
| **Group Learning** | Teachers can create virtual classrooms, add learners, manage groups, and interact via group chat. |
| **Progress Analytics** | Track your learning journey with detailed insights, including improvement areas and performance trends. |

> **Start with Free Features Today and unlock advanced tools by registering as a learner.**


---

## Tech Stack
- **Frontend:** React + Vite, Tailwind CSS for responsive and interactive UI  
- **Backend:** Node.js for REST API and server logic  
- **Machine Learning:** Python-based models for Mudra recognition and assessment  
- **Database (optional):** MongoDB or SQL for storing user data, Mudra info, and group records  

---

## Installation & Running the Project

### Prerequisites
- Node.js (v18+ recommended)  
- npm or yarn  
- Python 3.9+ with required ML libraries  

### Steps
```bash
# Clone the repository
git clone <repo_url>

# Frontend setup
cd frontend
npm install
npm run dev

# Backend setup (in a new terminal)
cd backend
npm install
npm start

# AI setup (in a new terminal)
cd ai
pip install -r requirements.txt
streamlit run .\streamlit_frontend.py

# AI setup (in a new terminal)
cd ml
pip install -r requirements.txt
uvicorn app:app --reload