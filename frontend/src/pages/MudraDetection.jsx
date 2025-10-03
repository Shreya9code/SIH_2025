import React, { useState, useRef, useEffect } from "react";
import { Camera, Upload, Play, Square } from "lucide-react";
import axios from "axios";

const MudraDetection = () => {
  const [mode, setMode] = useState("upload"); // "upload" or "camera"
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Stop camera when component unmounts
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
        video: { width: 1280, height: 720 },
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      setIsRecording(true);
      setSelectedFile(null);
      setPreviewUrl("");
      setDetectionResult(null);
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Unable to access camera. Check permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext("2d");
      context.drawImage(videoRef.current, 0, 0);
      canvas.toBlob((blob) => {
        const file = new File([blob], "captured-image.jpg", { type: "image/jpeg" });
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(blob));
        setDetectionResult(null);
        stopCamera();
      }, "image/jpeg");
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

      const detailsResponse = await axios.get("http://localhost:8000/mudra_info", {
        params: { mudra_name: predictedMudra },
      });

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

  const flipMode = () => {
    // Stop camera if switching away
    if (mode === "camera") stopCamera();
    // Reset everything
    setSelectedFile(null);
    setPreviewUrl("");
    setDetectionResult(null);
    setMode(mode === "upload" ? "camera" : "upload");
  };

  const instructionText = `Instructions:
1. Upload an image or use camera to capture a mudra.
2. Click "Analyze Mudra" to get AI-based identification.
3. Ensure clear visibility of your hand gesture for best accuracy.`;

  return (
    <div className="min-h-screen bg-[#FFF9E6] pt-16">
      <div className="max-w-6xl mx-auto px-2 py-4 flex gap-6">
        {/* Left Box: Upload / Camera */}
        <div className="flex-1 bg-white rounded-xl shadow-md border border-[#FFD34E]/30 p-4 relative">
          <button
            onClick={flipMode}
            className="absolute top-4 right-4 z-20 pointer-events-auto flex items-center space-x-1 px-3 py-1 bg-[#D94F3D] text-white rounded-lg hover:bg-[#8B0000] transition"
          >
            {mode === "upload" ? <Camera size={16} /> : <Upload size={16} />}
            <span>{mode === "upload" ? "Use Camera" : "Upload Image"}</span>
          </button>

          {/* Preview */}
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-80 object-contain rounded-lg border border-[#FFD34E]/50"
            />
          ) : mode === "upload" ? (
            <label className="flex flex-col items-center justify-center h-80 border-2 border-dashed border-[#FFD34E] rounded-lg cursor-pointer hover:border-[#D94F3D] transition-colors bg-[#FFF9E6]">
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
          ) : (
            <div className="flex flex-col items-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-80 rounded-lg object-cover"
              />
              <div className="flex space-x-2 mt-3 w-full">
                {!isRecording ? (
                  <button
                    onClick={startCamera}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-[#D94F3D] to-[#8B0000] text-white rounded-lg"
                  >
                    <Play size={16} /> Start
                  </button>
                ) : (
                  <>
                    <button
                      onClick={captureImage}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-[#FFD34E] to-[#D94F3D] text-[#8B4513] rounded-lg"
                    >
                      Capture
                    </button>
                    <button
                      onClick={stopCamera}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-[#8B0000] to-[#660000] text-white rounded-lg"
                    >
                      <Square size={14} /> Stop
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Analyze Button */}
          {previewUrl && (
            <button
              onClick={analyzeMudra}
              disabled={isAnalyzing}
              className={`w-full mt-3 px-4 py-3 ${
                isAnalyzing
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#D94F3D] to-[#8B0000] hover:from-[#B33C2D] hover:to-[#660000]"
              } text-white rounded-lg font-semibold text-base transition-all duration-300 shadow-md`}
            >
              {isAnalyzing ? "Analyzing Mudra..." : "Analyze Mudra"}
            </button>
          )}

          {/* Instructions below left box after analysis */}
          {detectionResult && (
            <div className="mt-4 p-3 bg-[#FFF9E6] rounded-lg border border-[#FFD34E]/50">
              <p className="text-[#8C3B26] text-sm whitespace-pre-line">{instructionText}</p>
            </div>
          )}
        </div>

        {/* Right Box: Shows instructions if no result */}
        <div className="flex-1 bg-white rounded-xl shadow-md border border-[#FFD34E]/30 p-4">
          {!detectionResult && (
            <div className="p-3 bg-[#FFF9E6] rounded-lg border border-[#FFD34E]/50">
              <p className="text-[#8C3B26] text-sm whitespace-pre-line">{instructionText}</p>
            </div>
          )}

          {/* Analysis Results */}
          {detectionResult && (
            <div>
              <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 mb-4">
                <h3 className="text-xl font-bold text-[#8B4513] mb-1">{detectionResult.mudraName}</h3>
                <div className="inline-flex items-center space-x-1 bg-white px-3 py-1 rounded-full border border-green-300">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold text-green-700">{detectionResult.accuracy} Accuracy</span>
                </div>
              </div>

              <DetailItem title="Meaning" content={detectionResult.meaning} icon="📖" />
              <DetailItem title="Inner Thought" content={detectionResult.innerThought} icon="💭" />

              {detectionResult.commonMistakes && (
                <div className="bg-amber-50 rounded-lg p-2 border border-amber-200 mt-2">
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
          )}
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ title, content, icon }) => (
  <div className="bg-[#FFF9E6] rounded-lg p-2 border border-[#FFD34E]/50 mb-2">
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
