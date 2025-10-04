import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  Target,
  Clock,
  Award,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import mudraData from "../data/mudra.json";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";

const TOTAL_MUDRAS = 10;

const MudraAssessment = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [currentMudra, setCurrentMudra] = useState([]);
  const [isAssessing, setIsAssessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [mudrasAttempted, setMudrasAttempted] = useState([]);
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const sessionStartRef = useRef(null);
  const [currentMudraPrediction, setCurrentMudraPrediction] = useState(null);

  const getRandomMudra = () => {
    let remainingMudras = mudraData.mudras.filter(
      (m) => !mudrasAttempted.includes(m.name_sanskrit)
    );
    if (remainingMudras.length === 0) remainingMudras = mudraData.mudras;
    const randomIndex = Math.floor(Math.random() * remainingMudras.length);
    return remainingMudras[randomIndex];
  };

  // Capture a frame from the video
  const captureFrame = () => {
    if (!videoRef.current) return null;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    console.log("Captured frame size:", canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg");
  };

  // Start the assessment
  const startAssessment = async () => {
    if ((mudrasAttempted?.length || 0) === 0) setScore(0);

    const randomMudra = getRandomMudra();
    setCurrentMudra(randomMudra);
    setIsAssessing(true);
    setAssessmentResult(null);
    setShowAnalysis(false);
    setTimeLeft(30);

    if (!sessionStartRef.current) sessionStartRef.current = Date.now();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      console.log("Camera stream started");
    } catch (error) {
      console.error("Camera access error:", error);
      alert("Unable to access camera.");
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endMudra(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Predict Mudra using backend
  const predictMudra = async () => {
    const dataUrl = captureFrame();
    if (!dataUrl) return;
    console.log("Data URL:", dataUrl.split(",")[0]); // Log only the prefix for brevity
    try {
      const res = await fetch(dataUrl);
      console.log("response from fetch:", res);
      const blob = await res.blob();
      const formData = new FormData();
      formData.append("file", blob, "hand.jpg");
      console.log("FormData: ", formData);
      const response = await axios.post(
        "http://localhost:8000/hand_analysis",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      console.log("Response from ML backend:", response);
      const data = response.data;
      console.log("ML Prediction Data:", data);
      // Take first hand if multiple hands detected
      const fingerData = data.finger_confidence?.hand_1
        ? Object.entries(data.finger_confidence.hand_1).map(
            ([finger, confidence]) => ({
              finger,
              correct: confidence >= 50, // threshold for correctness
              confidence,
            })
          )
        : [];

      const points = fingerData.filter((f) => f.correct).length;
      // After receiving backend data
      const mudraPredictions = data.mudra_predictions?.[0]?.predictions;
      console.log("Mudra Predictions:", mudraPredictions);

      const topPrediction = mudraPredictions?.[0]?.class || null;
      console.log("Top Mudra Prediction:", mudraPredictions?.[0].class);

      setCurrentMudraPrediction(topPrediction);
      const newResult = {
        accuracy:
          fingerData.length > 0
            ? Math.round(
                fingerData.reduce((sum, f) => sum + f.confidence, 0) /
                  fingerData.length
              )
            : 0,
        isCorrect: points >= 3,
        fingerAnalysis: fingerData,
        commonMistakes: fingerData
          .filter((f) => !f.correct)
          .map((f) => f.finger),
        points,
      };

      setAssessmentResult(newResult);
      setScore((prev) => prev + points);

      console.log("Assessment Result:", newResult); // this will show the updated result
    } catch (err) {
      console.error("Hand analysis error:", err);
      setAssessmentResult({
        accuracy: 0,
        isCorrect: false,
        fingerAnalysis: [],
        commonMistakes: ["Error in prediction"],
        points: 0,
      });
    }
  };

  // End a single mudra attempt
  const endMudra = async (timedOut = false) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (streamRef.current)
      streamRef.current.getTracks().forEach((track) => track.stop());

    if (currentMudra && !assessmentResult) {
      if (timedOut) {
        setAssessmentResult({
          accuracy: 0,
          isCorrect: false,
          fingerAnalysis: [],
          commonMistakes: ["Time up"],
          points: 0,
        });
      } else {
        await predictMudra();
      }
      setMudrasAttempted((prev) => [...prev, currentMudra.name_sanskrit]);
      setShowAnalysis(true);
    }

    setIsAssessing(false);
  };

  /*const simulateMLAssessment = (mudra) => {
            const accuracy = Math.floor(Math.random() * 40) + 60;
            const isCorrect = accuracy >= 80;
            const fingerAnalysis = [
                { finger: 'Thumb', correct: Math.random() > 0.3, confidence: Math.random() * 30 + 70 },
                { finger: 'Index', correct: Math.random() > 0.2, confidence: Math.random() * 30 + 70 },
                { finger: 'Middle', correct: Math.random() > 0.4, confidence: Math.random() * 30 + 70 },
                { finger: 'Ring', correct: Math.random() > 0.5, confidence: Math.random() * 30 + 70 },
                { finger: 'Little', correct: Math.random() > 0.3, confidence: Math.random() * 30 + 70 }
            ];
            const commonMistakes = fingerAnalysis.filter(f => !f.correct)
                .map(f => `${f.finger} position`);
    
            return { accuracy, isCorrect, fingerAnalysis, commonMistakes, points: isCorrect ? Math.floor(accuracy / 10) : 0 };
        };*/
  const nextMudra = async () => {
    if (mudrasAttempted.length >= TOTAL_MUDRAS) {
      await endAssessment();
      return;
    }
    await startAssessment();
  };

  const endAssessment = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (streamRef.current)
      streamRef.current.getTracks().forEach((track) => track.stop());

    let addedPoints = 0;
    if (currentMudra && !assessmentResult) {
      const result = simulateMLAssessment(currentMudra);
      setAssessmentResult(result);
      setScore((prev) => prev + result.points);
      addedPoints = result.points;
      setMudrasAttempted((prev) => [
        ...mudrasAttempted,
        currentMudra.name_sanskrit,
      ]);
      setShowAnalysis(true);
    }

    if (user?.id) {
      try {
        const finalScore = Number(score) + Number(addedPoints || 0);
        const durationSec = sessionStartRef.current
          ? Math.round((Date.now() - sessionStartRef.current) / 1000)
          : 0;
        await axios.post(
          `http://localhost:5000/api/users/${user.id}/sessions`,
          {
            points: finalScore,
            mudrasAttempted:
              (mudrasAttempted?.length || 0) +
              (currentMudra && !assessmentResult ? 1 : 0),
            durationSec,
            startedAt: sessionStartRef.current
              ? new Date(sessionStartRef.current).toISOString()
              : undefined,
          }
        );
      } catch (err) {
        console.error("Error saving points:", err);
      }
    }

    setCurrentMudra(null);
    setIsAssessing(false);
    setAssessmentResult(null);
    setShowAnalysis(false);
    setMudrasAttempted([]);
    setTimeLeft(30);
    sessionStartRef.current = null;
    setScore(0);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current)
        streamRef.current.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 pt-20 px-4 pb-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-6">
          <div className="rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 p-6 shadow-2xl border border-amber-300">
            <Sparkles size={36} className="mx-auto mb-3 text-yellow-300" />
            <h1 className="text-3xl font-bold text-white mb-2">
              Mudra Assessment
            </h1>
            <p className="text-amber-100">
              Test your mudra knowledge with real-time camera assessment
            </p>
          </div>
        </div>

        {/* Main Container - Compact Design */}
        <div className="rounded-2xl bg-white shadow-2xl border border-amber-200">
          <div className="grid grid-cols-1 xl:grid-cols-3 h-full">
            {/* Left Side - Camera (Larger) */}
            <div className="xl:col-span-2 p-6 border-r border-amber-200">
              <div className="h-full flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <Camera className="text-amber-600" size={24} />
                  <h2 className="text-xl font-bold text-amber-900">
                    Live Camera Feed
                  </h2>
                </div>

                <div className="flex-1 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 p-4 border border-amber-300">
                  {!currentMudra ? (
                    <div className="h-full flex items-center justify-center text-center text-amber-600">
                      <div>
                        <Camera size={48} className="mx-auto mb-3 opacity-50" />
                        <p className="font-semibold">
                          Camera will activate when assessment starts
                        </p>
                      </div>
                    </div>
                  ) : (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full rounded-lg object-cover shadow-lg max-h-96"
                    />
                  )}
                </div>

                {/* Status & Timer */}
                {currentMudra && (
                  <div className="mt-4">
                    {isAssessing && (
                      <div className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 p-3 text-white text-center mb-3">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Clock size={18} />
                          <span className="font-semibold">
                            Time Left: {timeLeft}s
                          </span>
                        </div>
                        <div className="w-full bg-amber-200 rounded-full h-2">
                          <div
                            className="bg-white h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${(timeLeft / 30) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    {/* Mudra Prediction Display */}
                    {currentMudraPrediction && (
                      <div className="rounded-lg bg-blue-50 p-3 border border-blue-200 mb-2">
                        <div className="flex items-center justify-between">
                          <span className="text-blue-800 font-semibold">
                            AI Detection:
                          </span>
                          <span className="text-blue-600">
                            {currentMudraPrediction}
                          </span>
                        </div>
                      </div>
                    )}
                    <p className="text-amber-600 text-sm text-center">
                      {isAssessing
                        ? "Perform the mudra shown in the camera"
                        : showAnalysis
                        ? "Analysis complete - ready for next mudra"
                        : "Ready to submit your mudra"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - Compact Controls & Info */}
            <div className="p-6">
              {!currentMudra ? (
                /* Welcome State */
                <div className="h-full flex flex-col">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <Award className="text-amber-600" size={24} />
                      <h2 className="text-xl font-bold text-amber-900">
                        Ready to Begin
                      </h2>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 p-3 text-white text-center">
                        <div className="text-lg font-bold">{score}</div>
                        <div className="text-amber-100 text-xs">Points</div>
                      </div>
                      <div className="rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 p-3 text-white text-center">
                        <div className="text-lg font-bold">{TOTAL_MUDRAS}</div>
                        <div className="text-green-100 text-xs">Mudras</div>
                      </div>
                    </div>

                    {/* Quick Instructions */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50">
                        <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">
                          1
                        </div>
                        <span className="text-amber-700 text-sm">
                          Start assessment
                        </span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50">
                        <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">
                          2
                        </div>
                        <span className="text-amber-700 text-sm">
                          Perform mudras
                        </span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50">
                        <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">
                          3
                        </div>
                        <span className="text-amber-700 text-sm">
                          Get feedback
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={startAssessment}
                    className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-white font-bold hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
                  >
                    <Camera size={18} />
                    Start Assessment
                  </button>
                </div>
              ) : (
                /* Assessment State */
                <div className="h-full flex flex-col">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <Target className="text-amber-600" size={24} />
                      <h2 className="text-xl font-bold text-amber-900">
                        Assessment
                      </h2>
                    </div>
                    {/* Current Mudra & Progress */}
                    <div className="rounded-xl bg-amber-50 p-3 border border-amber-200 mb-3">
                      <h3 className="text-lg font-bold text-amber-900 mb-1">
                        {currentMudra.name_sanskrit}
                      </h3>
                      <p className="text-amber-600 text-sm">
                        Type: {currentMudra.type}
                      </p>
                      <div className="flex justify-between items-center mt-2 text-sm text-amber-700">
                        <span>
                          Progress: {mudrasAttempted.length}/{TOTAL_MUDRAS}
                        </span>
                        <span>Points: {score}</span>
                      </div>
                    </div>
                    {/* Analysis Results - Compact */}
                    {showAnalysis && assessmentResult && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div
                            className={`rounded-lg p-2 text-white text-center ${
                              assessmentResult.accuracy >= 50
                                ? "bg-gradient-to-br from-green-500 to-emerald-600"
                                : "bg-gradient-to-br from-amber-500 to-orange-500"
                            }`}
                          >
                            <div className="text-md font-bold">
                              {assessmentResult.accuracy}%
                            </div>
                            <div className="text-green-100 text-xs">
                              Accuracy
                            </div>
                          </div>
                          <div className="rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 p-2 text-white text-center">
                            <div className="text-md font-bold">
                              +{assessmentResult.points}
                            </div>
                            <div className="text-blue-100 text-xs">Points</div>
                          </div>
                        </div>
                        {/* Mudra Match Status */}
                        {assessmentResult.predictedMudra && (
                          <div
                            className={`rounded-lg p-3 border ${
                              assessmentResult.predictedMudra.matchesTarget
                                ? "bg-green-50 border-green-200"
                                : "bg-amber-50 border-amber-200"
                            }`}
                          >
                            <div className="flex justify-between items-center text-sm">
                              <span className="font-semibold">
                                Mudra Match:
                              </span>
                              <span
                                className={
                                  assessmentResult.predictedMudra.matchesTarget
                                    ? "text-green-600 font-bold"
                                    : "text-amber-600"
                                }
                              >
                                {assessmentResult.predictedMudra.matchesTarget
                                  ? "✓ Correct"
                                  : "✗ Different"}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              Detected: {assessmentResult.predictedMudra.name}(
                              {Math.round(
                                assessmentResult.predictedMudra.confidence
                              )}
                              %)
                            </div>
                          </div>
                        )}
                        <div className="rounded-lg bg-amber-50 p-3 border border-amber-200">
                          <h4 className="font-semibold text-amber-900 text-sm mb-2">
                            Finger Analysis
                          </h4>
                          <div className="space-y-1">
                            {assessmentResult.fingerAnalysis
                              .slice(0, 5)
                              .map((f, idx) => (
                                <div
                                  key={idx}
                                  className="flex justify-between items-center text-xs text-amber-700"
                                >
                                  <span>{f.finger}</span>
                                  <span
                                    className={
                                      f.correct
                                        ? "text-green-600 font-semibold"
                                        : "text-red-500"
                                    }
                                  >
                                    {f.correct ? "✓" : "✗"}{" "}
                                    {Math.round(f.confidence)}%
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Compact Action Buttons */}
                  <div className="flex space-x-2 pt-3 border-t border-amber-200">
                    {!showAnalysis && (
                      <button
                        onClick={() => endMudra(false)}
                        className="flex-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-2 text-white text-sm font-semibold hover:from-amber-600 hover:to-orange-600 transition-all"
                      >
                        Submit
                      </button>
                    )}
                    {showAnalysis && mudrasAttempted.length < TOTAL_MUDRAS && (
                      <button
                        onClick={nextMudra}
                        className="flex-1 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 px-3 py-2 text-white text-sm font-semibold hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-1"
                      >
                        <TrendingUp size={14} />
                        Next
                      </button>
                    )}
                    <button
                      onClick={endAssessment}
                      className="flex-1 rounded-lg bg-gradient-to-r from-rose-500 to-red-600 px-3 py-2 text-white text-sm font-semibold hover:from-rose-600 hover:to-red-700 transition-all"
                    >
                      End
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MudraAssessment;
