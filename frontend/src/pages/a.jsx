import React, { useState, useRef, useEffect } from "react";
import { Camera, Upload, Play, Square, BookOpen, Lightbulb, AlertTriangle, ChevronDown } from "lucide-react";
import axios from "axios";
import IconImg from "../assets/icon.png";

const MudraDetection = () => {
  const [mode, setMode] = useState("upload");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setDetectionResult(null);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        },
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(console.error);
      setIsRecording(true);
      setSelectedFile(null);
      setPreviewUrl("");
      setDetectionResult(null);
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Unable to access camera. Please check permissions and make sure no other application is using the camera.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsRecording(false);
  };

  const captureImage = () => {
    if (videoRef.current && isRecording) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext("2d");
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          const file = new File([blob], "captured-image.jpg", {
            type: "image/jpeg",
          });
          setSelectedFile(file);
          setPreviewUrl(URL.createObjectURL(blob));
          setDetectionResult(null);
          stopCamera();
        },
        "image/jpeg",
        0.95
      );
    }
  };

  const analyzeMudra = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setDetectionResult(null);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const res = await axios.post("http://localhost:8000/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const topPrediction = res.data.predictions[0];
      const predictedMudra = topPrediction.class;

      const detailsResponse = await axios.get(
        "http://localhost:8000/mudra_info",
        {
          params: { mudra_name: predictedMudra },
        }
      );

      setDetectionResult({
        mudraName: predictedMudra,
        accuracy: `${(topPrediction.probability * 100).toFixed(2)}%`,
        meaning: detailsResponse.data.meaning,
        innerThought: detailsResponse.data.innerThought,
        commonMistakes: detailsResponse.data.commonMistakes,
      });
    } catch (err) {
      console.error("Error analyzing mudra:", err);
      alert("Error analyzing image. Make sure FastAPI server is running.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const flipMode = (newMode) => {
    if (mode === "camera" && newMode !== "camera") {
      stopCamera();
    }
    setMode(newMode);
    setShowDropdown(false);
    setSelectedFile(null);
    setPreviewUrl("");
    setDetectionResult(null);
  };

  return (
    <div className="min-h-screen bg-[#FFF9E6] pt-18">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-serif font-bold text-amber-900 mb-1">
            Mudra Detection
          </h1>
          <p className="text-amber-700/80 text-sm">
            AI-powered Bharatanatyam mudra recognition
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-amber-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-6">
            {/* Left Side */}
            <div className="lg:col-span-2 p-5 border-r border-amber-100">
              {/* Dropdown */}
              <div className="relative mb-4">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium"
                >
                  <div className="flex items-center space-x-2">
                    {mode === "upload" ? <Upload size={16} /> : <Camera size={16} />}
                    <span>{mode === "upload" ? "Upload Image" : "Camera Capture"}</span>
                  </div>
                  <ChevronDown size={16} className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-amber-200 rounded-lg shadow-lg z-10">
                    <button
                      onClick={() => flipMode("upload")}
                      className="w-full flex items-center space-x-2 px-4 py-3 text-left hover:bg-amber-50 transition-colors text-sm"
                    >
                      <Upload size={16} className="text-amber-600" />
                      <span>Upload Image</span>
                    </button>
                    <button
                      onClick={() => flipMode("camera")}
                      className="w-full flex items-center space-x-2 px-4 py-3 text-left hover:bg-amber-50 transition-colors text-sm border-t border-amber-100"
                    >
                      <Camera size={16} className="text-amber-600" />
                      <span>Camera Capture</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Preview */}
              <div className="mb-3 p-1 border border-amber-200 rounded-lg bg-amber-50">
                {previewUrl ? (
                  <div className="rounded-md overflow-hidden">
                    <img src={previewUrl} alt="Preview" className="w-full h-48 object-contain" />
                  </div>
                ) : mode === "upload" ? (
                  <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-amber-300 rounded-md cursor-pointer hover:border-amber-400 transition-colors bg-white">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mb-2 border border-amber-200">
                      <Upload className="w-5 h-5 text-amber-600" />
                    </div>
                    <span className="text-amber-800 font-medium text-xs mb-1">Choose Image</span>
                    <span className="text-amber-600/70 text-xs">JPG, PNG, or WebP</span>
                    <input type="file" className="hidden" onChange={handleFileSelect} accept="image/*" />
                  </label>
                ) : (
                  <div className="space-y-2">
                    <div className="rounded-md overflow-hidden bg-black">
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-48 object-cover" />
                    </div>
                    <div className="flex space-x-2">
                      {!isRecording ? (
                        <button
                          onClick={startCamera}
                          className="flex items-center justify-center space-x-1 flex-1 px-3 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all text-xs font-medium"
                        >
                          <Play size={14} className="fill-current" />
                          <span>Start Camera</span>
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={stopCamera}
                            className="flex items-center justify-center space-x-1 flex-1 px-3 py-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-lg hover:from-rose-600 hover:to-rose-700 transition-all text-xs font-medium"
                          >
                            <Square size={14} />
                            <span>Stop</span>
                          </button>
                          <button
                            onClick={captureImage}
                            className="flex items-center justify-center space-x-1 flex-1 px-3 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all text-xs font-medium"
                          >
                            <Camera size={14} />
                            <span>Capture</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Buttons */}
              {previewUrl && (
                <div className="flex space-x-2 mb-3">
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl("");
                      setDetectionResult(null);
                    }}
                    className="flex-1 px-3 py-2 bg-amber-100 text-amber-700 rounded-lg border border-amber-200 hover:bg-amber-200 transition-colors text-xs font-medium"
                  >
                    Change Image
                  </button>
                  <button
                    onClick={analyzeMudra}
                    disabled={isAnalyzing}
                    className={`flex-1 px-3 py-2 ${isAnalyzing
                      ? "bg-amber-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600"
                      } text-white rounded-lg font-semibold text-xs transition-all`}
                  >
                    {isAnalyzing ? (
                      <div className="flex items-center justify-center space-x-1">
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Analyzing...</span>
                      </div>
                    ) : (
                      "Analyze Mudra"
                    )}
                  </button>
                </div>
              )}

              {/* Mudra Name */}
              {detectionResult && (
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-3 text-white rounded-lg text-center">
                  <h2 className="font-semibold text-lg mb-1 capitalize">{detectionResult.mudraName}</h2>
                  <div className="flex items-center justify-center space-x-1 bg-white/20 px-2 py-1 rounded-full text-sm">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="font-medium">{detectionResult.accuracy} Accuracy</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side */}
            <div className="lg:col-span-4 p-6 bg-amber-50/30">
              {detectionResult ? (
                <div className="h-full space-y-4">
                  <DetailItem
                    title="Meaning & Symbolism"
                    content={detectionResult.meaning}
                    icon={<BookOpen className="w-5 h-5 text-amber-600" />}
                  />
                  {detectionResult.commonMistakes && (
                    <div className="bg-rose-50 rounded-lg p-4 border border-rose-200">
                      <div className="flex items-center space-x-3 mb-3">
                        <AlertTriangle className="w-5 h-5 text-rose-500" />
                        <h4 className="font-semibold text-rose-800 text-lg">Common Mistakes to Avoid</h4>
                      </div>
                      <ul className="space-y-2">
                        {detectionResult.commonMistakes.map((mistake, index) => (
                          <li key={index} className="flex items-start space-x-3 text-rose-700 text-sm">
                            <span className="w-2 h-2 bg-rose-400 rounded-full mt-1.5 flex-shrink-0"></span>
                            <span className="leading-relaxed">{mistake}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full space-y-6">
                  {/* How to Use */}
                  <div className="bg-white rounded-lg p-5 border border-amber-200">
                    <h3 className="font-semibold text-amber-900 text-lg mb-4 flex items-center">
                      <BookOpen size={18} className="mr-2 text-amber-600" />
                      How to Use
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start space-x-3 p-3 bg-amber-50 rounded-lg">
                        <div className="w-7 h-7 bg-amber-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">1</div>
                        <div>
                          <h4 className="font-medium text-amber-800">Select Input Method</h4>
                          <p className="text-amber-600/70 text-sm mt-1">Choose between uploading an image or using camera</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 p-3 bg-amber-50 rounded-lg">
                        <div className="w-7 h-7 bg-amber-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">2</div>
                        <div>
                          <h4 className="font-medium text-amber-800">Provide Image</h4>
                          <p className="text-amber-600/70 text-sm mt-1">Upload file or capture photo with camera</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 p-3 bg-amber-50 rounded-lg">
                        <div className="w-7 h-7 bg-amber-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">3</div>
                        <div>
                          <h4 className="font-medium text-amber-800">Analyze Mudra</h4>
                          <p className="text-amber-600/70 text-sm mt-1">Click analyze to identify the hand gesture</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 p-3 bg-amber-50 rounded-lg">
                        <div className="w-7 h-7 bg-amber-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">4</div>
                        <div>
                          <h4 className="font-medium text-amber-800">Learn & Explore</h4>
                          <p className="text-amber-600/70 text-sm mt-1">Discover meaning, symbolism, and techniques</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Single Pro Tips Box Below Both Panels */}
          {!detectionResult && (
            <div className="mt-6 mx-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 shadow-lg">
              <div className="px-6 py-4">
                <h3 className="font-bold text-lg mb-4 flex items-center text-amber-900">
                  <Lightbulb size={20} className="mr-3 text-amber-600" />
                  Pro Tips for Best Results
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="flex items-center space-x-3 bg-white rounded-lg border border-amber-200 p-3 hover:shadow-md transition-shadow">
                    <div className="w-7 h-7 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-xs">1</span>
                    </div>
                    <span className="text-amber-900 font-semibold text-sm">
                      Ensure good lighting
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 bg-white rounded-lg border border-amber-200 p-3 hover:shadow-md transition-shadow">
                    <div className="w-7 h-7 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-xs">2</span>
                    </div>
                    <span className="text-amber-900 font-semibold text-sm">
                      Keep hands centered
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 bg-white rounded-lg border border-amber-200 p-3 hover:shadow-md transition-shadow">
                    <div className="w-7 h-7 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-xs">3</span>
                    </div>
                    <span className="text-amber-900 font-semibold text-sm">
                      Use simple background
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 bg-white rounded-lg border border-amber-200 p-3 hover:shadow-md transition-shadow">
                    <div className="w-7 h-7 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-xs">4</span>
                    </div>
                    <span className="text-amber-900 font-semibold text-sm">
                      Maintain proper posture
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}






        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ title, content, icon }) => {
  return (
    <div className="bg-white rounded-lg p-4 border border-amber-200 shadow-sm">
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center border border-amber-200 flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-800 text-base mb-2">{title}</h4>
          <p className="text-gray-600 text-sm leading-relaxed">{content}</p>
        </div>
      </div>
    </div>
  );
};

export default MudraDetection;
