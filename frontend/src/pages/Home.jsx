import React, { useRef, useCallback, useState } from "react";
import { Link } from "react-router-dom";
import {
  Camera,
  Book,
  Trophy,
  Users,
  ArrowRight,
  Star,
  PlayCircle,
  Sparkles,
  HelpCircle,
  Video,
  Search,
  Zap,
  Lock,
  School,
  MessageCircle,
  BarChart,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import Navbar from "../components/Navbar.jsx";
import background from "../assets/background.png";

const Home = () => {
  const featuresRef = useRef(null);
  const qnaRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("free");

  const features = [
    {
      icon: Camera,
      title: "Mudra Detection",
      description:
        "Upload images or use camera to identify mudras with advanced AI technology",
      path: "/detect",
      gradient: "from-amber-500 to-orange-500",
      free: true,
    },
    {
      icon: Book,
      title: "Digital Library",
      description:
        "Explore our comprehensive collection of Bharatanatyam mudras and meanings",
      path: "/library",
      gradient: "from-red-500 to-rose-500",
      free: true,
    },
    {
      icon: Zap,
      title: "AI Assistant",
      description:
        "Get instant answers to all your Bharatanatyam-related questions",
      path: "/assistant",
      gradient: "from-orange-500 to-amber-500",
      free: true,
    },
    {
      icon: Trophy,
      title: "Mudra Assessment",
      description:
        "Practice and get instant feedback on your mudra accuracy and form",
      path: "/assessment",
      gradient: "from-brown-600 to-red-600",
      free: false,
    },
    {
      icon: Users,
      title: "Group Learning",
      description:
        "Create virtual classrooms and track progress with fellow learners",
      path: "/groups",
      gradient: "from-amber-600 to-orange-600",
      free: false,
    },
    {
      icon: BarChart,
      title: "Progress Analytics",
      description:
        "Detailed insights into your learning journey and improvement areas",
      path: "/progress",
      gradient: "from-red-600 to-rose-600",
      free: false,
    },
  ];

  const freeFeatures = [
    {
      icon: Camera,
      title: "Mudra Detection",
      questions: ["Which Mudra is this?", "What does this hand gesture mean?"],
      process: [
        "Upload Mudra's Image or Perform On Camera",
        "AI analyzes the hand posture and shape",
        "Get instant results: Mudra Name, Shape Accuracy, Meaning & Inner Thought",
      ],
      output:
        "Complete mudra identification with detailed meaning and accuracy score",
    },
    {
      icon: Book,
      title: "Digital Library",
      questions: [
        "Show all animal-related mudras",
        "What are the different hasta mudras?",
      ],
      process: [
        "Access complete collection of Bharatanatyam Hasta Mudras",
        "Filter by categories: Animals, Gods, Nature, Emotions",
        "View detailed information: Name, Meanings, Bhava Tags, Video References",
      ],
      output:
        "Comprehensive mudra database with regional variations and historical knowledge",
    },
    {
      icon: Zap,
      title: "AI Assistant",
      questions: [
        "Explain the history of Bharatanatyam",
        "What mudras represent love?",
      ],
      process: [
        "Ask any question related to Bharatanatyam",
        "AI provides detailed, contextual answers",
        "Get references and learning resources",
      ],
      output:
        "Instant expert knowledge about dance, mudras, and cultural context",
    },
  ];

  const premiumFeatures = [
    {
      icon: Trophy,
      title: "Mudra Assessment",
      questions: ["How accurate is my mudra?", "What are my common mistakes?"],
      process: [
        "Website gives random Mudra Name to perform",
        "Show the mudra using your camera",
        "AI analyzes: Shape Accuracy, Points Common Mistakes, Tracks Progress",
      ],
      output:
        "Personalized feedback with improvement suggestions and progress tracking",
    },
    {
      icon: School,
      title: "Group Management",
      questions: ["How can I teach students online?", "Track group progress?"],
      process: [
        "Create classrooms like Google Classroom",
        "Teacher as admin manages students",
        "Generate group progress reports and analytics",
      ],
      output:
        "Complete teaching platform with progress tracking and management tools",
    },
    {
      icon: MessageCircle,
      title: "Group Chat",
      questions: [
        "How to communicate with students?",
        "Share learning materials?",
      ],
      process: [
        "Real-time group messaging system",
        "Share videos, images, and resources",
        "Collaborative learning environment",
      ],
      output:
        "Seamless communication and resource sharing within learning groups",
    },
  ];

  const scrollToFeatures = useCallback(() => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const scrollToQnA = useCallback(() => {
    qnaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <Helmet>
        <title>
          NrityaLens - AI-Powered Bharatanatyam Mudra Detection & Learning
          Platform
        </title>
        <meta
          name="description"
          content="Experience the future of Bharatanatyam learning with NrityaLens. AI-powered mudra detection, comprehensive library, and interactive learning tools."
        />
      </Helmet>

      {/* Navbar with Sign In / Sign Up for Home only */}
      <Navbar showAuthButtons={true} />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={background}
            alt="Bharatanatyam dancer performing traditional mudras with elegant hand gestures"
            className={`w-full h-full object-cover transition-all duration-1000 ${
              imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-110"
            }`}
            onLoad={() => setImageLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900/40 via-orange-800/30 to-red-900/50"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-amber-900/20 to-red-900/20"></div>
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-amber-300 rounded-full opacity-30 animate-pulse"></div>
            <div className="absolute top-1/3 right-1/3 w-6 h-6 bg-orange-400 rounded-full opacity-20 animate-bounce"></div>
            <div className="absolute bottom-1/4 left-1/3 w-8 h-8 bg-red-500 rounded-full opacity-25 animate-ping"></div>
          </div>
        </div>

        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900 to-red-800 animate-pulse"></div>
        )}

        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          <div className="flex justify-center items-center mb-8">
            <div className="w-20 h-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent rounded-full"></div>
            <Sparkles className="mx-4 text-amber-300 animate-pulse" size={32} />
            <div className="w-20 h-1 bg-gradient-to-r from-transparent via-orange-300 to-transparent rounded-full"></div>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-red-300 bg-clip-text text-transparent animate-gradient">
              NrityaLens
            </span>
          </h1>

          <h2 className="text-2xl md:text-4xl font-light text-white mb-4 tracking-wide">
            Where Tradition Meets
            <span className="block font-semibold bg-gradient-to-r from-amber-200 to-orange-200 bg-clip-text text-transparent">
              AI Innovation
            </span>
          </h2>

          <p className="text-xl md:text-2xl text-amber-100 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
            Discover, learn, and perfect Bharatanatyam mudras with AI-powered
            technology. From beginners to masters, NrityaLens transforms your
            dance journey.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-16">
            <button
              onClick={scrollToFeatures}
              className="group px-12 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl font-semibold text-lg shadow-2xl hover:shadow-amber-500/25 transition-all duration-300 transform hover:-translate-y-1 flex items-center space-x-3"
            >
              <PlayCircle
                size={24}
                className="group-hover:scale-110 transition-transform"
              />
              <span>Explore Features</span>
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>

            <button
              onClick={scrollToQnA}
              className="group px-12 py-4 border-2 border-amber-300 hover:border-amber-200 text-amber-100 hover:text-white rounded-2xl font-semibold text-lg backdrop-blur-sm bg-white/10 hover:bg-amber-500/20 transition-all duration-300 transform hover:-translate-y-1 flex items-center space-x-3"
            >
              <HelpCircle size={24} />
              <span>Learn How It Works</span>
            </button>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-amber-300 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-amber-300 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features, Q&A, Stats, CTA, Footer */}
      {/* ...keep the rest of your existing Home.jsx content unchanged... */}
    </div>
  );
};

export default Home;
