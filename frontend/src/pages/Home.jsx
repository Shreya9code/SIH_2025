import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { Camera, Book, Trophy, Users, ArrowRight } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import background from "../assets/background.png";

const Home = () => {
  const featuresRef = useRef(null); // Ref for the features grid

  const features = [
    { icon: Camera, title: "Mudra Detection", description: "Upload images or use camera to identify mudras with AI", path: "/detect", free: true },
    { icon: Book, title: "Digital Library", description: "Comprehensive collection of Bharatanatyam mudras", path: "/library", free: true },
    { icon: Trophy, title: "Mudra Assessment", description: "Practice and get feedback on your mudra accuracy", path: "/assessment", free: false },
    { icon: Users, title: "Group Learning", description: "Create classrooms and track group progress", path: "/groups", free: false },
  ];

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen bg-[#FFF8E7]">
      <Navbar />

      {/* Hero Image Section */}
      <div className="relative w-full">
        <img
          src={background}
          alt="NrityaLens Cultural Banner"
          className="w-full h-[28rem] md:h-[34rem] object-cover rounded-b-1xl brightness-70"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00000050] to-[#00000030] rounded-b-3xl"></div>
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-7">
            <span className="text-[#D46B3E]">Welcome to</span>{" "}
            <span className="text-white">NrityaLens</span>
          </h1>
          <p className="text-lg md:text-2xl text-white max-w-3xl mx-auto mb-12">
            Observing the Art of Bharatanatyam through AI
          </p>
          <div className="flex justify-center flex-wrap gap-4">
            <button
              onClick={scrollToFeatures}
              className="px-8 py-3 bg-gradient-to-r from-[#D46B3E] via-[#8C3B26] to-[#D46B3E] text-white rounded-lg font-semibold hover:shadow-xl transition-all flex items-center space-x-2"
            >
              <span>Try Free Features</span>
              <ArrowRight size={20} />
            </button>

            <Link
              to="/register"
              className="px-8 py-3 border border-[#8C3B26] text-[#8C3B26] rounded-lg hover:bg-[#F3E6D8] transition-all"
            >
              Register for More
            </Link>
          </div>
        </div>
      </div>

      {/* Intermediary Big Text */}
      <div className="text-center my-16 px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-[#8C3B26]">
          How Can NrityaLens Help You?
        </h2>
      </div>

      {/* Features Grid */}
      <div ref={featuresRef} className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-4 py-16">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div key={index} className="bg-white rounded-3xl shadow-lg p-6 border border-[#D46B3E] hover:shadow-2xl transition-all transform hover:-translate-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-r from-[#D46B3E] via-[#8C3B26] to-[#D46B3E] rounded-lg flex items-center justify-center text-white shadow-lg">
                  <Icon size={28} />
                </div>
                {feature.free ? (
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">Free</span>
                ) : (
                  <span className="px-3 py-1 bg-[#FFE5CC] text-[#8C3B26] text-xs rounded-full">Premium</span>
                )}
              </div>
              <h3 className="text-2xl font-semibold text-[#8C3B26] mb-2">{feature.title}</h3>
              <p className="text-[#D46B3E] mb-4">{feature.description}</p>
              <Link to={feature.path} className="inline-flex items-center space-x-1 text-[#8C3B26] hover:text-[#5C261A] font-medium">
                <span>Explore</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-around items-center gap-6 mb-4">
        <div className="flex flex-col items-center">
          <div className="text-2xl md:text-3xl font-extrabold">50+</div>
          <div className="text-sm text-[#D46B3E]">Mudras in Library</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-2xl md:text-3xl font-extrabold">95%</div>
          <div className="text-sm text-[#D46B3E]">Detection Accuracy</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-2xl md:text-3xl font-extrabold">1000+</div>
          <div className="text-sm text-[#D46B3E]">Learning Resources</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-2xl md:text-3xl font-extrabold">24/7</div>
          <div className="text-sm text-[#D46B3E]">AI Assistance</div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#8C3B26] text-white py-2 mt-6">
        <p className="text-center text-white text-xs">&copy; {new Date().getFullYear()} NrityaLens. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
