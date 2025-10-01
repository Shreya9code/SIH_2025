import React, { useState, useRef, useEffect } from 'react';
import { Camera, Target, Clock, Award, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import mudraData from '../data/mudra.json';
import axios from 'axios';
import { useUser } from "@clerk/clerk-react";

const TOTAL_MUDRAS = 10;

const MudraAssessment = () => {
    const { user } = useUser(); // Get logged-in user
    const navigate = useNavigate();
    const [currentMudra, setCurrentMudra] = useState(null);
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

    const getRandomMudra = () => {
        let remainingMudras = mudraData.mudras.filter(m => !mudrasAttempted.includes(m.name_sanskrit));
        if (remainingMudras.length === 0) remainingMudras = mudraData.mudras;
        const randomIndex = Math.floor(Math.random() * remainingMudras.length);
        return remainingMudras[randomIndex];
    };

    const startAssessment = async () => {
        // Starting a fresh session: reset score if no mudras attempted yet
        if ((mudrasAttempted?.length || 0) === 0) {
            setScore(0);
        }
        const randomMudra = getRandomMudra();
        setCurrentMudra(randomMudra);
        setIsAssessing(true);
        setAssessmentResult(null);
        setShowAnalysis(false);
        setTimeLeft(30);
        if (!sessionStartRef.current) {
            sessionStartRef.current = Date.now();
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
            streamRef.current = stream;
            videoRef.current.srcObject = stream;
        } catch (error) {
            console.error('Camera access error:', error);
            alert('Unable to access camera.');
            return;
        }

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    endMudra(true);
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
            .map(f => `${f.finger} incorrect (${Math.round(f.confidence)}% confidence)`);

        return { accuracy, isCorrect, fingerAnalysis, commonMistakes, points: isCorrect ? Math.floor(accuracy / 10) : 0 };
    };

    const endMudra = (timedOut = false) => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());

        if (currentMudra && !assessmentResult) {
            if (timedOut) {
                const result = { accuracy: 0, isCorrect: false, fingerAnalysis: [], commonMistakes: ['Time up'], points: 0 };
                setAssessmentResult(result);
                setScore(prev => prev + 0);
            } else {
                const result = simulateMLAssessment(currentMudra);
                setAssessmentResult(result);
                setScore(prev => prev + result.points);
            }
            setMudrasAttempted(prev => [...prev, currentMudra.name_sanskrit]);
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

    // In MudraAssessment.jsx

    const endAssessment = async () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());

        let addedPoints = 0;
        if (currentMudra && !assessmentResult) {
            const result = simulateMLAssessment(currentMudra);
            setAssessmentResult(result);
            setScore(prev => prev + result.points);
            addedPoints = result.points;
            setMudrasAttempted(prev => [...mudrasAttempted, currentMudra.name_sanskrit]);
            setShowAnalysis(true);
        }

        // Save session as a record instead of overwriting total points
        if (user?.id) {
            try {
                const finalScore = Number(score) + Number(addedPoints || 0);
                const durationSec = sessionStartRef.current ? Math.round((Date.now() - sessionStartRef.current) / 1000) : 0;
                await axios.post(`http://localhost:5000/api/users/${user.id}/sessions`, {
                    points: finalScore,
                    mudrasAttempted: (mudrasAttempted?.length || 0) + (currentMudra && !assessmentResult ? 1 : 0),
                    durationSec,
                    startedAt: sessionStartRef.current ? new Date(sessionStartRef.current).toISOString() : undefined,
                });
                console.log("Session saved to DB:", finalScore);
            } catch (err) {
                console.error("Error saving points:", err);
            }
        }

        // ✅ Reset for fresh start
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
            if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
        };
    }, []);

    return (
        <div className="min-h-screen bg-[#FFF9E6] pt-16">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-[#8B4513] mb-3">Mudra Assessment</h1>
                    <p className="text-lg text-[#8C3B26] max-w-2xl mx-auto">
                        Test your mudra knowledge with real-time camera assessment and get instant feedback
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Box */}
                    <div className="bg-white rounded-2xl shadow-lg border border-[#FFD34E]/30 p-6 flex flex-col justify-between">
                        {!currentMudra && (
                            <>
                                <div className="mb-6 flex items-center space-x-3">
                                    <Award className="w-6 h-6 text-[#D94F3D]" />
                                    <h2 className="text-2xl font-bold text-[#8B4513]">Total Points: {score}</h2>
                                </div>
                                <button
                                    onClick={startAssessment}
                                    className="px-6 py-4 bg-gradient-to-r from-[#D94F3D] to-[#8B0000] text-white rounded-xl font-semibold text-lg hover:from-[#B33C2D] hover:to-[#660000] transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    Start New Assessment
                                </button>
                            </>
                        )}

                        {currentMudra && (
                            <>
                                <div>
                                    <h2 className="text-xl font-semibold text-[#8B4513] mb-1">Mudra {mudrasAttempted.length}/{TOTAL_MUDRAS}</h2>
                                    <h3 className="text-2xl font-bold text-[#8B4513]">{currentMudra.name_sanskrit}</h3>
                                    <p className="text-lg text-[#8C3B26] font-sanskrit">hint: {currentMudra.type}</p>
                                </div>
                                <div className="mt-2 flex items-center justify-between">
                                    <div>
                                        <p className="text-[#8C3B26] font-semibold">Current Points: {assessmentResult?.points || 0}</p>
                                        <p className="text-[#8C3B26] font-semibold">Total Points: {score}</p>
                                    </div>
                                    {isAssessing && (
                                        <p className="text-[#8C3B26] font-semibold">Time Left: {timeLeft}s</p>
                                    )}
                                </div>

                                {showAnalysis && assessmentResult && (
                                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-[#FFF9E6] rounded-xl p-4 border border-[#FFD34E]/50">
                                            <h4 className="font-semibold text-[#8B4513] mb-2">Finger Analysis</h4>
                                            {assessmentResult.fingerAnalysis.map((f, idx) => (
                                                <div key={idx} className="flex justify-between text-[#8C3B26] mb-1">
                                                    <span>{f.finger}</span>
                                                    <span>{f.correct ? '✅' : '❌'} {Math.round(f.confidence)}%</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                                            <h4 className="font-semibold text-amber-800 mb-2">Areas for Improvement</h4>
                                            {assessmentResult.commonMistakes.length > 0 ? (
                                                <ul className="list-disc list-inside text-amber-700">
                                                    {assessmentResult.commonMistakes.map((m, idx) => <li key={idx}>{m}</li>)}
                                                </ul>
                                            ) : <p className="text-amber-700">No major mistakes!</p>}
                                        </div>
                                    </div>
                                )}


                            </>
                        )}
                    </div>

                    {/* Right Box */}
                    <div>
                        {!currentMudra && (
                            <div className="bg-white rounded-2xl shadow-lg border border-[#FFD34E]/30 p-6">
                                <h3 className="text-xl font-semibold text-[#8B4513] mb-4">Assessment Instructions</h3>
                                <ul className="list-disc list-inside space-y-2 text-[#8C3B26]">
                                    <li>Click "Start New Assessment" to begin</li>
                                    <li>Perform the displayed mudra in front of your camera</li>
                                    <li>Hold the position steady for accurate assessment</li>
                                    <li>Get instant feedback and earn points based on accuracy</li>
                                    <li>You will be assessed on 10 mudras per session</li>
                                </ul>

                                {/* Start Button (appears after reset too) */}
                                <button
                                    onClick={startAssessment}
                                    className="mt-6 w-full px-6 py-4 bg-gradient-to-r from-[#D94F3D] to-[#8B0000] text-white rounded-xl font-semibold text-lg hover:from-[#B33C2D] hover:to-[#660000] transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    Start New Assessment
                                </button>
                            </div>
                        )}

                        {currentMudra && (
                            <div className="bg-white rounded-2xl shadow-lg border border-[#FFD34E]/30 p-6">
                                <h3 className="text-xl font-semibold text-[#8B4513] mb-4">Live Camera</h3>
                                <video ref={videoRef} autoPlay playsInline className="w-full h-80 rounded-lg object-cover" />

                                {/* Buttons under camera */}
                                <div className="mt-4 flex flex-col space-y-3">
                                    <div className="flex space-x-3">
                                        {!showAnalysis && (
                                            <button
                                                onClick={() => endMudra(false)}
                                                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
                                            >
                                                End Mudra
                                            </button>
                                        )}
                                        {showAnalysis && mudrasAttempted.length < TOTAL_MUDRAS && (
                                            <button
                                                onClick={nextMudra}
                                                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700"
                                            >
                                                Next Mudra
                                            </button>
                                        )}
                                        <button
                                            onClick={endAssessment}
                                            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700"
                                        >
                                            End Assessment
                                        </button>
                                    </div>
                                </div>

                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default MudraAssessment;
