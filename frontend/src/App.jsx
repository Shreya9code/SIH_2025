// App.jsx
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import MudraDetection from "./pages/MudraDetection.jsx";
import DigitalLibrary from "./pages/DigitalLibrary.jsx";
import AIChatWidget from "./components/AIChatWidget.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import { HelmetProvider } from "react-helmet-async";
import {
  SignIn,
  SignUp,
  SignedIn,
  SignedOut,
} from "@clerk/clerk-react";
import sideImage from "./assets/image.png";
import GroupLearning from "./pages/GroupLearning.jsx";
import ProgressAnalytics from "./pages/ProgressAnalytics.jsx";
import MudraAssessment from "./pages/MudraAssessment.jsx";
import AboutUs from "./pages/AboutUs.jsx";

// Layout wrapper for pages with Navbar, Footer, and AIChatWidget
const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <AIChatWidget />
      <Footer />
    </div>
  );
};

// Layout without Navbar/Footer for auth pages
const AuthLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">{children}</main>
    </div>
  );
};

// Auto redirect page example
function AutoRedirect() {
  useEffect(() => {
    window.location.href = "https://nrityalens-ai-2025.streamlit.app/";
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4" style={{ color: "#000!important" }}>
        Opening AI Assistant...
      </h2>
      <p className="text-gray-600" style={{ color: "#000!important" }}>
        Redirecting you, please wait...
      </p>
    </div>
  );
}

// ProtectedRoute wrapper
const ProtectedRoute = ({ children }) => (
  <>
    <SignedIn>{children}</SignedIn>
    <SignedOut>
      <AuthLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4" style={{ color: "#000!important" }}>
              Login Required
            </h2>
            <p className="mb-4" style={{ color: "#000!important" }}>
              You must be signed in to access this page.
            </p>
            <button
              onClick={() => (window.location.href = "/sign-in")}
              className="px-4 py-2 rounded border-2 border-brown-700 text-white bg-[#8C3B26] hover:bg-[#a14f3b] hover:border-brown-800 transition-colors duration-200"
            >
              Go to Sign In
            </button>

          </div>
        </div>
      </AuthLayout>
    </SignedOut>
  </>
);

const AppWrapper = () => {
  return (
    <Routes>
      {/* Public landing page */}
      <Route
        path="/"
        element={
          <Layout>
            <Home />
          </Layout>
        }
      />

      {/* Public pages */}
      <Route
        path="/detect"
        element={
          <Layout>
            <MudraDetection />
          </Layout>
        }
      />
      <Route
        path="/library"
        element={
          <Layout>
            <DigitalLibrary />
          </Layout>
        }
      />
      <Route
        path="/about"
        element={
          <Layout>
            <AboutUs />
          </Layout>
        }
      />

      {/* AI Assistant iframe page */}
      <Route
        path="/ai-assistant"
        element={
          <Layout>
            <AutoRedirect />
          </Layout>
        }
      />

      {/* Protected routes */}
      <Route
        path="/groups"
        element={
          <ProtectedRoute>
            <Layout>
              <GroupLearning />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/progress"
        element={
          <ProtectedRoute>
            <Layout>
              <ProgressAnalytics />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/assessment"
        element={
          <ProtectedRoute>
            <Layout>
              <MudraAssessment />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Auth pages */}
      <Route
        path="/sign-in/*"
        element={
          <AuthLayout>
            <div className="flex min-h-screen w-full">
              <div className="flex-1 flex justify-center items-center bg-black">
                <div className="w-full max-w-md px-8 py-10">
                  <SignIn
                    routing="path"
                    path="/sign-in"
                    redirectUrl="/dashboard"
                    signUpUrl="/sign-up"
                    appearance={{
                      elements: {
                        formButtonPrimary:
                          "bg-[#8C3B26!important] hover:bg-[#5C261A!important] text-white!important",
                      },
                    }}
                  />
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center bg-black">
                <img
                  src={sideImage}
                  alt="Welcome"
                  className="h-full w-full object-cover"
                  style={{ maxHeight: "100vh" }}
                />
              </div>
            </div>
          </AuthLayout>
        }
      />

      <Route
        path="/sign-up/*"
        element={
          <AuthLayout>
            <div className="flex min-h-screen h-screen w-full">
              <div className="flex-1 flex items-center justify-center">
                <div className="w-full" style={{ maxWidth: 420 }}>
                  <SignUp
                    routing="path"
                    path="/sign-up"
                    redirectUrl="/dashboard"
                    signInUrl="/sign-in"
                    appearance={{
                      elements: {
                        formButtonPrimary:
                          "bg-[#8C3B26!important] hover:bg-[#5C261A!important] text-white!important",
                      },
                    }}
                  />
                </div>
              </div>
              <div className="flex-1 h-full">
                <img
                  src={sideImage}
                  alt="Create Account"
                  className="h-full w-full object-cover"
                  style={{ objectPosition: "center" }}
                />
              </div>
            </div>
          </AuthLayout>
        }
      />

      {/* Catch-all route */}
      <Route
        path="*"
        element={
          <Layout>
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4" style={{ color: "#000!important" }}>
                  404 - Page Not Found
                </h1>
                <p className="text-gray-600" style={{ color: "#000!important" }}>
                  The page you're looking for doesn't exist.
                </p>
              </div>
            </div>
          </Layout>
        }
      />
    </Routes>
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
