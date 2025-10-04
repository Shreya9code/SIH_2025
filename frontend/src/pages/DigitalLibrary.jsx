import React, { useState, useMemo } from "react";
import mudrasData from "../data/mudra.json";
import { Search, Play, BookOpen, Download, Share2 } from "lucide-react";

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
          className="h-full w-auto object-contain"
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

  return (
    <div className="min-h-screen bg-[#FFF9E6] pt-10">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-[#8B4513] mb-4">
            Digital Library
          </h1>
          <p className="text-xl text-[#8C3B26] max-w-3xl mx-auto">
            Explore a collection of Bharatanatyam mudras—type, history, and
            more.
          </p>
        </div>

        {/* Search + Filters - FORCE LIGHT THEME STYLING */}
        <div className="bg-white rounded-2xl shadow-lg border border-[#FFD34E]/30 p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4 items-center">
            {/* Search */}
            <div className="md:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8C3B26]" />
                <input
                  type="text"
                  placeholder="Search mudras..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="digital-library-input w-full pl-10 pr-4 py-3 border border-[#FFD34E] rounded-xl bg-[#FFF9E6] text-[#8B4513] placeholder-[#8C3B26]/60 focus:outline-none focus:ring-2 focus:ring-[#D94F3D] focus:bg-[#FFF9E6] focus:text-[#8B4513] text-center"
                  style={{
                    backgroundColor: "#FFF9E6",
                    color: "#8B4513",
                    borderColor: "#FFD34E",
                  }}
                />
              </div>
            </div>

            {/* Category Dropdown */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="digital-library-select w-full px-4 py-3 border border-[#FFD34E] rounded-xl bg-[#FFF9E6] text-[#8B4513] focus:outline-none focus:ring-2 focus:ring-[#D94F3D] focus:bg-[#FFF9E6] focus:text-[#8B4513]"
                style={{
                  backgroundColor: "#FFF9E6",
                  color: "#8B4513",
                  borderColor: "#FFD34E",
                }}
              >
                {categories.map((cat) => (
                  <option
                    key={cat}
                    value={cat}
                    style={{ backgroundColor: "#FFF9E6", color: "#8B4513" }}
                  >
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
                className="digital-library-select w-full px-4 py-3 border border-[#FFD34E] rounded-xl bg-[#FFF9E6] text-[#8B4513] focus:outline-none focus:ring-2 focus:ring-[#D94F3D] focus:bg-[#FFF9E6] focus:text-[#8B4513]"
                style={{
                  backgroundColor: "#FFF9E6",
                  color: "#8B4513",
                  borderColor: "#FFD34E",
                }}
              >
                {bhavas.map((bhava) => (
                  <option
                    key={bhava}
                    value={bhava}
                    style={{ backgroundColor: "#FFF9E6", color: "#8B4513" }}
                  >
                    {bhava === "all" ? "All Bhavas" : bhava}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {Object.keys(groupedMudras).map((type) => (
          <div key={type} className="mb-12">
            <h2 className="text-2xl font-bold text-[#8B4513] mb-6">{type}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupedMudras[type].map((mudra) => (
                <div
                  key={mudra.sl_no}
                  className="bg-white rounded-2xl shadow-lg border border-[#FFD34E]/30 overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  {/* Image */}
                  {/* <div className="h-48 bg-amber-100 flex items-center justify-center"> */}
                  <div className="h-48 bg-white flex items-center justify-center">
                    {renderMudraImage(mudra)}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-[#8B4513]">
                          {mudra.name_sanskrit}
                        </h3>
                        <p className="text-[#D94F3D] font-medium">
                          {mudra.name_english}
                        </p>
                      </div>
                    </div>
                    <p className="text-[#8C3B26] mb-2 line-clamp-3">
                      {mudra.about}
                    </p>

                    <div className="mb-1">
                      {mudra.keywords.split(",").map((b, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-[#FFF9E6] text-[#8C3B26] text-xs rounded border border-[#FFD34E] mr-1"
                        >
                          {b.trim()}
                        </span>
                      ))}
                    </div>

                    <div className="flex space-x-2 mt-2">
                      <button
                        onClick={() => setSelectedMudra(mudra)}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#D94F3D] to-[#8B0000] text-white rounded-lg font-semibold"
                      >
                        <BookOpen size={16} />
                        <span>Details</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedMudra(mudra);
                          setShowVideo(true);
                        }}
                        className="p-2 bg-[#FFD34E] text-[#8B4513] rounded-lg"
                      >
                        <Play size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Mudra detail modal */}
        {selectedMudra && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-[#8B4513]">
                      {selectedMudra.name_sanskrit}
                    </h2>
                    <p className="text-xl text-[#D94F3D]">
                      {selectedMudra.name_english}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedMudra(null);
                      setShowVideo(false);
                    }}
                    className="p-2 text-[#8C3B26] hover:text-[#D94F3D]"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-[#FFF9E6] rounded-xl p-6 border border-[#FFD34E]">
                      <h3 className="text-lg font-semibold text-[#8B4513] mb-3">
                        About
                      </h3>
                      <p className="text-[#8C3B26]">{selectedMudra.about}</p>
                    </div>
                    <div className="bg-[#FFF9E6] rounded-xl p-6 border border-[#FFD34E]">
                      <h3 className="text-lg font-semibold text-[#8B4513] mb-3">
                        Keywords
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedMudra.keywords.split(",").map((b, i) => (
                          <span
                            key={i}
                            className="px-3 py-2 bg-[#FFD34E] text-[#8B4513] rounded-lg font-medium"
                          >
                            {b.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-[#FFF9E6] rounded-xl p-6 border border-[#FFD34E] flex items-center justify-center">
                      {renderMudraImage(selectedMudra)}
                    </div>
                    <div className="bg-[#FFF9E6] rounded-xl p-6 border border-[#FFD34E] space-y-2">
                      <div>
                        <span className="font-medium text-[#8C3B26]">
                          Type:
                        </span>{" "}
                        {selectedMudra.type}
                      </div>
                      <div>
                        <span className="font-medium text-[#8C3B26]">
                          Slokas:
                        </span>{" "}
                        {selectedMudra.slokas || "N/A"}
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setShowVideo(true)}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-[#D94F3D] to-[#8B0000] text-white rounded-xl font-semibold"
                      >
                        <Play size={18} />
                        <span>Watch Video</span>
                      </button>
                      <a
                        href={`../data/images/${selectedMudra.images}`}
                        download
                        className="p-3 bg-[#FFD34E] text-[#8B4513] rounded-xl"
                      >
                        <Download size={18} />
                      </a>
                      <button
                        className="p-3 bg-[#FFD34E] text-[#8B4513] rounded-xl flex items-center gap-2"
                        onClick={async () => {
                          try {
                            if (navigator.canShare && navigator.canShare({ files: [] })) {
                              // Mobile: share the image file
                              const response = await fetch(selectedMudra.images);
                              const blob = await response.blob();
                              const file = new File(
                                [blob],
                                selectedMudra.name_english.replace(/\s+/g, "_") + ".jpg",
                                { type: blob.type }
                              );
                              await navigator.share({
                                title: selectedMudra.name_sanskrit,
                                text: "Check out this mudra!",
                                files: [file],
                              });
                            } else if (navigator.clipboard && navigator.clipboard.write) {
                              // Desktop: convert to PNG & copy
                              const response = await fetch(selectedMudra.images);
                              const blob = await response.blob();
                              const img = await createImageBitmap(blob);
                              const canvas = document.createElement("canvas");
                              canvas.width = img.width;
                              canvas.height = img.height;
                              const ctx = canvas.getContext("2d");
                              ctx.drawImage(img, 0, 0);
                              const pngBlob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
                              await navigator.clipboard.write([new ClipboardItem({ "image/png": pngBlob })]);
                              alert("Image copied to clipboard as PNG!");
                              window.open(selectedMudra.images, "_blank");
                            } else {
                              // Fallback: download
                              const link = document.createElement("a");
                              link.href = selectedMudra.images;
                              link.download = selectedMudra.name_english.replace(/\s+/g, "_") + ".jpg";
                              link.click();
                              alert("Image downloaded! You can now share it manually.");
                            }
                          } catch (err) {
                            console.log("Share failed:", err);
                            alert("Sharing is not supported on this device.");
                          }
                        }}
                      >
                        <Share2 size={18} /> Share
                      </button>
                    </div>
                    {showVideo && (
                      <div className="mt-4">
                        <video
                          controls
                          className="w-full rounded-xl"
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
