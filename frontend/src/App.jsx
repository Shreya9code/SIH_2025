import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import AIChatWidget from "./components/AIChatWidget.jsx"; // import the chat widget

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/detect" element={<Detect />} />
        <Route path="/library" element={<Library />} />
        <Route path="/assessment" element={<Assessment />} />
        <Route path="/groups" element={<Groups />} /> */}
      </Routes>

      {/* Floating AI Chat Widget visible on all pages */}
      <AIChatWidget />
    </Router>
  );
}

export default App;
