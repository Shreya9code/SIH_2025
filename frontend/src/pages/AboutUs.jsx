import React, { useState } from "react";
import { 
  Users, Target, Heart, Globe, Award, BookOpen, Camera, Sparkles,
  Mail, Phone, MapPin, Send, Clock, ExternalLink, ChevronDown, ChevronUp,
  CheckCircle 
} from "lucide-react";
import emailjs from 'emailjs-com';

const AboutUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    emailjs.send(
      'service_51a1bgq',
      'template_ntkwris',
      formData,
      'rekIDdh8wESkfILzW'
    ).then(
      (result) => {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setSubmitStatus(null), 5000);
      },
      (error) => {
        setSubmitStatus('error');
        setTimeout(() => setSubmitStatus(null), 5000);
      }
    );
  };

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const teamMembers = [
    {
      name: "Shreya Denre",
      role: "Team Leader & ML Engineer",
      bio: "Focused on leveraging Machine Learning and AI to preserve and promote cultural heritage",
      linkedin: "https://www.linkedin.com/in/shreya-denre-b2ba06279"
    },
    {
      name: "Saheli Kundu",
      role: "Full Stack Developer",
      bio: "Highly skilled in MERN stack with a love for building websites related to Indian classical arts",
      linkedin: "https://www.linkedin.com/in/sahelikundu22/"
    },
    {
      name: "Sukanya Dasgupta",
      role: "Dance Consultant & Choreographer",
      bio: "Bharatanatyam dancer with experience in choreography and performing arts",
      linkedin: "#"
    },
    {
      name: "Khushi Bharti",
      role: "ML Engineer",
      bio: "Specialized in ML and AI-driven interfaces",
      linkedin: "#"
    },
    {
      name: "Iti Karmakar",
      role: "Frontend Developer",
      bio: "Focused on building engaging and responsive web experiences",
      linkedin: "#"
    },
    {
      name: "Aastha Shree",
      role: "UI/UX Developer",
      bio: "Passionate about designing intuitive and visually appealing user interfaces",
      linkedin: "#"
    },
  ];

  const values = [
    {
      icon: <Target className="w-8 h-8" />,
      title: "Our Mission",
      description: "To make classical dance more inclusive, understandable and accessible through AI-powered solutions while preserving India's cultural heritage.",
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Our Passion",
      description: "Driven by love for Indian classical arts and belief in technology's power to bridge cultural gaps.",
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Our Vision",
      description: "A world where anyone, anywhere can understand and learn the beautiful language of Indian dance mudras.",
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Excellence",
      description: "Combining cutting-edge machine learning with authentic dance expertise for accurate, meaningful results.",
    },
  ];

  const features = [
    {
      icon: <Camera className="w-6 h-6" />,
      text: "Real-time mudra recognition using computer vision"
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      text: "Interactive learning with instant feedback"
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      text: "AI-powered assistance for students and teachers"
    },
    {
      icon: <Users className="w-6 h-6" />,
      text: "Digital library preserving regional variations"
    }
  ];

  const contactMethods = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'Email Us',
      details: 'nrityalens@gmail.com',
      description: 'Send us an email anytime'
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: 'Call Us',
      details: '+91 82407 81544',
      description: 'Mon-Fri from 9am to 6pm'
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: 'Visit Us',
      details: 'Heritage Institute of Technology, Kolkata, India',
      description: 'Come say hello at our office after selecting us for SIH 2025'
    }
  ];

  const socialLinks = [
    {
      name: 'GitHub',
      url: 'https://github.com/Shreya9code/SIH_2025',
      icon: '💻'
    },
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/in/shreya-denre-b2ba06279',
      icon: '💼'
    }
  ];

  const faqs = [
    {
      question: 'How accurate is the mudra recognition?',
      answer: 'Our AI model achieves over 99% accuracy for common mudras and continues to improve with more training data.'
    },
    {
      question: 'Can I use this for my dance school?',
      answer: 'Absolutely! We offer institutional licenses and custom solutions for dance schools and cultural institutions.'
    },
    {
      question: 'Is there a mobile app available?',
      answer: 'Yes, our mobile app is available on both iOS and Android platforms with all web features included.'
    },
    {
      question: 'How can researchers contribute?',
      answer: 'Researchers can contribute by documenting regional variations, historical context, or helping improve our AI models.'
    }
  ];

  const handleTeamMemberClick = (member) => {
    if (member.linkedin && member.linkedin !== "#") {
      window.open(member.linkedin, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 pt-20 px-4 pb-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Banner */}
        <div className="text-center mb-8">
          <div className="rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 p-6 shadow-2xl border border-amber-300 mb-6 transition-all duration-500 hover:shadow-3xl hover:scale-[1.02] hover:from-amber-300 hover:to-orange-300 group">
            <Sparkles size={40} className="mx-auto mb-3 !text-amber-100 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12" />
            <h1 className="text-3xl font-bold !text-white mb-2 transition-all duration-300 group-hover:tracking-wide">
              About <span className="!text-amber-100 transition-all duration-300 group-hover:!text-yellow-200">Us</span>
            </h1>
            <p className="!text-amber-100 text-base transition-all duration-300 group-hover:!text-yellow-100">
              Bridging centuries of dance tradition with modern AI to preserve India's cultural heritage.
            </p>
          </div>
        </div>

        {/* Mission Section */}
        <div className="bg-white !rounded-2xl !shadow-xl !border !border-amber-100 p-6 mb-8 transition-all duration-300 hover:!shadow-2xl hover:!border-amber-200">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold !text-amber-800 mb-4 transition-all duration-300 hover:!text-amber-700">
                Our Story
              </h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p className="transition-all duration-300 hover:!text-amber-800 hover:pl-2 hover:border-l-4 hover:border-amber-300">
                  The intricate stories of Indian classical dance are told through a sophisticated 
                  vocabulary of hand gestures called <span className="font-semibold !text-amber-600 transition-all duration-300 hover:!text-amber-500">mudras</span>. For centuries, this 
                  knowledge has been passed down through the sacred Guru-Shishya parampara.
                </p>
                <p className="transition-all duration-300 hover:!text-amber-800 hover:pl-2 hover:border-l-4 hover:border-amber-300">
                  However, in our rapidly digitizing world, we recognized a risk of this intricate 
                  knowledge being lost to future generations. <span className="font-semibold !text-amber-600 transition-all duration-300 hover:!text-amber-500">NrityaLens</span> was born from this 
                  concern - a project that harnesses machine learning to recognize, classify, and 
                  explain these beautiful gestures.
                </p>
                <p className="transition-all duration-300 hover:!text-amber-800 hover:pl-2 hover:border-l-4 hover:border-amber-300">
                  What started as an academic exploration has evolved into a comprehensive platform 
                  serving students, teachers, researchers, and audiences worldwide.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 !rounded-2xl p-6 !border !border-amber-100 transition-all duration-500 hover:!shadow-xl hover:!border-amber-200 hover:scale-[1.02] group">
              <h3 className="text-xl font-bold !text-amber-800 mb-4 flex items-center gap-3 transition-all duration-300 group-hover:!text-amber-700">
                <Sparkles className="w-5 h-5 !text-amber-500 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-180" />
                What We Offer
              </h3>
              <ul className="space-y-3">
                {features.map((feature, index) => (
                  <li 
                    key={index} 
                    className="flex items-start gap-3 text-gray-700 p-2 rounded-lg transition-all duration-300 hover:!bg-amber-100 hover:!shadow-md hover:scale-[1.02] hover:!text-amber-800 group/feature"
                  >
                    <div className="w-7 h-7 !bg-amber-100 !rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-300 group-hover/feature:!bg-amber-200 group-hover/feature:scale-110">
                      <span className="!text-amber-500 transition-all duration-300 group-hover/feature:!text-amber-600 group-hover/feature:scale-110">
                        {feature.icon}
                      </span>
                    </div>
                    <span className="leading-relaxed transition-all duration-300 group-hover/feature:font-medium">
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-center !text-amber-800 mb-6 transition-all duration-300 hover:!text-amber-700">
            Our Values & Vision
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white !rounded-2xl !shadow-xl !border !border-amber-100 p-4 text-center transition-all duration-500 hover:!shadow-2xl hover:!border-amber-200 hover:scale-105 hover:-translate-y-2 group cursor-pointer"
              >
                <div className="!text-amber-500 flex justify-center mb-3 transition-all duration-500 group-hover:scale-110 group-hover:!text-amber-400">
                  {value.icon}
                </div>
                <h3 className="text-lg font-bold !text-amber-800 mb-2 transition-all duration-300 group-hover:!text-amber-700">
                  {value.title}
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed transition-all duration-300 group-hover:!text-amber-800">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>

         {/* Team Section - Lighter Orange */}
<div className="mb-8">
  <h2 className="text-3xl font-bold text-center !text-amber-800 mb-8">
    Meet Our Team
  </h2>
  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
    {teamMembers.map((member, index) => (
      <div
        key={index}
        onClick={() => handleTeamMemberClick(member)}
        className="bg-white !rounded-2xl !shadow-xl !border !border-amber-100 p-6 text-center transition-all duration-300 group cursor-pointer 
                   hover:!shadow-2xl hover:!border-amber-200 hover:scale-105 hover:-translate-y-1 hover:bg-amber-50"
      >
        <div className="w-20 h-20 bg-gradient-to-r from-amber-400 to-orange-400 !rounded-full flex items-center justify-center mx-auto mb-4 
                        group-hover:scale-110 group-hover:from-amber-300 group-hover:to-orange-300 group-hover:shadow-lg transition-transform duration-300">
          <Users className="w-10 h-10 !text-white transition-transform duration-300 group-hover:scale-110" />
        </div>
        <h3 className="text-xl font-bold !text-amber-800 mb-2 transition-all duration-300 group-hover:!text-amber-700">
          {member.name}
        </h3>
        <p className="!text-amber-600 font-semibold mb-3 transition-all duration-300 group-hover:!text-amber-500">
          {member.role}
        </p>
        <p className="text-gray-700 leading-relaxed transition-all duration-300 group-hover:!text-amber-800">
          {member.bio}
        </p>
      </div>
    ))}
  </div>
</div>

        {/* Impact Section - White Text */}
        <div className="bg-gradient-to-r from-amber-400 to-orange-400 !text-white !rounded-2xl p-6 !shadow-2xl !border !border-amber-300 mb-8 transition-all duration-500 hover:!shadow-3xl hover:scale-[1.02] hover:from-amber-300 hover:to-orange-300 group">
          <h2 className="text-2xl font-bold text-center mb-6 transition-all duration-300 group-hover:scale-105 !text-white">
            Our Impact
          </h2>
          <div className="grid md:grid-cols-4 gap-4 text-center">
            {[
              { number: "28+23", label: "Mudras Documented", sub: "Single & Combined" },
              { number: "5000+", label: "Students Empowered", sub: "Across 15+ Countries" },
              { number: "15+", label: "Dance Schools", sub: "Partnerships" },
              { number: "24/7", label: "AI Assistance", sub: "Always Available" }
            ].map((item, index) => (
              <div 
                key={index}
                className="!bg-white/10 backdrop-blur-sm !rounded-xl p-3 transition-all duration-500 hover:!bg-white/20 hover:scale-110 hover:!shadow-lg group/item"
              >
                <div className="text-2xl font-bold mb-1 transition-all duration-300 group-hover/item:scale-110 !text-white">
                  {item.number}
                </div>
                <div className="!text-amber-100 font-semibold text-sm transition-all duration-300 group-hover/item:!text-yellow-100">
                  {item.label}
                </div>
                <p className="!text-amber-100 text-xs mt-1 transition-all duration-300 group-hover/item:!text-yellow-100">
                  {item.sub}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section - Equal Height */}
        <div data-contact-section className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Contact Form - Larger Message Box */}
          <div className="bg-white !rounded-2xl !shadow-xl !border !border-amber-100 p-6 transition-all duration-300 hover:!shadow-2xl hover:!border-amber-200">
            <h2 className="text-xl font-bold !text-amber-800 mb-4 transition-all duration-300 hover:!text-amber-700">
              Send us a Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-3">
                <div className="group">
                  <label htmlFor="name" className="block text-sm font-medium !text-gray-700 mb-1 transition-all duration-300 group-hover:!text-amber-700">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 !border !border-amber-200 !rounded-lg focus:!ring-2 focus:!ring-amber-400 focus:!border-amber-400 transition-all duration-300 !bg-amber-50 !text-amber-900 !placeholder-amber-600/60 hover:!border-amber-300 hover:!bg-amber-100"
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="group">
                  <label htmlFor="email" className="block text-sm font-medium !text-gray-700 mb-1 transition-all duration-300 group-hover:!text-amber-700">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 !border !border-amber-200 !rounded-lg focus:!ring-2 focus:!ring-amber-400 focus:!border-amber-400 transition-all duration-300 !bg-amber-50 !text-amber-900 !placeholder-amber-600/60 hover:!border-amber-300 hover:!bg-amber-100"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="group">
                <label htmlFor="subject" className="block text-sm font-medium !text-gray-700 mb-1 transition-all duration-300 group-hover:!text-amber-700">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 !border !border-amber-200 !rounded-lg focus:!ring-2 focus:!ring-amber-400 focus:!border-amber-400 transition-all duration-300 !bg-amber-50 !text-amber-900 !placeholder-amber-600/60 hover:!border-amber-300 hover:!bg-amber-100"
                  placeholder="What is this regarding?"
                />
              </div>

              <div className="group">
                <label htmlFor="message" className="block text-sm font-medium !text-gray-700 mb-1 transition-all duration-300 group-hover:!text-amber-700">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  className="w-full px-3 py-3 !border !border-amber-200 !rounded-lg focus:!ring-2 focus:!ring-amber-400 focus:!border-amber-400 transition-all duration-300 !bg-amber-50 !text-amber-900 !placeholder-amber-600/60 resize-none hover:!border-amber-300 hover:!bg-amber-100 min-h-[120px]"
                  placeholder="Tell us more about your inquiry..."
                />
              </div>

              {/* Success Message */}
              {submitStatus === 'success' && (
                <div className="flex items-center gap-2 p-3 !bg-green-100 !border !border-green-200 !rounded-lg animate-fadeIn">
                  <CheckCircle className="w-5 h-5 !text-green-600" />
                  <span className="!text-green-700 text-sm font-medium">Message sent successfully!</span>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="flex items-center gap-2 p-3 !bg-red-100 !border !border-red-200 !rounded-lg animate-fadeIn">
                  <span className="!text-red-700 text-sm font-medium">Failed to send message. Please try again.</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-400 to-orange-400 !text-white py-2 px-6 !rounded-lg hover:!from-amber-500 hover:!to-orange-500 focus:!ring-2 focus:!ring-amber-400 transition-all duration-500 flex items-center justify-center gap-2 font-semibold !shadow-lg hover:!shadow-xl hover:scale-105 active:scale-95 group"
              >
                <Send className="w-4 h-4 transition-transform duration-500 group-hover:scale-110 group-hover:translate-x-1" />
                <span className="transition-all duration-500 group-hover:tracking-wide">Send Message</span>
              </button>
            </form>
          </div>

          {/* Contact Information - Same Height */}
          <div className="bg-white !rounded-2xl !shadow-xl !border !border-amber-100 p-6 transition-all duration-300 hover:!shadow-2xl hover:!border-amber-200 h-full">
            <h2 className="text-xl font-bold !text-amber-800 mb-4 transition-all duration-300 hover:!text-amber-700">
              Get in Touch
            </h2>
            <div className="space-y-4">
              {contactMethods.map((method, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-3 p-3 rounded-lg transition-all duration-300 hover:!bg-amber-50 hover:!shadow-md group"
                >
                  <div className="!bg-amber-100 p-2 !rounded-lg !text-amber-500 flex-shrink-0 transition-all duration-300 group-hover:!bg-amber-200 group-hover:scale-110">
                    {method.icon}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold !text-amber-800 text-sm transition-all duration-300 group-hover:!text-amber-700">
                      {method.title}
                    </h3>
                    <p className="!text-amber-700 text-sm transition-all duration-300 group-hover:!text-amber-600">
                      {method.details}
                    </p>
                    <p className="text-xs !text-amber-600 transition-all duration-300 group-hover:!text-amber-500">
                      {method.description}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Follow Us - Replaced Office Hours */}
              <div className="flex items-start gap-3 p-3 rounded-lg transition-all duration-300 hover:!bg-amber-50 hover:!shadow-md group border-t border-amber-100 pt-4">
                <div className="!bg-amber-100 p-2 !rounded-lg !text-amber-500 flex-shrink-0 transition-all duration-300 group-hover:!bg-amber-200 group-hover:scale-110">
                  <Users className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold !text-amber-800 text-sm mb-2 transition-all duration-300 group-hover:!text-amber-700">
                    Follow Us
                  </h3>
                  <div className="flex gap-2">
                    {socialLinks.map((social, index) => (
                      <a
                        key={index}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2 py-1 !bg-amber-100 !rounded-lg transition-all duration-300 hover:!bg-amber-200 hover:!text-amber-800 hover:scale-110 hover:!shadow-md group"
                      >
                        <span className="text-xs transition-transform duration-300 group-hover:scale-110">{social.icon}</span>
                        <span className="text-xs transition-all duration-300 group-hover:font-medium">{social.name}</span>
                        <ExternalLink className="w-3 h-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section - Two Columns with Orange Index & Light Green Progress Bar Background */}
        <div className="bg-white !rounded-2xl !shadow-xl !border !border-amber-100 p-6 mb-8 transition-all duration-300 hover:!shadow-2xl hover:!border-amber-200">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold !text-amber-800 mb-3 transition-all duration-300 hover:!text-amber-700">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="!bg-gradient-to-br from-amber-50 to-orange-50 !rounded-xl !border !border-amber-200 p-5 transition-all duration-300 hover:!shadow-lg hover:!border-amber-300 group cursor-pointer"
                onClick={() => toggleFaq(index)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 !bg-gradient-to-r from-amber-400 to-orange-400 !rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:!bg-amber-500 group-hover:scale-110">
                        <span className="!text-white font-bold text-sm">Q{index + 1}</span>
                      </div>
                      <h3 className="font-semibold !text-amber-800 text-base transition-all duration-300 group-hover:!text-amber-700">
                        {faq.question}
                      </h3>
                    </div>
                    
                    {/* Light Green Progress Bar Background with Green Fill */}
                    <div className="w-full h-1.5 !bg-green-100 !rounded-full overflow-hidden mb-3">
                      <div 
                        className={`h-full !bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500 ${
                          openFaqIndex === index ? 'w-full' : 'w-0 group-hover:w-1/3'
                        }`}
                      />
                    </div>

                    {openFaqIndex === index && (
                      <div className="animate-fadeIn">
                        <div className="!bg-white !rounded-lg p-3 !border !border-green-200">
                          <div className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 !text-green-600 flex-shrink-0 mt-0.5" />
                            <p className="!text-amber-700 text-sm leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                    {openFaqIndex === index ? (
                      <ChevronUp className="w-5 h-5 !text-amber-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 !text-amber-600" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* FAQ Footer */}
          <div className="text-center mt-8 pt-6 !border-t !border-amber-100">
            <p className="!text-amber-600 text-base mb-4">
              Still have questions?
            </p>
            <button 
              onClick={() => {
                const contactSection = document.querySelector('[data-contact-section]');
                if (contactSection) {
                  contactSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                  });
                }
              }}
              className="!bg-gradient-to-r from-amber-400 to-orange-400 !text-white !font-semibold py-3 px-8 !rounded-xl hover:!from-amber-500 hover:!to-orange-500 transition-all duration-500 !shadow-lg hover:!shadow-xl hover:scale-105 active:scale-95 group"
            >
              <span className="flex items-center gap-2 transition-all duration-500 group-hover:tracking-wide">
                <Mail className="w-5 h-5 transition-transform duration-500 group-hover:scale-110" />
                Contact Us
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;