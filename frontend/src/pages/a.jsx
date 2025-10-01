import React, { useState, useRef, useEffect } from 'react';
import { Camera, Target, Clock, Award, AlertCircle, CheckCircle, X, BookOpen } from 'lucide-react';
import { useUser } from "@clerk/clerk-react";
import axios from 'axios';

import mudraData from '../data/mudra.json';

const MudraAssessment = () => {
  const { user } = useUser(); // ✅ Clerk hook for user
  const [currentMudra, setCurrentMudra] = useState(null);
  const [isAssessing, setIsAssessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [score, setScore] = useState(0);
  const [mudraCount, setMudraCount] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  const getRandomMudra = () => {
    const randomIndex = Math.floor(Math.random() * mudraData.mudras.length);
    return mudraData.mudras[randomIndex];
  };

  const startAssessment = async () => {
    if (mudraCount >= 10) return;

    const randomMudra = getRandomMudra();
    setCurrentMudra(randomMudra);
    setIsAssessing(true);
    setAssessmentResult(null);
    setShowDetails(false);
    setTimeLeft(30);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endAssessment(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const simulateMLAssessment = (mudra) => {
    const accuracy = Math.floor(Math.random() * 40) + 60;
    const isCorrect = accuracy >= 80;
    const fingerAnalysis = [
      { finger: 'Thumb', correct: Math.random() > 0.3, confidence: Math.random() * 30 + 70 },
      { finger: 'Index', correct: Math.random() > 0.2, confidence: Math.random() * 30 + 70 },
      { finger: 'Middle', correct: Math.random() > 0.4, confidence: Math.random() * 30 + 70 },
      { finger: 'Ring', correct: Math.random() > 0.5, confidence: Math.random() * 30 + 70 },
      { finger: 'Little', correct: Math.random() > 0.3, confidence: Math.random() * 30 + 70 },
      { finger: 'Palm', correct: Math.random() > 0.6, confidence: Math.random() * 30 + 70 },
      { finger: 'Wrist', correct: Math.random() > 0.4, confidence: Math.random() * 30 + 70 }
    ];

    const commonMistakes = fingerAnalysis.filter(f => !f.correct)
      .map(f => `${f.finger} position incorrect (${Math.round(f.confidence)}% confidence)`);

    return { accuracy, isCorrect, fingerAnalysis, commonMistakes, points: isCorrect ? Math.floor(accuracy / 10) : 0 };
  };

  const endAssessment = async (manual = false) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    setIsAssessing(false);

    if (currentMudra) {
      const result = simulateMLAssessment(currentMudra);
      setAssessmentResult(result);
      setScore(prev => prev + result.points);
      setMudraCount(prev => prev + 1);

      // Save total points to database only after finishing all 10 mudras or if manual end
      if ((mudraCount + 1 >= 10) || manual) {
        if (user?.id) {
          try {
            await axios.put(`http://localhost:5000/api/users/${user.id}/points`, { points: score + result.points });
            console.log("Points saved to DB:", score + result.points);
          } catch (err) {
            console.error("Error saving points:", err);
          }
        }
      }
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF9E6] pt-16">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#8B4513] mb-3">Mudra Assessment</h1>
          <p className="text-lg text-[#8C3B26] max-w-2xl mx-auto">
            Test your mudra knowledge with real-time camera assessment
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Box */}
          <div className="bg-white rounded-2xl shadow-lg border border-[#FFD34E]/30 p-6 flex flex-col justify-between">
            <div className="mb-4">
              <Award className="w-6 h-6 text-[#D94F3D]" />
              <h2 className="text-2xl font-bold text-[#8B4513] mt-2">Total Score: {score} pts</h2>
              <h3 className="text-lg text-[#8C3B26]">Mudras Completed: {mudraCount}/10</h3>
            </div>

            {!isAssessing && mudraCount < 10 && (
              <button
                onClick={startAssessment}
                className="px-6 py-4 bg-gradient-to-r from-[#D94F3D] to-[#8B0000] text-white rounded-xl font-semibold text-lg hover:from-[#B33C2D] hover:to-[#660000] transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Start/Next Mudra
              </button>
            )}

            {mudraCount >= 10 && (
              <div className="text-center text-[#8C3B26] font-semibold">
                ✅ Assessment Complete! Final Score: {score} pts
              </div>
            )}

            <button
              onClick={() => endAssessment(true)}
              className="mt-4 px-6 py-3 bg-red-700 text-white rounded-xl font-semibold hover:bg-red-800 transition-all duration-300 shadow-lg"
            >
              End Assessment Early
            </button>
          </div>

          {/* Right Box */}
          <div>
            {!isAssessing && !assessmentResult && (
              <div className="bg-white rounded-2xl shadow-lg border border-[#FFD34E]/30 p-6">
                <h3 className="text-xl font-semibold text-[#8B4513] mb-4">Assessment Instructions</h3>
                <ul className="list-disc list-inside text-[#8C3B26] space-y-1">
                  <li>Click "Start/Next Mudra" to begin</li>
                  <li>Perform the displayed mudra in front of your camera</li>
                  <li>Hold the position steady for accurate assessment</li>
                  <li>Get instant feedback and earn points based on accuracy</li>
                </ul>
              </div>
            )}

            {isAssessing && (
              <div className="bg-white rounded-2xl shadow-lg border border-[#FFD34E]/30 p-6">
                <h3 className="text-xl font-semibold text-[#8B4513] mb-4">Live Camera - {currentMudra?.name_english}</h3>
                <video ref={videoRef} autoPlay playsInline className="w-full h-80 rounded-lg object-cover mb-4" />
                <div className="flex justify-between items-center">
                  <span>Time Left: {timeLeft}s</span>
                  <span>Mudra {mudraCount + 1}/10</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Analysis Panel */}
        {assessmentResult && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg border border-[#FFD34E]/30 p-6 grid lg:grid-cols-2 gap-4">
            <div>
              <h3 className="text-xl font-semibold text-[#8B4513] mb-2">{currentMudra.name_english} Analysis</h3>
              <div className={`p-4 rounded-xl ${assessmentResult.isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                <h4 className="font-semibold text-[#8B4513]">Result: {assessmentResult.isCorrect ? '✅ Correct' : '❌ Needs Practice'}</h4>
                <p className="text-[#8C3B26]">Points earned: {assessmentResult.points}</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-[#8B4513] mb-2">Finger Analysis</h4>
              <div className="bg-[#FFF9E6] rounded-xl p-3 border border-[#FFD34E]/50">
                {assessmentResult.fingerAnalysis.map((f, idx) => (
                  <div key={idx} className="flex justify-between mb-1 text-[#8C3B26]">
                    <span>{f.finger}</span>
                    <span>{f.correct ? '✅' : '❌'} {Math.round(f.confidence)}%</span>
                  </div>
                ))}
              </div>

              {assessmentResult.commonMistakes.length > 0 && (
                <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 mt-2">
                  <h4 className="font-semibold text-amber-800 mb-1">Areas for Improvement</h4>
                  <ul className="list-disc list-inside text-amber-700">
                    {assessmentResult.commonMistakes.map((m, idx) => <li key={idx}>{m}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MudraAssessment;
