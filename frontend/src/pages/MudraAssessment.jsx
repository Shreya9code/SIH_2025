import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  Target,
  Clock,
  Award,
  Sparkles,
  TrendingUp,
  Image as ImageIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import mudraData from "../data/mudra.json";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";

const TOTAL_MUDRAS = 10;

const MudraAssessment = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [currentMudra, setCurrentMudra] = useState(null);
  const [isAssessing, setIsAssessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [mudrasAttempted, setMudrasAttempted] = useState([]);
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [currentMudraPrediction, setCurrentMudraPrediction] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [annotatedImage, setAnnotatedImage] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const sessionStartRef = useRef(null);
  const canvasRef = useRef(null);

  const getRandomMudra = () => {
    // If this is the first attempt, return Sandamsha
    if ((mudrasAttempted?.length || 0) === 0) {
      const sandamsha = mudraData.mudras.find(
        (m) => m.name_sanskrit === "Sandamsha"
      );
      if (sandamsha) return sandamsha;
    }

    // Otherwise, pick a random mudra not yet attempted
    let remainingMudras = mudraData.mudras.filter(
      (m) => !mudrasAttempted.includes(m.name_sanskrit)
    );
    if (remainingMudras.length === 0) remainingMudras = mudraData.mudras;

    const randomIndex = Math.floor(Math.random() * remainingMudras.length);
    return remainingMudras[randomIndex];
  };

  // Capture a single frame from the camera
  const captureSingleImage = () => {
    if (!videoRef.current) return null;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    const imageDataUrl = canvas.toDataURL("image/jpeg");
    setCapturedImage(imageDataUrl);
    console.log("📸 Single image captured");

    return imageDataUrl;
  };

  // Start the assessment
  const startAssessment = async () => {
    if ((mudrasAttempted?.length || 0) === 0) setScore(0);

    const randomMudra = getRandomMudra();
    setCurrentMudra(randomMudra);
    setIsAssessing(true);
    setAssessmentResult(null);
    setShowAnalysis(false);
    setCapturedImage(null);
    setAnnotatedImage(null);
    setCurrentMudraPrediction(null);
    setTimeLeft(30);

    if (!sessionStartRef.current) sessionStartRef.current = Date.now();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      console.log("Camera stream started for preview");
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
    // Capture single image first
    const dataUrl = captureSingleImage();
    if (!dataUrl) {
      console.error("❌ Failed to capture image");
      return;
    }

    console.log("🔄 Sending image to backend for analysis...");

    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const formData = new FormData();
      formData.append("file", blob, "hand.jpg");

      console.log("📤 Sending request to backend...");
      const response = await axios.post(
        "http://localhost:8000/hand_analysis",
        formData,
        {
          params: {
            include_annotated_image: true, // Request annotated image
          },
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("✅ Full backend response:", response.data);
      const data = response.data;

      // Handle annotated image if available
      if (data.annotated_image) {
        const annotatedImg = `data:image/jpeg;base64,${data.annotated_image}`;
        setAnnotatedImage(annotatedImg);
        console.log("🖼️ Annotated image received");
      }

      // Handle case when no hands are detected
      if (data.num_hands === 0) {
        console.log("❌ No hands detected");
        setAssessmentResult({
          accuracy: 0,
          isCorrect: false,
          fingerAnalysis: [],
          commonMistakes: ["No hands detected in the image"],
          points: 0,
          predictedMudra: null,
        });

        return;
      }

      // Extract finger confidence data
      const fingerData = [];
      let totalConfidence = 0;
      let fingerCount = 0;

      // Process finger confidence for each detected hand
      Object.entries(data.finger_confidence || {}).forEach(
        ([handKey, fingers]) => {
          Object.entries(fingers).forEach(([finger, confidence]) => {
            fingerData.push({
              finger: `${finger} (${handKey})`,
              correct: confidence >= 50,
              confidence: confidence,
            });
            totalConfidence += confidence;
            fingerCount++;
          });
        }
      );

      const averageAccuracy =
        fingerCount > 0 ? Math.round(totalConfidence / fingerCount) : 0;

      // Extract mudra predictions
      const mudraPredictions = data.mudra_predictions || [];
      console.log("📊 Mudra predictions:", mudraPredictions);

      let topPrediction = null;
      let predictionConfidence = 0;

      if (
        mudraPredictions.length > 0 &&
        mudraPredictions[0].predictions?.length > 0
      ) {
        topPrediction = mudraPredictions[0].predictions[0];
        predictionConfidence = topPrediction.confidence || 0;
        console.log(
          "🎯 Top prediction:",
          topPrediction.class,
          "with confidence:",
          predictionConfidence
        );
      }

      // Calculate points based on accuracy and mudra match
      const basePoints = Math.floor(averageAccuracy / 20); // 0-5 points based on accuracy
      const mudraMatchBonus =
        topPrediction &&
          currentMudra &&
          topPrediction.class.toLowerCase() ===
          currentMudra.name_sanskrit.toLowerCase()
          ? 2
          : 0;
      const totalPoints = basePoints + mudraMatchBonus;

      // Identify common mistakes (fingers with low confidence)
      const commonMistakes = fingerData
        .filter((f) => !f.correct)
        .map((f) => `${f.finger} position (${Math.round(f.confidence)}%)`);

      const result = {
        accuracy: averageAccuracy,
        isCorrect: averageAccuracy >= 70,
        fingerAnalysis: fingerData,
        commonMistakes:
          commonMistakes.length > 0
            ? commonMistakes
            : ["Good finger positioning"],
        points: totalPoints,
        predictedMudra: topPrediction
          ? {
            name: topPrediction.class,
            confidence: predictionConfidence,
            matchesTarget:
              topPrediction &&
              currentMudra &&
              topPrediction.class.toLowerCase() ===
              currentMudra.name_sanskrit.toLowerCase(),
          }
          : null,
      };

      console.log("📈 Assessment result:", result);
      setAssessmentResult(result);
      setCurrentMudraPrediction(topPrediction?.class || null);
      setScore((prev) => prev + totalPoints);
    } catch (err) {
      console.error("❌ Hand analysis error:", err);
      setAssessmentResult({
        accuracy: 0,
        isCorrect: false,
        fingerAnalysis: [],
        commonMistakes: ["Error connecting to analysis service"],
        points: 0,
        predictedMudra: null,
      });
    }
  };

  // End a single mudra attempt
  const endMudra = async (timedOut = false) => {
    if (timerRef.current) clearInterval(timerRef.current);

    // Stop camera stream immediately after capture
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (currentMudra && !assessmentResult) {
      if (timedOut) {
        setAssessmentResult({
          accuracy: 0,
          isCorrect: false,
          fingerAnalysis: [],
          commonMistakes: ["Time up - no submission received"],
          points: 0,
          predictedMudra: null,
        });
      } else {
        await predictMudra();
      }
      setMudrasAttempted((prev) => [...prev, currentMudra.name_sanskrit]);
      setShowAnalysis(true);
    }

    setIsAssessing(false);
  };

  const nextMudra = async () => {
    if (mudrasAttempted.length >= TOTAL_MUDRAS) {
      await endAssessment();
      return;
    }
    await startAssessment();
  };

  const endAssessment = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    let addedPoints = 0;
    if (currentMudra && !assessmentResult) {
      addedPoints = 0;
      setMudrasAttempted((prev) => [...prev, currentMudra.name_sanskrit]);
      setShowAnalysis(true);
    }

    if (user?.id) {
      try {
        const finalScore = Number(score) + Number(addedPoints || 0);
        const durationSec = sessionStartRef.current
          ? Math.round((Date.now() - sessionStartRef.current) / 1000)
          : 0;
        await axios.post(
          `https://nrityalens-backend.onrender.com/api/users/${user.id}/sessions`,
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
    setCurrentMudraPrediction(null);
    setCapturedImage(null);
    setAnnotatedImage(null);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 pt-20 px-4 pb-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-6">
          <div className="rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 p-6 shadow-2xl border border-amber-300">
            <Sparkles size={36} className="mx-auto mb-3 text-yellow-300" />
            <h1 className="text-3xl font-bold mb-2 !text-white">
              Mudra Assessment
            </h1>

            <p className="text-amber-100">
              Test your mudra knowledge with single image capture assessment
            </p>
          </div>
        </div>

        {/* Main Container - Compact Design */}
        <div className="rounded-2xl bg-white shadow-2xl border border-amber-200">
          <div className="grid grid-cols-1 xl:grid-cols-3 h-full">
            {/* Left Side - Camera Preview & Results */}
            <div className="xl:col-span-2 p-6 border-r border-amber-200">
              <div className="h-full flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <Camera className="text-amber-600" size={24} />
                  <h2 className="text-xl font-bold text-amber-900">
                    {showAnalysis && annotatedImage
                      ? "Analysis Result"
                      : "Camera Preview"}
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
                  ) : showAnalysis && annotatedImage ? (
                    // Show annotated image after analysis
                    <div className="h-full flex flex-col items-center justify-center">
                      <div className="text-center mb-4">
                        <ImageIcon
                          className="mx-auto mb-2 text-green-600"
                          size={32}
                        />
                        <p className="text-green-600 font-semibold">
                          Analysis Complete
                        </p>
                        <p className="text-amber-600 text-sm">
                          Hand landmarks detected and analyzed
                        </p>
                      </div>
                      <img
                        src={annotatedImage}
                        alt="Annotated hand with landmarks"
                        className="w-full max-w-md rounded-lg shadow-lg border-2 border-green-300"
                      />
                      <p className="text-amber-600 text-sm mt-2 text-center">
                        Green lines show hand landmarks and connections
                      </p>
                    </div>
                  ) : capturedImage ? (
                    // Show captured image before analysis
                    <div className="h-full flex flex-col items-center justify-center">
                      <div className="text-center mb-4">
                        <ImageIcon
                          className="mx-auto mb-2 text-blue-600"
                          size={32}
                        />
                        <p className="text-blue-600 font-semibold">
                          Image Captured
                        </p>
                        <p className="text-amber-600 text-sm">
                          Processing analysis...
                        </p>
                      </div>
                      <img
                        src={capturedImage}
                        alt="Captured hand"
                        className="w-full max-w-md rounded-lg shadow-lg border-2 border-blue-300"
                      />
                    </div>
                  ) : (
                    // Show live camera preview
                    <div className="h-full flex flex-col">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full rounded-lg object-cover shadow-lg max-h-96"
                      />
                      <div className="mt-4 text-center">
                        <p className="text-amber-600 text-sm">
                          Position your hand and click Submit to capture and
                          analyze
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Status & Timer */}
                {currentMudra && (
                  <div className="mt-4">
                    {isAssessing && !showAnalysis && (
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
                      {isAssessing && !capturedImage
                        ? `Perform: ${currentMudra.name_sanskrit}`
                        : capturedImage && !showAnalysis
                          ? "Analyzing your hand position..."
                          : showAnalysis
                            ? "Analysis complete - ready for next mudra"
                            : "Ready to capture and analyze"}
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
                          Position hand and submit
                        </span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50">
                        <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">
                          3
                        </div>
                        <span className="text-amber-700 text-sm">
                          Get analysis with landmarks
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
                            className={`rounded-lg p-2 text-white text-center ${assessmentResult.accuracy >= 70
                              ? "bg-gradient-to-br from-green-500 to-emerald-600"
                              : "bg-gradient-to-br from-amber-500 to-orange-500"
                              }`}
                          >
                            <div className="text-md font-bold">
                              {assessmentResult.accuracy}%
                            </div>
                            <div className="text-opacity-90 text-xs">
                              Accuracy
                            </div>
                          </div>
                          <div className="rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 p-2 text-white text-center">
                            <div className="text-md font-bold">
                              +{assessmentResult.points}
                            </div>
                            <div className="text-blue-100 text-xs">Points</div>
                          </div>
                        </div>
                        {/* Show common mistakes even if no fingers */}
                        <div className="rounded-lg bg-amber-50 p-3 border border-amber-200">
                          <h4 className="font-semibold text-amber-900 text-lg mb-2">
                            Analysis Notes
                          </h4>
                          {assessmentResult.commonMistakes.map(
                            (mistake, idx) => (
                              <div
                                key={idx}
                                className="text-lg font-bold text-amber-700"
                              >
                                {mistake}
                              </div>
                            )
                          )}
                        </div>

                        {/* Mudra Match Status */}
                        {assessmentResult.predictedMudra && (
                          <div
                            className={`rounded-lg p-3 border ${assessmentResult.predictedMudra.matchesTarget
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
                    {!showAnalysis && !capturedImage && (
                      <button
                        onClick={() => endMudra(false)}
                        className="flex-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-2 text-white text-sm font-semibold hover:from-amber-600 hover:to-orange-600 transition-all flex items-center justify-center gap-1"
                      >
                        <Camera size={14} />
                        Capture & Analyze
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
