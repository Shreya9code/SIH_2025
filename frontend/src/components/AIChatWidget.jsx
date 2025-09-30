import React, { useState } from "react";
import { Bot, X } from "lucide-react";

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Floating circular button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleChat}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-[#D46B3E] via-[#8C3B26] to-[#D46B3E] shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform"
        >
          <Bot size={28} />
        </button>
      </div>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 md:w-96 bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-[#D46B3E] text-white flex items-center justify-between px-4 py-2">
            <span className="font-semibold">NrityaLens AI Assistant</span>
            <button onClick={toggleChat}>
              <X size={20} />
            </button>
          </div>

          {/* Chat body */}
          <div className="flex-1 p-4 overflow-y-auto text-sm text-gray-700">
            <p>Hi! Ask me anything about Bharatanatyam mudras, learning resources, or practice tips.</p>
          </div>

          {/* Input */}
          <div className="border-t border-gray-300 px-3 py-2 flex">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 outline-none text-sm"
            />
            <button className="ml-2 bg-[#D46B3E] text-white px-3 py-1 rounded-lg hover:bg-[#8C3B26] transition-colors">
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatWidget;
