import React, { useState } from "react";
import AIChatBox from "./AIChatBox"; // Your existing chat UI
import { MessageCircle, X } from "lucide-react";

export default function FloatingAIWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="relative">
          {/* Chat box */}
          <div className="w-[360px] h-[600px] shadow-2xl rounded-xl overflow-hidden">
            <AIChatBox />
          </div>

          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 bg-slate-800 text-white rounded-full p-1 hover:bg-red-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        // Floating Circle Button
        <button
          onClick={() => setIsOpen(true)}
          className="bg-purple hover:bg-purple-600 text-white rounded-full p-4 shadow-lg flex items-center justify-center"
          aria-label="Open AI Assistant"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
