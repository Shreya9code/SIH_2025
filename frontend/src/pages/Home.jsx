import React, { useRef, useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { Camera, Book, Trophy, Users, ArrowRight, Star, PlayCircle, Sparkles, HelpCircle, Video, Search, Zap, Lock, School, MessageCircle, BarChart, Sparkle } from "lucide-react";
import { Helmet } from "react-helmet-async";
import Navbar from "../components/Navbar.jsx";
import background from "../assets/background.png";
import icon from "../assets/icon.png";

const Home = () => {
  const featuresRef = useRef(null);
  const qnaRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('free');

  const features = [
    {
      icon: Camera,
      title: "Mudra Detection",
      description: "Upload images or use camera to identify mudras with advanced AI technology",
      path: "/detect",
      gradient: "from-amber-500 to-orange-500",
      free: true
    },
    {
      icon: Book,
      title: "Digital Library",
      description: "Explore our comprehensive collection of Bharatanatyam mudras and meanings",
      path: "/library",
      gradient: "from-orange-500 to-amber-500",
      free: true
    },
    {
      icon: Zap,
      title: "AI Assistant",
      description: "Get instant answers to all your Bharatanatyam-related questions",
      path: "/ai-assistant",
      gradient: "from-orange-500 to-amber-500",
      free: true
    },
    {
      icon: Trophy,
      title: "Mudra Assessment",
      description: "Practice and get instant feedback on your mudra accuracy and form",
      path: "/assessment",
      gradient: "from-red-600 to-rose-600",
      free: false
    },
    {
      icon: BarChart,
      title: "Progress Analytics",
      description: "Detailed insights into your learning journey and improvement areas",
      path: "/progress",
      gradient: "from-brown-600 to-red-600",
      free: false
    },
    {
      icon: Users,
      title: "Group Learning",
      description: "Create virtual classrooms and track progress with fellow learners",
      path: "/groups",
      gradient: "from-red-600 to-rose-600",
      free: false
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
        "Get instant results: Mudra Name, Shape Accuracy, Meaning & Inner Thought"
      ],
      output: "Complete mudra identification with detailed meaning and accuracy score"
    },
    {
      icon: Book,
      title: "Digital Library",
      questions: ["Show all animal-related mudras", "What are the different hasta mudras?"],
      process: [
        "Access complete collection of Bharatanatyam Hasta Mudras",
        "Filter by categories: Animals, Gods, Nature, Emotions",
        "View detailed information: Name, Meanings, Bhava Tags, Video References"
      ],
      output: "Comprehensive mudra database with regional variations and historical knowledge"
    },
    {
      icon: Zap,
      title: "AI Assistant",
      questions: ["Explain the history of Bharatanatyam", "What mudras represent love?"],
      process: [
        "Ask any question related to Bharatanatyam",
        "AI provides detailed, contextual answers",
        "Get references and learning resources"
      ],
      output: "Instant expert knowledge about dance, mudras, and cultural context"
    }
  ];

  const premiumFeatures = [
    {
      icon: Trophy,
      title: "Mudra Assessment",
      questions: ["How accurate is my mudra?", "What are my common mistakes?"],
      process: [
        "Website gives random Mudra Name to perform",
        "Show the mudra using your camera",
        "AI analyzes: Shape Accuracy, Points Common Mistakes, Tracks Progress"
      ],
      output: "Personalized feedback with improvement suggestions and progress tracking"
    },
    {
      icon: School,
      title: "Group Management",
      questions: ["How can I teach students online?", "Track group progress?"],
      process: [
        "Create classrooms like Google Classroom",
        "Teacher as admin manages students",
        "Generate group progress reports and analytics"
      ],
      output: "Complete teaching platform with progress tracking and management tools"
    },
    {
      icon: MessageCircle,
      title: "Group Chat",
      questions: ["How to communicate with students?", "Share learning materials?"],
      process: [
        "Real-time group messaging system",
        "Share videos, images, and resources",
        "Collaborative learning environment"
      ],
      output: "Seamless communication and resource sharing within learning groups"
    }
  ];

  const scrollToFeatures = useCallback(() => {
    featuresRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }, []);

  const scrollToQnA = useCallback(() => {
    qnaRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <Helmet>
        <title>NrityaLens - AI-Powered Bharatanatyam Mudra Detection & Learning Platform</title>
        <meta
          name="description"
          content="Experience the future of Bharatanatyam learning with NrityaLens. AI-powered mudra detection, comprehensive library, and interactive learning tools."
        />
      </Helmet>

      <Navbar showAuthButtons={true} />

      {/* Enhanced Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Enhanced Overlay */}
        <div className="absolute inset-0">
          <img
            src={background}
            alt="Bharatanatyam dancer performing traditional mudras with elegant hand gestures"
            className={`w-full h-full object-cover transition-all duration-1000 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
              }`}
            onLoad={() => setImageLoaded(true)}
          />

          {/* Multi-layer Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900/40 via-orange-800/30 to-red-900/50"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-amber-900/20 to-red-900/20"></div>

          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-amber-300 rounded-full opacity-30 animate-pulse"></div>
            <div className="absolute top-1/3 right-1/3 w-6 h-6 bg-orange-400 rounded-full opacity-20 animate-bounce"></div>
            <div className="absolute bottom-1/4 left-1/3 w-8 h-8 bg-red-500 rounded-full opacity-25 animate-ping"></div>
          </div>
        </div>

        {/* Loading Skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900 to-red-800 animate-pulse"></div>
        )}

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          {/* Decorative Elements */}
          <div className="flex justify-center items-center mb-8">
            <div className="w-20 h-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent rounded-full"></div>
            <Sparkles className="mx-4 text-amber-300 animate-pulse" size={32} />
            <div className="w-20 h-1 bg-gradient-to-r from-transparent via-orange-300 to-transparent rounded-full"></div>
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-red-300 bg-clip-text text-transparent animate-gradient">
              NrityaLens
            </span>
          </h1>

          {/* Subheading */}
          <div className="relative inline-block mb-8">
            <h2 className="text-2xl md:text-4xl font-light text-white mb-4 tracking-wide">
              Where Tradition Meets
              <span className="block font-semibold bg-gradient-to-r from-amber-200 to-orange-200 bg-clip-text text-transparent">
                AI Innovation
              </span>
            </h2>
            <div className="absolute -bottom-2 left-1/4 w-1/2 h-1 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"></div>
          </div>

          {/* Description */}
          <p className="text-xl md:text-2xl text-amber-100 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
            Discover, learn, and perfect Bharatanatyam mudras with AI-powered technology.
            From beginners to masters, NrityaLens transforms your dance journey.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-16">
            <button
              onClick={scrollToFeatures}
              className="group px-12 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl font-semibold text-lg shadow-2xl hover:shadow-amber-500/25 transition-all duration-300 transform hover:-translate-y-1 flex items-center space-x-3"
            >
              <PlayCircle size={24} className="group-hover:scale-110 transition-transform" />
              <span>Explore Features</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={scrollToQnA}
              className="group px-12 py-4 border-2 border-amber-300 hover:border-amber-200 text-amber-100 hover:text-white rounded-2xl font-semibold text-lg backdrop-blur-sm bg-white/10 hover:bg-amber-500/20 transition-all duration-300 transform hover:-translate-y-1 flex items-center space-x-3"
            >
              <HelpCircle size={24} />
              <span>Learn How It Works</span>
            </button>
          </div>

          {/* Stats Preview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
            {[
              { number: "50+", label: "Sacred Mudras" },
              { number: "95%", label: "AI Accuracy" },
              { number: "3", label: "Free Features" },
              { number: "24/7", label: "Available" }
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-2xl md:text-3xl font-bold text-amber-300 group-hover:text-amber-200 transition-colors">
                  {stat.number}
                </div>
                <div className="text-sm text-amber-100/80 group-hover:text-amber-50 transition-colors">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-amber-300 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-amber-300 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Section - MOVED BEFORE Q&A */}
      <section
        ref={featuresRef}
        className="py-24 px-4 bg-gradient-to-b from-white to-amber-50"
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-full text-sm font-semibold mb-6 shadow-lg">
              <Star className="fill-current" size={16} />
              <span>POWERFUL FEATURES</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Discover Our{" "}
              <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Complete Toolkit
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              From AI-powered mudra detection to comprehensive learning tools,
              NrityaLens offers everything you need for your Bharatanatyam journey.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group relative bg-white rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 border border-amber-100 overflow-hidden"
                >
                  {/* Free/Premium Badge */}
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold ${feature.free
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-red-100 text-red-700'
                    }`}>
                    {feature.free ? 'FREE' : 'PREMIUM'}
                  </div>

                  {/* Icon */}
                  <div className={`mb-4 inline-flex p-3 bg-gradient-to-r ${feature.gradient} rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="text-white" size={28} />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>

                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* CTA */}
                  <Link
                    to={feature.path}
                    className="inline-flex items-center space-x-2 text-amber-700 hover:text-amber-900 font-semibold group/link transition-colors duration-300"
                  >
                    <span>{feature.free ? 'Try Now' : 'Learn More'}</span>
                    <ArrowRight size={16} className="group-hover/link:translate-x-1 transition-transform duration-300" />
                  </Link>

                  {/* Hover Border Effect */}
                  <div className={`absolute inset-0 border-2 border-transparent bg-gradient-to-r ${feature.gradient} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`}>
                    <div className="w-full h-full bg-white rounded-3xl m-0.5"></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Features CTA */}
          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl p-8 border border-amber-200">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Start with Free Features Today!
              </h3>
              <p className="text-amber-700 mb-6 max-w-2xl mx-auto">
                No registration required to access our powerful AI mudra detection, digital library, and AI assistant.
                Premium features available for enhanced learning experience.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <Link
                  to="/detect"
                  className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <PlayCircle size={20} />
                  <span>Try Free Features</span>
                </Link>
                <button
                  onClick={scrollToQnA}
                  className="inline-flex items-center space-x-3 px-8 py-4 border-2 border-amber-300 hover:border-amber-500 text-amber-700 hover:text-amber-900 rounded-2xl font-semibold backdrop-blur-sm bg-white/50 hover:bg-white transition-all duration-300 transform hover:-translate-y-1"
                >
                  <HelpCircle size={20} />
                  <span>Learn How It Works</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Q&A Section - MOVED AFTER FEATURES */}
      <section
        ref={qnaRef}
        className="py-24 px-4 bg-gradient-to-b from-amber-50 to-orange-50"
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-full text-sm font-semibold mb-6 shadow-lg">
              <HelpCircle className="fill-current" size={16} />
              <span>HOW IT WORKS</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Your Questions{" "}
              <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Answered
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Discover how NrityaLens combines ancient Bharatanatyam traditions with modern AI technology
              to enhance your learning experience.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-12">
            <div className="bg-amber-100 rounded-2xl p-2 flex space-x-2">
              <button
                onClick={() => setActiveTab('free')}
                className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${activeTab === 'free'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                  : 'text-amber-700 hover:text-amber-900'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <Zap size={20} />
                  <span>Free Features</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('premium')}
                className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${activeTab === 'premium'
                  ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg'
                  : 'text-amber-700 hover:text-amber-900'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <Lock size={20} />
                  <span>Premium Features</span>
                </div>
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {(activeTab === 'free' ? freeFeatures : premiumFeatures).map((feature, index) => (
              <div
                key={index}
                className="group bg-white rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 border border-amber-100 relative overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className={`p-3 rounded-2xl bg-gradient-to-r ${activeTab === 'free' ? 'from-amber-500 to-orange-500' : 'from-red-500 to-rose-500'
                    } text-white shadow-lg`}>
                    <feature.icon size={28} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{feature.title}</h3>
                </div>

                {/* Example Questions */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-amber-600 mb-3">EXAMPLE QUESTIONS:</h4>
                  <div className="space-y-2">
                    {feature.questions.map((question, qIndex) => (
                      <div key={qIndex} className="flex items-start space-x-2">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${activeTab === 'free' ? 'bg-amber-400' : 'bg-red-400'
                          }`}></div>
                        <span className="text-gray-700 text-sm">{question}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Process Steps */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-amber-600 mb-3">HOW IT WORKS:</h4>
                  <div className="space-y-3">
                    {feature.process.map((step, stepIndex) => (
                      <div key={stepIndex} className="flex items-start space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${activeTab === 'free' ? 'bg-amber-500' : 'bg-red-500'
                          }`}>
                          {stepIndex + 1}
                        </div>
                        <span className="text-gray-700 text-sm leading-relaxed">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Output */}
                <div className="pt-4 border-t border-amber-100">
                  <h4 className="text-sm font-semibold text-amber-600 mb-2">YOU GET:</h4>
                  <p className="text-gray-700 text-sm bg-amber-50 rounded-lg p-3 border border-amber-100">
                    {feature.output}
                  </p>
                </div>

                {/* Hover Effect */}
                <div className={`absolute inset-0 border-2 border-transparent bg-gradient-to-r ${activeTab === 'free' ? 'from-amber-500 to-orange-500' : 'from-red-500 to-rose-500'
                  } rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`}>
                  <div className="w-full h-full bg-white rounded-3xl m-0.5"></div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16">
            {activeTab === 'free' ? (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl p-8 border border-amber-200">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Ready to Start Your Journey?
                </h3>
                <p className="text-amber-700 mb-6 max-w-2xl mx-auto">
                  All these amazing features are completely free! No registration required to start exploring the world of Bharatanatyam mudras.
                </p>
                <Link
                  to="/detect"
                  className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <PlayCircle size={20} />
                  <span>Try Free Features Now</span>
                </Link>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-3xl p-8 border border-red-200">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Unlock Premium Features
                </h3>
                <p className="text-red-700 mb-6 max-w-2xl mx-auto">
                  Register today to access advanced learning tools, progress tracking, and collaborative features designed for serious learners and teachers.
                </p>
                <Link
                  to="/register"
                  className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <Lock size={20} />
                  <span>Register for Premium Access</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-amber-500 to-orange-500 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-300 rounded-full translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "50+", label: "Ancient Mudras", subtitle: "Digitally Preserved" },
              { number: "95%", label: "Detection Accuracy", subtitle: "AI Powered" },
              { number: "1000+", label: "Learning Resources", subtitle: "Curated Content" },
              { number: "24/7", label: "AI Assistance", subtitle: "Always Available" }
            ].map((stat, index) => (
              <div key={index} className="text-center text-white group">
                <div className="text-4xl md:text-5xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.number}
                </div>
                <div className="text-lg font-semibold mb-1">{stat.label}</div>
                <div className="text-sm text-amber-200 opacity-90">{stat.subtitle}</div>
                <div className="w-12 h-1 bg-amber-300 rounded-full mx-auto mt-3 group-hover:w-16 transition-all duration-300"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Start Your{" "}
            <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Bharatanatyam Journey
            </span>
            {" "}Today
          </h2>
          <p className="text-xl text-amber-700 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join thousands of dance enthusiasts who are already transforming their practice with NrityaLens.
            Free features available for everyone, premium tools for dedicated learners.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <Link
              to="/detect"
              className="px-12 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              Try Mudra Detection
            </Link>
            <Link
              to="/register"
              className="px-12 py-4 border-2 border-amber-300 hover:border-amber-500 text-amber-700 hover:text-amber-900 rounded-2xl font-semibold text-lg backdrop-blur-sm bg-white/50 hover:bg-white transition-all duration-300 transform hover:-translate-y-1"
            >
              Unlock Premium
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;