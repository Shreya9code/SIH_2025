// App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import MudraDetection from "./pages/MudraDetection.jsx";
import DigitalLibrary from "./pages/DigitalLibrary.jsx";
import AIChatWidget from "./components/AIChatWidget.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/footer.jsx";
import { HelmetProvider } from "react-helmet-async";
import { SignIn, SignUp, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import sideImage from "./assets/image.png";
import GroupLearning from "./pages/GroupLearning.jsx";
import ProgressAnalytics from "./pages/ProgressAnalytics.jsx";
import MudraAssessment from "./pages/MudraAssessment.jsx";
import AboutUs from "./pages/AboutUs.jsx";
import ContactUs from "./pages/ContactUs.jsx";

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

// Layout for iframe pages (no Navbar/Footer)
const IFrameLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">{children}</main>
    </div>
  );
};

const AppWrapper = () => {
  return (
    <Routes>
      {/* Public landing page */}
      <Route path="/" element={<Layout><Home /></Layout>} />

      {/* Public pages with layout */}
      <Route path="/detect" element={<Layout><MudraDetection /></Layout>} />
      <Route path="/library" element={<Layout><DigitalLibrary /></Layout>} />
      <Route path="/about" element={<Layout><AboutUs /></Layout>} />
      <Route path="/contact" element={<Layout><ContactUs /></Layout>} />
      
      {/* AI Assistant iframe page */}
      <Route 
        path="/ai-assistant" 
        element={
          <IFrameLayout>
            <iframe 
              src="http://localhost:8501/" 
              style={{ width: "100%", height: "100vh", border: "none" }} 
              title="AI Assistant"
            />
          </IFrameLayout>
        } 
      />

      {/* Protected routes */}
      <Route
        path="/groups"
        element={
          <SignedIn>
            <Layout><GroupLearning /></Layout>
          </SignedIn>
        }
      />
      <Route
        path="/progress"
        element={
          <SignedIn>
            <Layout><ProgressAnalytics /></Layout>
          </SignedIn>
        }
      />
      <Route
        path="/assessment"
        element={
          <SignedIn>
            <Layout><MudraAssessment /></Layout>
          </SignedIn>
        }
      />
      <Route
        path="/dashboard"
        element={
          <SignedIn>
            <Layout><Dashboard /></Layout>
          </SignedIn>
        }
      />

      {/* Auth pages with special layout */}
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
                        formButtonPrimary: "bg-[#8C3B26] hover:bg-[#5C261A]",
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
                        formButtonPrimary: "bg-[#8C3B26] hover:bg-[#5C261A]",
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

      {/* Catch-all route for signed-out users */}
      <Route
        path="*"
        element={
          <>
            <SignedIn>
              <Layout>
                <div className="flex items-center justify-center min-h-screen">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
                    <p className="text-gray-600">The page you're looking for doesn't exist.</p>
                  </div>
                </div>
              </Layout>
            </SignedIn>
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          </>
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