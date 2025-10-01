// App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import MudraDetection from "./pages/MudraDetection.jsx";
import DigitalLibrary from "./pages/DigitalLibrary.jsx";
import AIChatWidget from "./components/AIChatWidget.jsx";
import Navbar from "./components/Navbar.jsx";
import { HelmetProvider } from "react-helmet-async";
import { SignIn, SignUp, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import sideImage from "./assets/image.png";
import GroupLearning from "./pages/GroupLearning.jsx";

// Wrapper component to handle Navbar visibility
const AppWrapper = () => {
  const location = useLocation();
  const hideNavbar = location.pathname.startsWith("/sign-in") || location.pathname.startsWith("/sign-up");

  return (
    <>
      {!hideNavbar && <Navbar />} {/* Navbar shown only on non-auth pages */}
      
      <Routes>
        {/* Public landing page */}
        <Route path="/" element={<Home />} />

        {/* Public pages (accessible without login) */}
        <Route path="/detect" element={<MudraDetection />} />
        <Route path="/library" element={<DigitalLibrary />} />
        <Route path="/assistant" element={<AIChatWidget />} />
        <Route path="/groups" element={<GroupLearning currentUser={null} />} />

        {/* Clerk Sign In */}
        <Route
          path="/sign-in/*"
          element={
            <div className="flex min-h-screen w-full">
              {/* Left: Sign In form */}
              <div className="flex-1 flex justify-center items-center bg-black">
                <div className="w-full max-w-md px-8 py-10">
                  <SignIn
                    routing="path"
                    path="/sign-in"
                    redirectUrl="/dashboard"
                    signUpUrl="/sign-up"
                    appearance={{
                      elements: {
                        formButtonPrimary: "bg-[#8C3B26] hover:bg-[#5C261A]",
                      },
                    }}
                  />
                </div>
              </div>
              {/* Right: Side image */}
              <div className="flex-1 flex items-center justify-center bg-black">
                <img
                  src={sideImage}
                  alt="Welcome"
                  className="h-full w-full object-cover"
                  style={{ maxHeight: "100vh" }}
                />
              </div>
            </div>
          }
        />

        <Route
          path="/sign-up/*"
          element={
            <div className="flex min-h-screen h-screen w-full">
              {/* Left: Centered Sign Up form */}
              <div className="flex-1 flex items-center justify-center">
                <div className="w-full" style={{ maxWidth: 420 }}>
                  <SignUp
                    routing="path"
                    path="/sign-up"
                    redirectUrl="/dashboard"
                    signInUrl="/sign-in"
                    appearance={{
                      elements: {
                        formButtonPrimary: "bg-[#8C3B26] hover:bg-[#5C261A]",
                      },
                    }}
                  />
                </div>
              </div>
              {/* Right: Full-height image */}
              <div className="flex-1 h-full">
                <img
                  src={sideImage}
                  alt="Create Account"
                  className="h-full w-full object-cover"
                  style={{ objectPosition: "center" }}
                />
              </div>
            </div>
          }
        />

        {/* Protected Dashboard */}
        <Route
          path="/dashboard"
          element={
            <SignedIn>
              <Dashboard />
            </SignedIn>
          }
        />

        {/* Redirect unknown routes for signed-out users */}
        <Route
          path="*"
          element={
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          }
        />
      </Routes>

      {/* Floating AI Chat Widget on all pages */}
      <AIChatWidget />
    </>
  );
};

function App() {
  return (
    <HelmetProvider>
      <Router>
        <AppWrapper />
      </Router>
    </HelmetProvider>
  );
}

export default App;
