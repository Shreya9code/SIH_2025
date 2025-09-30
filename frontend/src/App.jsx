// App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AIChatWidget from "./components/AIChatWidget.jsx";
import { HelmetProvider } from "react-helmet-async";
import {
  SignIn,
  SignUp,
  SignedIn,
  SignedOut,
  RedirectToSignIn,
} from "@clerk/clerk-react";

function App() {
  return (
    <HelmetProvider>
      <Router>
        <Routes>
          {/* Public landing page */}
          <Route path="/" element={<Home />} />

          {/* Clerk Sign In */}
          <Route
            path="/sign-in/*"
            element={
              <SignIn
                routing="path"
                path="/sign-in"
                redirectUrl="/dashboard"
                signUpUrl="/sign-up"
              />
            }
          />

          {/* Clerk Sign Up */}
          <Route
            path="/sign-up/*"
            element={
              <SignUp
                routing="path"
                path="/sign-up"
                redirectUrl="/dashboard"
                signInUrl="/sign-in"
              />
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
      </Router>
    </HelmetProvider>
  );
}

export default App;
