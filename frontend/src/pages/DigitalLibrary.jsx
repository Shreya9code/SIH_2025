import React, { useState, useMemo } from "react";
import mudrasData from "../data/mudra.json";
import { Search, Play, Download, Sparkles } from "lucide-react";
// Emoji fallback for images
const emojiMap = {
  Flag: "👐",
};

const DigitalLibrary = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBhava, setSelectedBhava] = useState("all");
  const [selectedMudra, setSelectedMudra] = useState(null);
  const [showVideo, setShowVideo] = useState(false);

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(mudrasData.mudras.map((m) => m.type)))],
    []
  );

  const bhavas = useMemo(
    () => [
      "all",
      ...Array.from(
        new Set(
          mudrasData.mudras
            .flatMap((m) => (m.keywords || "").split(",").map((b) => b.trim()))
            .filter(Boolean)
        )
      ),
    ],
    []
  );

  const filteredMudras = useMemo(
    () =>
      mudrasData.mudras.filter((mudra) => {
        const matchesSearch =
          mudra.name_english.toLowerCase().includes(searchTerm.toLowerCase()) ||
          mudra.name_sanskrit
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          mudra.about.toLowerCase().includes(searchTerm.toLowerCase()) ||
          mudra.keywords.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory =
          selectedCategory === "all" || mudra.type === selectedCategory;

        const bhavaList = (mudra.keywords || "")
          .split(",")
          .map((b) => b.trim());
        const matchesBhava =
          selectedBhava === "all" || bhavaList.includes(selectedBhava);

        return matchesSearch && matchesCategory && matchesBhava;
      }),
    [searchTerm, selectedCategory, selectedBhava]
  );

  const renderMudraImage = (mudra) => {
    if (mudra.images) {
      return (
        <img
          src={mudra.images}
          alt={mudra.name_sanskrit}
          className="h-full w-full object-contain transform hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.display = "none";
          }}
        />
      );
    }
    return (
      <div className="text-6xl text-white">
        {emojiMap[mudra.name_sanskrit] || "🤲"}
      </div>
    );
  };

  const getVideoSource = (mudra) => {
    if (mudra.videos) {
      return `../data/videos/${mudra.videos}`;
    }
    return mudra.type === "Single Handed"
      ? "https://youtu.be/d1WT-TsEv9E?si=QPNGGOnTv1wT6kXO"
      : "https://youtu.be/RPrubwxITHE?si=FQa51AoVMfuO228k";
  };

  // Group mudras by type
  const groupedMudras = useMemo(() => {
    const groups = {};
    filteredMudras.forEach((mudra) => {
      if (!groups[mudra.type]) groups[mudra.type] = [];
      groups[mudra.type].push(mudra);
    });
    return groups;
  }, [filteredMudras]);

  // Close modal when clicking outside
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setSelectedMudra(null);
      setShowVideo(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 pt-20 px-4 pb-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Banner - Group Learning Style */}
        <div className="text-center mb-8">
          <div className="rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 p-8 shadow-2xl border border-amber-300 mb-6">
            <Sparkles size={48} className="mx-auto mb-4 text-yellow-300" />
            <h1 className="text-4xl font-bold !text-white mb-3">
              Digital Library
            </h1>
            <p className="!text-amber-100 text-lg">
              Explore a collection of Bharatanatyam mudras—type, history, and more.
            </p>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="bg-white rounded-2xl shadow-xl border border-amber-200 p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4 items-center">
            {/* Search */}
            <div className="md:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 !text-amber-600" />
                <input
                  type="text"
                  placeholder="Search mudras..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 !border !border-amber-300 !rounded-xl !bg-amber-50 !text-amber-900 !placeholder-amber-600/60 focus:!outline-none focus:!ring-2 focus:!ring-amber-500 focus:!border-transparent text-center"
                />
              </div>
            </div>

            {/* Category Dropdown */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 !border !border-amber-300 !rounded-xl !bg-amber-50 !text-amber-900 focus:!outline-none focus:!ring-2 focus:!ring-amber-500 focus:!border-transparent"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="!bg-amber-50 !text-amber-900">
                    {cat === "all" ? "All Types" : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Bhava Dropdown */}
            <div>
              <select
                value={selectedBhava}
                onChange={(e) => setSelectedBhava(e.target.value)}
                className="w-full px-4 py-3 !border !border-amber-300 !rounded-xl !bg-amber-50 !text-amber-900 focus:!outline-none focus:!ring-2 focus:!ring-amber-500 focus:!border-transparent"
              >
                {bhavas.map((bhava) => (
                  <option key={bhava} value={bhava} className="!bg-amber-50 !text-amber-900">
                    {bhava === "all" ? "All Bhavas" : bhava}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results - 4 images per row - Click anywhere to open details */}
        {Object.keys(groupedMudras).map((type) => (
          <div key={type} className="mb-12">
            <h2 className="text-2xl font-bold !text-amber-900 mb-6 border-b border-amber-200 pb-2">{type}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {groupedMudras[type].map((mudra) => (
                <div
                  key={mudra.sl_no}
                  onClick={() => setSelectedMudra(mudra)}
                  className="bg-white rounded-2xl shadow-xl border border-amber-200 overflow-hidden hover:shadow-2xl hover:border-amber-300 transition-all duration-300 group cursor-pointer"
                >
                  {/* Bigger Image */}
                  <div className="h-64 bg-white flex items-center justify-center p-6">                    {renderMudraImage(mudra)}
                  </div>

                  {/* Content - Only Sanskrit Name */}
                  <div className="p-4 border-t border-amber-100">
                    <h3 className="text-lg font-bold !text-amber-900 text-center line-clamp-2 group-hover:text-amber-700 transition-colors">
                      {mudra.name_sanskrit}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Mudra detail modal - Click outside to close */}
{selectedMudra && (
  <div
    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    onClick={handleBackdropClick}
  >
    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-amber-200">
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold !text-amber-900">
              {selectedMudra.name_sanskrit}
            </h2>
            <p className="text-xl !text-amber-600">
              {selectedMudra.name_english}
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedMudra(null);
              setShowVideo(false);
            }}
            className="p-2 !text-amber-600 hover:!text-amber-800 hover:!bg-amber-100 !rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
              <h3 className="text-lg font-semibold !text-amber-900 mb-3">
                About
              </h3>
              <p className="!text-amber-700">{selectedMudra.about}</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
              <h3 className="text-lg font-semibold !text-amber-900 mb-3">
                Keywords
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedMudra.keywords.split(",").map((b, i) => (
                  <span
                    key={i}
                    className="px-3 py-2 !bg-gradient-to-r !from-amber-400 !to-orange-500 !text-white !rounded-lg font-medium"
                  >
                    {b.trim()}
                  </span>
                ))}
              </div>
            </div>
            {/* MOVED TYPE AND SLOKAS TO LEFT SIDE */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200 space-y-2">
              <div>
                <span className="font-medium !text-amber-700">Type:</span>{" "}
                {selectedMudra.type}
              </div>
              <div>
                <span className="font-medium !text-amber-700">Slokas:</span>{" "}
                {selectedMudra.slokas || "N/A"}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-amber-300 flex items-center justify-center">
              {renderMudraImage(selectedMudra)}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  const videoUrl = selectedMudra.type === "Single Handed"
                    ? "https://youtu.be/d1WT-TsEv9E?si=QPNGGOnTv1wT6kXO"
                    : "https://youtu.be/RPrubwxITHE?si=FQa51AoVMfuO228k";
                  window.open(videoUrl, "_blank");
                }}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 !bg-gradient-to-r !from-amber-500 !to-orange-500 !text-white !rounded-xl font-semibold hover:!from-amber-600 hover:!to-orange-600 transition-all shadow-lg hover:shadow-xl"
              >
                <Play size={18} />
                <span>Watch Video</span>
              </button>
              <button
                onClick={() => {
                  if (selectedMudra.images) {
                    const link = document.createElement('a');
                    link.href = selectedMudra.images;
                    link.download = `${selectedMudra.name_english.replace(/\s+/g, '_')}.jpg`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  } else {
                    alert('No image available for download');
                  }
                }}
                className="p-3 !bg-gradient-to-r !from-green-400 !to-emerald-500 !text-white !rounded-xl hover:!from-green-500 hover:!to-emerald-600 transition-all shadow-lg hover:shadow-xl"
              >
                <Download size={18} />
              </button>
            </div>
            {showVideo && (
              <div className="mt-4">
                <video
                  controls
                  className="w-full !rounded-xl !border !border-amber-300 shadow-lg"
                  src={getVideoSource(selectedMudra)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
)}
      </div>
    </div>
  );
};

export default DigitalLibrary;