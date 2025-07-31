import React, { useState, useEffect, useRef } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Send, Sparkles, X, Loader2, BookOpen, Heart, Target, Lightbulb, Trophy, MessageCircle } from "lucide-react";
import axios from "../api/axiosInstance";

export default function MotivAI() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    questionsAsked: 0,
    motivationalMessages: 0,
    studyTime: 0
  });
  const messagesEndRef = useRef(null);

  const quickActions = [
    { icon: BookOpen, text: "Study Tips", action: "give me effective study tips" },
    { icon: Target, text: "Set Goals", action: "help me set academic goals" },
    { icon: Heart, text: "Motivation", action: "I need some motivation" },
    { icon: Lightbulb, text: "Doubt Clearing", action: "I have a doubt about" }
  ];

  const simulateResponse = async (userMessage) => {
    setIsTyping(true);

    try {
      const res = await axios.post("/api/chat", {
        user_id: "user123", // You can replace this with dynamic user ID
        message: userMessage,
        current_topic: "coaching" // coaching context for MotivAI
      });
      
      console.log(res.data);
      const aiMessage = res.data.response;

      // Update session stats based on message content
      if (userMessage.toLowerCase().includes("motivation")) {
        setSessionStats(prev => ({ ...prev, motivationalMessages: prev.motivationalMessages + 1 }));
      } else if (userMessage.toLowerCase().includes("doubt")) {
        setSessionStats(prev => ({ ...prev, questionsAsked: prev.questionsAsked + 1 }));
      }

      setMessages((prev) => [...prev, { text: aiMessage, isUser: false, timestamp: new Date() }]);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setMessages((prev) => [
        ...prev,
        { text: "I'm having trouble connecting right now, but don't let that stop your learning momentum! Try asking again in a moment. 🚀", isUser: false, timestamp: new Date() }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!input.trim()) return;
    const msg = input.trim();
    setMessages((prev) => [...prev, { text: msg, isUser: true, timestamp: new Date() }]);
    setInput("");
    simulateResponse(msg);
  };

  const handleQuickAction = (action) => {
    setMessages((prev) => [...prev, { text: action, isUser: true, timestamp: new Date() }]);
    simulateResponse(action);
  };

  const clearMessages = () => {
    setMessages([]);
    setSessionStats({ questionsAsked: 0, motivationalMessages: 0, studyTime: 0 });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionStats(prev => ({ ...prev, studyTime: prev.studyTime + 1 }));
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-5xl bg-amber-50  mx-auto h-[700px] bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-2xl overflow-hidden shadow-2xl border border-indigo-500/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600/40 to-purple-600/40 backdrop-blur-sm p-6 border-b border-indigo-500/30">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
                <Sparkles className="text-white h-5 w-5" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-800 animate-pulse"></div>
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">MotivAI Coach</h2>
              <p className="text-indigo-200 text-sm">
                Your Personal Academic Companion
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex space-x-4 text-xs text-indigo-200">
              <div className="flex items-center space-x-1">
                <MessageCircle className="h-3 w-3" />
                <span>{sessionStats.questionsAsked} doubts cleared</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="h-3 w-3" />
                <span>{sessionStats.motivationalMessages} motivations</span>
              </div>
              <div className="flex items-center space-x-1">
                <Trophy className="h-3 w-3" />
                <span>{sessionStats.studyTime}min session</span>
              </div>
            </div>
            <button
              // onClick={clearMessages}
              onClick={() => navigate(-1)}
              className="text-indigo-200 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex h-[calc(100%-180px)]">
        {/* Chat Messages */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-900/50">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
              <div className="relative">
                {/* <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 animate-pulse">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Trophy className="h-4 w-4 text-yellow-800" />
                </div> */}
                <img
                  src="/juicy-woman-in-workflow-multitasking.gif"
                  alt=""
                  className="w-50 h-50"
                />
              </div>
              <div>
                <div className="flex items-center justify-center space-x-2">
                  <h3 className="text-white text-2xl font-bold ">
                    Welcome to MotivAI! 
                  </h3>
                  <img
                    src="/juicy-rocket.gif"
                    className="w-5"
                    alt=""
                  />
                </div>
                <p className="text-slate-300 text-sm max-w-md leading-relaxed">
                  I'm here to help you excel in your studies! Ask me doubts, get
                  study tips, set goals, or just chat when you need motivation.
                  Your success is my mission!
                </p>
              </div>

              {/* Quick Action Buttons */}
              <div className="grid grid-cols-2 gap-3 ">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action.action)}
                    className="flex items-center space-x-2 p-3 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 hover:from-indigo-600/40 hover:to-purple-600/40 border border-indigo-500/30 rounded-xl text-indigo-200 hover:text-white transition-all duration-200 hover:scale-105"
                  >
                    <action.icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{action.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] flex items-start space-x-2 ${
                      msg.isUser ? "flex-row-reverse space-x-reverse" : ""
                    }`}
                  >
                    {!msg.isUser && (
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`p-4 rounded-2xl ${
                        msg.isUser
                          ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-md shadow-lg"
                          : "bg-gradient-to-r from-slate-700/80 to-slate-600/80 text-slate-100 rounded-tl-md border border-slate-500/30 shadow-lg"
                      } animate-fade-in backdrop-blur-sm`}
                    >
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      <p className="text-xs opacity-60 mt-2">
                        {msg.timestamp?.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-700/80 to-slate-600/80 rounded-tl-md border border-slate-500/30 backdrop-blur-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce delay-100"></div>
                        <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div
        className={`p-6 border-t ${
          isFocused
            ? "border-indigo-400/70 bg-gradient-to-r from-slate-800/90 to-indigo-900/30"
            : "border-slate-600/30 bg-slate-800/50"
        } transition-all duration-300 backdrop-blur-sm`}
      >
        <div className="relative flex items-center">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyPress={(e) => e.key === "Enter" && handleSubmit(e)}
            placeholder="Ask me anything... doubts, study tips, motivation! 🌟"
            className="w-full bg-slate-700/50 border border-slate-500/50 rounded-2xl py-4 pl-6 pr-14 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/70 focus:border-indigo-400/70 transition-all duration-200 text-sm"
          />
          <button
            onClick={handleSubmit}
            disabled={input.trim() === "" || isTyping}
            className={`absolute right-2 rounded-xl p-3 transition-all duration-200 ${
              input.trim() && !isTyping
                ? "text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg hover:shadow-indigo-500/25 hover:scale-105"
                : "text-slate-500 bg-slate-700/50 cursor-not-allowed"
            }`}
          >
            {isTyping ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
        }
        .animate-bounce {
          animation: bounce 1.4s infinite;
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
      `}</style>
    </div>
  );
}