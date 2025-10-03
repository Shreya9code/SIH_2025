import React, { useState } from "react";
import { Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AIChatWidgetButton = () => {
  const navigate = useNavigate();

  const goToAI = () => {
    navigate("/ai-assistant");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={goToAI}
        className="w-16 h-16 rounded-full bg-gradient-to-r from-[#D46B3E] via-[#8C3B26] to-[#D46B3E] shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform"
      >
        <Bot size={28} />
      </button>
    </div>
  );
};

export default AIChatWidgetButton;
