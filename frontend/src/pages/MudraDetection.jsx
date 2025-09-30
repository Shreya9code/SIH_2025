import React, { useState, useRef } from 'react';
import { Camera, Upload, Play, Square } from 'lucide-react';

const MudraDetection = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);
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
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
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
      }, 'image/jpeg');
    }
  };

  const analyzeMudra = async () => {
    // Simulate API call
    setDetectionResult({
      mudraName: "Pataka",
      accuracy: "92%",
      meaning: "Flag - represents the beginning of dance, clouds, forest, night, river, etc.",
      innerThought: "Symbolizes the opening of a new beginning",
      commonMistakes: ["Thumb not aligned properly", "Fingers too stiff"]
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Mudra Detection</h1>
      <p className="text-gray-600 mb-8">Upload an image or use your camera to identify Bharatanatyam mudras</p>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Input Methods */}
        <div className="space-y-6">
          {/* File Upload */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Upload Image</h2>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-400 transition-colors">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-gray-600">Click to upload or drag and drop</span>
              <input type="file" className="hidden" onChange={handleFileSelect} accept="image/*" />
            </label>
          </div>

          {/* Camera Feed */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Use Camera</h2>
            <div className="space-y-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-48 bg-gray-200 rounded-lg"
              />
              <div className="flex space-x-2">
                {!isRecording ? (
                  <button
                    onClick={startCamera}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Play size={16} />
                    <span>Start Camera</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={captureImage}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Capture Image
                    </button>
                    <button
                      onClick={stopCamera}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <Square size={16} />
                      <span>Stop Camera</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Preview and Results */}
        <div className="space-y-6">
          {/* Preview */}
          {previewUrl && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Preview</h2>
              <img src={previewUrl} alt="Preview" className="w-full h-64 object-contain rounded-lg bg-gray-100" />
              <button
                onClick={analyzeMudra}
                className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                Analyze Mudra
              </button>
            </div>
          )}

          {/* Results */}
          {detectionResult && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Mudra Name:</span>
                  <span className="text-xl font-bold text-purple-600">{detectionResult.mudraName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Shape Accuracy:</span>
                  <span className="text-lg font-semibold text-green-600">{detectionResult.accuracy}</span>
                </div>
                <div>
                  <span className="text-gray-600 block mb-1">Meaning:</span>
                  <p className="text-gray-800">{detectionResult.meaning}</p>
                </div>
                <div>
                  <span className="text-gray-600 block mb-1">Inner Thought:</span>
                  <p className="text-gray-800 italic">{detectionResult.innerThought}</p>
                </div>
                {detectionResult.commonMistakes && (
                  <div>
                    <span className="text-gray-600 block mb-1">Common Mistakes:</span>
                    <ul className="list-disc list-inside text-gray-800">
                      {detectionResult.commonMistakes.map((mistake, index) => (
                        <li key={index}>{mistake}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MudraDetection;