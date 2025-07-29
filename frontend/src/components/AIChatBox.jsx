import React, { useState, useEffect, useRef } from "react";
import { Send, Sparkles, X, Loader2 } from "lucide-react";
import axios from "../api/axiosInstance";

export default function AIChatBox() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const messagesEndRef = useRef(null);

  const simulateResponse = async (userMessage) => {
  setIsTyping(true);

  try {
    const res = await axios.post("/api/chat", {
      user_id: "user123", // You can replace this with dynamic user ID
      message: userMessage,
      current_topic: "general" // You can also make this dynamic
    });
    console.log(res.data);
    

    const aiMessage = res.data.response;

    setMessages((prev) => [...prev, { text: aiMessage, isUser: false }]);
  } catch (error) {
    console.error("Error fetching AI response:", error);
    setMessages((prev) => [
      ...prev,
      { text: "Oops! Failed to get response from AI.", isUser: false }
    ]);
  } finally {
    setIsTyping(false);
  }
};

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const msg = input.trim();
    setMessages((prev) => [...prev, { text: msg, isUser: true }]);
    setInput("");
    simulateResponse(msg);
  };

  const clearMessages = () => setMessages([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="max-w-xl mx-auto h-[600px] bg-gradient-to-br from-slate-900 to-indigo-950 rounded-xl overflow-hidden shadow-2xl border border-indigo-500/20">
      {/* Header */}
      <div className="bg-indigo-600/30 backdrop-blur-sm p-4 border-b border-indigo-500/30 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Sparkles className="text-indigo-300 h-5 w-5" />
          <h2 className="text-white font-medium">AI Assistant</h2>
        </div>
        <button onClick={clearMessages} className="text-indigo-200 hover:text-white transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="p-4 h-[calc(100%-132px)] overflow-y-auto bg-slate-900/50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Sparkles className="h-12 w-12 text-indigo-400 mb-4" />
            <h3 className="text-indigo-200 text-xl mb-2">How can I help you today?</h3>
            <p className="text-slate-400 text-sm max-w-xs">
              Ask me anything and I'll do my best to assist you!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    msg.isUser
                      ? "bg-indigo-600 text-white rounded-tr-none"
                      : "bg-slate-700/60 text-slate-100 rounded-tl-none border border-slate-600/50"
                  } animate-fade-in`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[80%] p-3 rounded-2xl bg-slate-700/60 text-slate-100 rounded-tl-none border border-slate-600/50">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse delay-75"></div>
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse delay-150"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className={`p-4 border-t ${
          isFocused ? "border-indigo-500/70 bg-slate-800/80" : "border-slate-700/50 bg-slate-800/30"
        } transition-colors duration-200`}
      >
        <div className="relative flex items-center">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Type your message..."
            className="w-full bg-slate-700/50 border border-slate-600/50 rounded-full py-3 pl-4 pr-12 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/70"
          />
          <button
            type="submit"
            disabled={input.trim() === ""}
            className={`absolute right-1 rounded-full p-2 ${
              input.trim()
                ? "text-white bg-indigo-600 hover:bg-indigo-500"
                : "text-slate-500 bg-slate-700/50 cursor-not-allowed"
            } transition-colors`}
          >
            {isTyping ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        </div>
      </form>

      {/* Animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        .delay-75 { animation-delay: 0.2s; }
        .delay-150 { animation-delay: 0.4s; }
      `}</style>
    </div>
  );
}
