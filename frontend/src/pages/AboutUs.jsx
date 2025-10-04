import React from "react";
import { Users, Target, Heart, Globe, Award } from "lucide-react";

const AboutUs = () => {
  const teamMembers = [
    {
      name: "Shreya Denre",
      role: "Team Leader & ML Engineer",
      bio: "Focused on leveraging Machine Learning and AI to preserve and promote cultural heritage",
    },
    {
      name: "Saheli Kundu",
      role: "Full Stack Developer",
      bio: "Highly skilled in MERN stack with a love for building websites related to Indian classical arts",
    },
    {
      name: "Sukanya Dasgupta",
      role: "Dance Consultant & Choreographer",
      bio: "Bharatanatyam dancer with experience in choreography and performing arts",
    },
    {
      name: "Khushi Bharti",
      role: "ML Engineer",
      bio: "Specialized in ML and AI-driven interfaces",
    },
    {
      name: "Iti Karmakar",
      role: "Frontend Developer",
      bio: "Focused on building engaging and responsive web experiences",
    },
    {
      name: "Aastha Shree",
      role: "UI/UX Developer",
      bio: "Passionate about designing intuitive and visually appealing user interfaces",
    },
  ];

  const values = [
    {
      icon: <Target className="w-8 h-8" />,
      title: "Our Mission",
      description:
        "To make classical dance more inclusive, understandable and accessible through AI-powered solutions while preserving India's cultural heritage.",
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Our Passion",
      description:
        "Driven by love for Indian classical arts and belief in technology's power to bridge cultural gaps.",
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Our Vision",
      description:
        "A world where anyone, anywhere can understand and learn the beautiful language of Indian dance mudras.",
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Excellence",
      description:
        "Combining cutting-edge machine learning with authentic dance expertise for accurate, meaningful results.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            About <span className="text-rose-600">NrityaLens</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Bridging centuries of dance tradition with modern artificial
            intelligence to preserve and propagate India's rich cultural
            heritage.
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <p className="text-gray-600 mb-4">
                The intricate stories of Indian classical dance are told through
                a sophisticated vocabulary of hand gestures. For centuries, this
                knowledge has been passed down through the sacred Guru-Shishya
                parampara.
              </p>
              <p className="text-gray-600 mb-4">
                However, in our rapidly digitizing world, we recognized a risk
                of this intricate knowledge being lost to future generations.
                MudraAI was born from this concern - a project that harnesses
                machine learning to recognize, classify, and explain these
                beautiful gestures.
              </p>
              <p className="text-gray-600">
                What started as an academic exploration has evolved into a
                comprehensive platform serving students, teachers, researchers,
                and audiences worldwide.
              </p>
            </div>
            <div className="bg-rose-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                What We Do
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-rose-500 mr-2">•</span>
                  Real-time mudra recognition using computer vision
                </li>
                <li className="flex items-start">
                  <span className="text-rose-500 mr-2">•</span>
                  Interactive learning with instant feedback
                </li>
                <li className="flex items-start">
                  <span className="text-rose-500 mr-2">•</span>
                  Digital library preserving regional variations
                </li>
                <li className="flex items-start">
                  <span className="text-rose-500 mr-2">•</span>
                  AI-powered assistance for students and teachers
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Our Values & Vision
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="text-rose-500 flex justify-center mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Meet Our Team
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-10 h-10 text-rose-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-rose-500 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Impact Section */}
        <div className="bg-rose-600 text-white rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-center mb-8">Our Impact</h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">5000+</div>
              <div className="text-rose-100">Students Empowered</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">28+23</div>
              <div className="text-rose-100">Mudras Documented</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">15+</div>
              <div className="text-rose-100">Dance Schools Partnered</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
