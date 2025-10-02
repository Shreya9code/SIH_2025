import React, { useState, useRef } from 'react';
import { Camera, Upload, Play, Square } from 'lucide-react';
import axios from "axios";

const MudraDetection = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

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
        video: { width: 1280, height: 720 } 
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(videoRef.current, 0, 0);
      
      canvas.toBlob((blob) => {
        const file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(blob));
        setDetectionResult(null);
        stopCamera();
      }, 'image/jpeg');
    }
  };

  const analyzeMudra = async () => {
    if (!selectedFile) return;
    
    setIsAnalyzing(true);
    setDetectionResult(null);
    // Simulate API call with delay
    /*setTimeout(() => {
      setDetectionResult({
        mudraName: "Pataka",
        accuracy: "92%",
        meaning: "Flag - represents the beginning of dance, clouds, forest, night, river, etc.",
        innerThought: "Symbolizes the opening of a new beginning, creation, and the start of something meaningful",
        commonMistakes: ["Thumb not aligned properly", "Fingers too stiff", "Palm not facing forward"]
      });
      setIsAnalyzing(false);
    }, 2000);*/
    try {
    const formData = new FormData();
    formData.append("file", selectedFile);

    const res = await axios.post("http://localhost:8000/predict", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    // API returns something like: { predictions: [{class, probability}, ...] }
    const top = res.data.predictions[0];

    setDetectionResult({
      mudraName: top.class,
      accuracy: `${(top.probability * 100).toFixed(2)}%`,
      meaning: "Meaning will come from your DB/extra mapping here",
      innerThought: "Inner thought can be added from a predefined dictionary",
      commonMistakes: ["To be filled with real data or static list"],
    });
  } catch (err) {
    console.error("Error analyzing mudra:", err);
    alert("Error analyzing image. Please try again.");
  }finally {
    setIsAnalyzing(false);
  }
  };

  return (
    <div className="min-h-screen bg-[#FFF9E6] pt-16">
      <div className="max-w-6xl mx-auto px-2 py-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[#8B4513] mb-2">Mudra Detection</h1>
          <p className="text-lg text-[#8C3B26] max-w-2xl mx-auto">
            Upload an image or use your camera to identify Bharatanatyam mudras with AI precision
          </p>
        </div>

        {/* Main Input Row */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          
          {/* Left Side: Upload + Image Preview */}
          <div className="flex-1 space-y-4">
            {/* Upload Box */}
            <div className="bg-white rounded-xl shadow-md border border-[#FFD34E]/30 p-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-[#FFD34E]/20 rounded-lg flex items-center justify-center">
                  <Upload className="w-5 h-5 text-[#D94F3D]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#8B4513]">Upload Image</h2>
                  <p className="text-[#8C3B26] text-sm">JPG, PNG, or WebP</p>
                </div>
              </div>

              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#FFD34E] rounded-lg cursor-pointer hover:border-[#D94F3D] transition-colors bg-[#FFF9E6]">
                <Upload className="w-8 h-8 text-[#D94F3D] mb-2" />
                <span className="text-[#8C3B26] font-medium">Click to upload</span>
                <span className="text-[#8C3B26]/70 text-xs mt-1">or drag and drop</span>
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={handleFileSelect} 
                  accept="image/*" 
                />
              </label>

              {/* Preview Image */}
              {previewUrl && (
                <div className="mt-4 bg-[#FFF9E6] rounded-lg border border-[#FFD34E]/50 p-2">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full h-64 object-contain rounded-lg" 
                  />
                </div>
              )}

              {previewUrl && (
                <button
                  onClick={analyzeMudra}
                  disabled={isAnalyzing}
                  className="w-full mt-3 px-4 py-3 bg-gradient-to-r from-[#D94F3D] to-[#8B0000] text-white rounded-lg font-semibold text-base hover:from-[#B33C2D] hover:to-[#660000] disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  {isAnalyzing ? 'Analyzing Mudra...' : 'Analyze Mudra'}
                </button>
              )}
            </div>
          </div>

          {/* Right Side: Camera */}
          <div className="flex-1 bg-white rounded-xl shadow-md border border-[#FFD34E]/30 p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-[#FFD34E]/20 rounded-lg flex items-center justify-center">
                <Camera className="w-5 h-5 text-[#D94F3D]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#8B4513]">Use Camera</h2>
                <p className="text-[#8C3B26] text-sm">Real-time capture</p>
              </div>
            </div>

            <div className="bg-[#FFF9E6] rounded-lg border border-[#FFD34E]/50 p-2">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-80 rounded-lg object-cover"
              />
            </div>

            <div className="flex space-x-2 mt-3">
              {!isRecording ? (
                <button
                  onClick={startCamera}
                  className="flex items-center justify-center space-x-1 flex-1 px-4 py-2 bg-gradient-to-r from-[#D94F3D] to-[#8B0000] text-white rounded-lg font-medium hover:from-[#B33C2D] hover:to-[#660000] transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <Play size={16} />
                  <span>Start</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={captureImage}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-[#FFD34E] to-[#D94F3D] text-[#8B4513] rounded-lg font-medium hover:from-[#FFC107] hover:to-[#B33C2D] transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    Capture
                  </button>
                  <button
                    onClick={stopCamera}
                    className="flex items-center justify-center space-x-1 flex-1 px-4 py-2 bg-gradient-to-r from-[#8B0000] to-[#660000] text-white rounded-lg font-medium hover:from-[#660000] hover:to-[#400000] transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <Square size={14} />
                    <span>Stop</span>
                  </button>
                </>
              )}
            </div>
          </div>

        </div>

        {/* Results */}
        {detectionResult && (
          <div className="bg-white rounded-xl shadow-md border border-[#FFD34E]/30 p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">🎭</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#8B4513]">Analysis Results</h2>
                <p className="text-[#8C3B26] text-sm">AI-powered identification</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <h3 className="text-xl font-bold text-[#8B4513] mb-1">{detectionResult.mudraName}</h3>
                <div className="inline-flex items-center space-x-1 bg-white px-3 py-1 rounded-full border border-green-300">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold text-green-700">
                    {detectionResult.accuracy} Accuracy
                  </span>
                </div>
              </div>

              <DetailItem title="Meaning" content={detectionResult.meaning} icon="📖" />
              <DetailItem title="Inner Thought" content={detectionResult.innerThought} icon="💭" />

              {detectionResult.commonMistakes && (
                <div className="bg-amber-50 rounded-lg p-2 border border-amber-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">⚠️</span>
                    <h4 className="font-semibold text-amber-800">Common Mistakes</h4>
                  </div>
                  <ul className="space-y-1">
                    {detectionResult.commonMistakes.map((mistake, index) => (
                      <li key={index} className="flex items-start space-x-2 text-amber-700">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1 flex-shrink-0"></span>
                        <span>{mistake}</span>
                      </li>
                    ))}
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

// Helper component
const DetailItem = ({ title, content, icon }) => (
  <div className="bg-[#FFF9E6] rounded-lg p-2 border border-[#FFD34E]/50">
    <div className="flex items-start space-x-2">
      <span className="text-lg">{icon}</span>
      <div className="flex-1">
        <h4 className="font-semibold text-[#8B4513] mb-1">{title}</h4>
        <p className="text-[#8C3B26] text-sm leading-relaxed">{content}</p>
      </div>
    </div>
  </div>
);

export default MudraDetection;
