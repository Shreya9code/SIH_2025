import React, { useState, useRef, useEffect } from "react";
import { Camera, Upload, Play, Square, BookOpen, Lightbulb, AlertTriangle, ChevronDown, Library } from "lucide-react";
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
      const accuracy = topPrediction.probability * 100;

      const detailsResponse = await axios.get(
        "http://localhost:8000/mudra_info",
        {
          params: { mudra_name: predictedMudra },
        }
      );

      setDetectionResult({
        mudraName: predictedMudra,
        accuracy: `${accuracy.toFixed(2)}%`,
        rawAccuracy: accuracy,
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

  const navigateToLibrary = () => {
    // Navigate to digital library - you can replace this with your actual navigation logic
    window.location.href = "/library"; // or use your router navigation
  };

  return (
    <div className="min-h-screen bg-[#FFF9E6] pt-18">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-amber-900 mb-2">
            Mudra Detection
          </h1>
          <p className="text-amber-700/80 text-lg">
            AI-powered Bharatanatyam mudra recognition
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-amber-100 overflow-hidden mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-6">
            {/* Left Side - Input & Controls */}
            <div className="lg:col-span-2 p-6 border-r border-amber-100">
              {/* Dropdown Navigation */}
              <div className="relative mb-6">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium"
                >
                  <div className="flex items-center space-x-2">
                    {mode === "upload" ? <Upload size={18} /> : <Camera size={18} />}
                    <span className="text-base">{mode === "upload" ? "Upload Image" : "Camera Capture"}</span>
                  </div>
                  <ChevronDown size={18} className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
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

              {/* Preview Area */}
              <div className="mb-4 p-2 border border-amber-200 rounded-lg bg-amber-50">
                {previewUrl ? (
                  <div className="rounded-md overflow-hidden">
                    <img src={previewUrl} alt="Preview" className="w-full h-64 object-contain" />
                  </div>
                ) : mode === "upload" ? (
                  <label className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-amber-300 rounded-md cursor-pointer hover:border-amber-400 transition-colors bg-white">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-3 border border-amber-200">
                      <Upload className="w-6 h-6 text-amber-600" />
                    </div>
                    <span className="text-amber-800 font-medium text-sm mb-1">Choose Image</span>
                    <span className="text-amber-600/70 text-xs">JPG, PNG, or WebP</span>
                    <input type="file" className="hidden" onChange={handleFileSelect} accept="image/*" />
                  </label>
                ) : (
                  <div className="space-y-3">
                    <div className="rounded-md overflow-hidden bg-black">
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-48 object-cover" />
                    </div>
                    <div className="flex space-x-2">
                      {!isRecording ? (
                        <button
                          onClick={startCamera}
                          className="flex items-center justify-center space-x-2 flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all text-sm font-medium"
                        >
                          <Play size={16} className="fill-current" />
                          <span>Start Camera</span>
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={stopCamera}
                            className="flex items-center justify-center space-x-2 flex-1 px-4 py-3 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-lg hover:from-rose-600 hover:to-rose-700 transition-all text-sm font-medium"
                          >
                            <Square size={16} />
                            <span>Stop</span>
                          </button>
                          <button
                            onClick={captureImage}
                            className="flex items-center justify-center space-x-2 flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all text-sm font-medium"
                          >
                            <Camera size={16} />
                            <span>Capture</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {previewUrl && (
                <div className="flex space-x-3 mb-4">
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl("");
                      setDetectionResult(null);
                    }}
                    className="flex-1 px-4 py-3 bg-amber-100 text-amber-700 rounded-lg border border-amber-200 hover:bg-amber-200 transition-colors text-sm font-medium"
                  >
                    Change Image
                  </button>
                  <button
                    onClick={analyzeMudra}
                    disabled={isAnalyzing}
                    className={`flex-1 px-4 py-3 ${isAnalyzing
                      ? "bg-amber-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600"
                      } text-white rounded-lg font-semibold text-sm transition-all`}
                  >
                    {isAnalyzing ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Analyzing...</span>
                      </div>
                    ) : (
                      "Analyze Mudra"
                    )}
                  </button>
                </div>
              )}

              {/* Detection Result - Mudra Name & Accuracy */}
              {detectionResult && detectionResult.rawAccuracy >= 80 && (
                <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 mb-4">
              <h3 className="text-xl font-bold text-[#8B4513] mb-1">
                {detectionResult.mudraName}
              </h3>
              <div className="inline-flex items-center space-x-1 bg-white px-3 py-1 rounded-full border border-green-300">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-semibold text-green-700">
                  {detectionResult.accuracy} Accuracy
                </span>
              </div>
            </div>
              )}
            </div>

            {/* Right Side - Results & Information */}
            <div className="lg:col-span-4 p-6 bg-amber-50/30">
              {detectionResult ? (
                detectionResult.rawAccuracy >= 80 ? (
                  <div className="h-full space-y-4">
                    <DetailItem
                      title="Meaning & Symbolism"
                      content={detectionResult.meaning}
                      icon={<BookOpen className="w-5 h-5 text-amber-600" />}
                    />
                    <DetailItem
                      title="Inner Thought & Expression"
                      content={detectionResult.innerThought}
                      icon={<Lightbulb className="w-5 h-5 text-amber-500" />}
                    />
                    {detectionResult.commonMistakes && (
                      <div className="bg-rose-50 rounded-lg p-4 border border-rose-200">
                        <div className="flex items-center space-x-3 mb-3">
                          <AlertTriangle className="w-5 h-5 text-rose-500" />
                          <h4 className="font-semibold text-rose-800 text-xl">Common Mistakes to Avoid</h4>
                        </div>
                        <ul className="space-y-2">
                          {detectionResult.commonMistakes.map((mistake, index) => (
                            <li key={index} className="flex items-start space-x-3 text-rose-700 text-base">
                              <span className="w-2 h-2 bg-rose-400 rounded-full mt-1.5 flex-shrink-0"></span>
                              <span className="leading-relaxed">{mistake}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  // Low Accuracy Disclaimer
                  <div className="h-full space-y-6">
                    <div className="bg-rose-50 rounded-xl p-6 border border-rose-200 text-center">
                      <AlertTriangle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
                      <h3 className="font-bold text-rose-800 text-2xl mb-3">
                        Low Confidence Detection
                      </h3>
                      <p className="text-rose-700 text-lg mb-4">
                        We couldn't confidently identify the mudra from your image. 
                        This could be due to:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-white rounded-lg p-4 border border-rose-200">
                          <h4 className="font-semibold text-rose-800 mb-2">Image Quality Issues</h4>
                          <ul className="text-rose-700 text-sm space-y-1">
                            <li>• Poor lighting conditions</li>
                            <li>• Blurry or unclear image</li>
                            <li>• Complex background</li>
                          </ul>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-rose-200">
                          <h4 className="font-semibold text-rose-800 mb-2">Mudra Issues</h4>
                          <ul className="text-rose-700 text-sm space-y-1">
                            <li>• Incorrect hand posture</li>
                            <li>• Partial hand visible</li>
                            <li>• Non-Bharatanatyam gesture</li>
                          </ul>
                        </div>
                      </div>
                      
                      <button
                        onClick={navigateToLibrary}
                        className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all font-semibold text-lg mx-auto"
                      >
                        <Library size={20} />
                        <span>Explore Digital Library To Know About All Bharatnatyam Mudras</span>
                      </button>
                    </div>
                  </div>
                )
              ) : (
                <div className="h-full space-y-8">
                  {/* How to Use Section */}
                  <div className="bg-white rounded-xl p-5 border border-amber-200 shadow-sm">
                    <h3 className="font-semibold text-amber-900 text-2xl mb-6 flex items-center">
                      <BookOpen size={24} className="mr-3 text-amber-600" />
                      How to Use:
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {[
                        { step: "1", title: "Select Input Method", desc: "Choose between uploading an image or using camera" },
                        { step: "2", title: "Provide Image", desc: "Upload file or capture photo with camera" },
                        { step: "3", title: "Analyze Mudra", desc: "Click analyze to identify the hand gesture" },
                        { step: "4", title: "Learn & Explore", desc: "Discover meaning, symbolism, and techniques" }
                      ].map((item, index) => (
                        <div key={index} className="flex items-start space-x-4 p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
                          <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {item.step}
                          </div>
                          <div>
                            <h4 className="font-semibold text-amber-800 text-lg mb-1">{item.title}</h4>
                            <p className="text-amber-600/80 text-sm">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Protip line below steps with Lightbulb */}
                    <div className="mt-6 flex items-center space-x-3">
                      <Lightbulb size={20} className="text-amber-600" />
                      <p className="text-amber-900 font-semibold text-base">
                        <span className="font-bold">Protip:</span> Use good lighting, simple background, and proper mudra posture
                      </p>
                    </div>
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

const DetailItem = ({ title, content, icon }) => {
  return (
    <div className="bg-white rounded-xl p-5 border border-amber-200 shadow-sm">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center border border-amber-200 flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-800 text-xl mb-3">{title}</h4>
          <p className="text-gray-600 text-base leading-relaxed">{content}</p>
        </div>
      </div>
    </div>
  );
};

export default MudraDetection;