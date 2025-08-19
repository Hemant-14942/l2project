import React, { useState, useEffect } from "react";
import axios from "../api/axiosInstance";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  Eye,
  Loader2,
  Volume2,
  ArrowRight,
} from "lucide-react";
import CustomAudioPlayer from "./CustomAudioPlayer";
import AudioGenerator from "./AudioGenerator";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

// Formatting functions for summaries
const formatBasicSummary = (text = "") => {
  return text
    .replace(
      /\*\*(.*?)\*\*/g,
      "<strong class='text-purple-300 font-semibold'>$1</strong>"
    )
    .replace(/^-\s+/gm, "")
    .replace(
      /(\bLove\b|\bcare\b|\baffection\b|\bhappy\b|\bsafe\b|\bkind\b|\bsupportive\b|\bunderstanding\b)/gi,
      "<span class='text-purple-200 font-medium'>$1</span>"
    )
    .replace(/\n/g, "<br />");
};

const formatStoryText = (text = "") => {
  return text
    .replace(
      /\*\*(.*?)\*\*/g,
      "<strong class='text-purple-300 font-semibold'>$1</strong>"
    )
    .replace(
      /###\s*(.*)/g,
      "<h3 class='text-lg font-semibold text-white mb-3 flex items-center gap-2'>$1</h3>"
    )
    .replace(
      /####\s*(.*)/g,
      "<h4 class='text-base font-medium text-gray-200 mb-2 flex items-center gap-2'>$1</h4>"
    )
    .replace(
      /(\bZiggy\b|\bJamie\b|\bGrandma Dot\b|\bDr. Luna\b)/gi,
      "<span class='text-purple-200 font-medium'>$1</span>"
    )
    .replace(
      /(\blove\b|\bheart\b|\bcare\b|\bkindness\b|\bconnection\b)/gi,
      "<span class='text-purple-200 font-medium'>$1</span>"
    )
    .replace(
      /💖|❤️|💌|🚲|🧩|🏰|⚡️|🌈/g,
      "<span class='text-xl inline-block mx-1'>$&</span>"
    )
    .replace(/\n/g, "<br />");
};

const formatVisualContent = (text = "") => {
  return text
    .replace(/═{10,}/g, "")
    .replace(/─{10,}/g, "")
    .replace(
      /#\s*(.*)/g,
      "<h2 class='text-xl font-semibold text-white mb-4'>$1</h2>"
    )
    .replace(
      /##\s*(.*)/g,
      "<h3 class='text-lg font-medium text-gray-200 mb-3'>$1</h3>"
    )
    .replace(
      /###\s*(.*)/g,
      "<h4 class='text-base font-medium text-gray-300 mb-2'>$1</h4>"
    )
    .replace(
      /\*\*(.*?)\*\*/g,
      "<strong class='text-purple-300 font-semibold'>$1</strong>"
    )
    .replace(
      /(\bLove\b|\bEmotion\b|\bBrain\b|\bChemicals\b|\bBonding\b|\bAttraction\b)/gi,
      "<span class='text-purple-200 font-medium'>$1</span>"
    )
    .replace(
      /🔴|🔵|🟢|🟡|🟣|🔶|🔷|🔸|🔹|🔺/g,
      "<span class='text-lg inline-block mx-1'>$&</span>"
    )
    .replace(/```[\s\S]*?```/g, (match) => {
      const code = match.replace(/```\w*\n?/, "").replace(/```$/, "");
      return `<div class='bg-gray-800/30 border border-gray-600/30 rounded-lg p-3 mt-2 mb-2 font-mono text-sm text-gray-300'>${code}</div>`;
    })
    .replace(/\n/g, "<br />");
};

// 🔊 Audio Generator component


// 🔲 Renders the Basic summary as bullet-style points
const BasicCard = ({ data }) => {
  if (!data) return null;
  const points = data.split(/^-\s+/gm).filter((point) => point.trim());

  return (
    <div className="space-y-3">
      {points.map((point, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="flex items-start gap-3 p-4 bg-gray-800/20 rounded-xl border border-gray-700/30 hover:border-purple-500/30 transition-all duration-300"
        >
          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
          <div className="flex-1 text-gray-300 leading-relaxed">
            <div
              dangerouslySetInnerHTML={{
                __html: formatBasicSummary(point.trim()),
              }}
            />
          </div>
        </motion.div>
      ))}
      <AudioGenerator text={data.trim()} voiceType="summary" />
    </div>
  );
};

// 📖 Story-based summary with sections
const StoryCard = ({ data }) => {
  if (!data) return null;
  const sections = data.split(/#### |### /).filter((section) => section.trim());

  return (
    <div className="space-y-4">
      {sections.map((section, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="p-4 bg-gray-800/20 rounded-xl border border-gray-700/30 hover:border-purple-500/30 transition-all duration-300"
        >
          <div className="text-gray-300 leading-relaxed">
            <div
              dangerouslySetInnerHTML={{
                __html: formatStoryText(section.trim()),
              }}
            />
          </div>
        </motion.div>
      ))}
      <AudioGenerator text={data.trim()} voiceType="summary" />
    </div>
  );
};

// 👁️ Visual tab display
const VisualCard = ({ data }) => {
  if (!data) return null;
  const sections = data
    .split(/─{3,}|═{3,}/g)
    .filter((section) => section.trim());

  return (
    <div className="space-y-4">
      {sections.map((section, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="p-4 bg-gray-800/20 rounded-xl border border-gray-700/30 hover:border-purple-500/30 transition-all duration-300"
        >
          <div
            dangerouslySetInnerHTML={{
              __html: formatVisualContent(section.trim()),
            }}
          />
        </motion.div>
      ))}
    </div>
  );
};

// 🌟 Summary main wrapper
const Summary = ({ summary, activeTab, setActiveTab, resetForm }) => {
  const navigate = useNavigate();
  const {basic, story, visual} = summary;
  const { setBasicSummary, basicSummary } = useAuth();
  // console.log(basic);
  // console.log(story);
  // console.log(visual);
   useEffect(() => {
  if (summary) {
    setBasicSummary(summary);
  }
}, [summary]);
  // console.log(basicSummary);
  
  
  const getTabIcon = (tab) => {
    switch (tab) {
      case "basic":
        return <FileText size={16} />;
      case "story":
        return <BookOpen size={16} />;
      case "visual":
        return <Eye size={16} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-8">
      {/* <img
        src="/moon.png"
        alt=""
        className="w-23 h-23 absolute top-6 left-0 "
      /> */}
      {/* <img
        src="/star.gif"
        alt=""
        className="w-full h absolute top-6 left-0 "
      /> */}
      {/* Back Button & Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={resetForm}
          className="flex items-center gap-2 px-2 md:px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-all duration-300 font-medium"
        >
          <ArrowLeft size={16} />
          <span className="sm:hidden">Back</span>
          <span className="hidden sm:inline">Back to Input</span>
        </button>

        <h2 className="text-xl md:text-2xl font-semibold text-white">
          {activeTab === "story" && <span>Story Summary</span>}
          {activeTab === "visual" && <span>Visual Summary</span>}
          {activeTab === "basic" && <span>Basic Summary</span>}
        </h2>

        {/* <div className="w-10 md:w-32"></div> */}
        <div>
          <button
          onClick={()=>navigate("/SummaryPlayer")}
            className="flex items-center gap-2 px-2 md:px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-all duration-300 font-medium"
          >
            <ArrowRight size={16} />
            <span className="">Next</span>
          </button>
        </div>
      </div>

      {/* Tab Container */}
      <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex justify-center gap-1 p-1 bg-gray-800/30 border-b border-gray-700/30">
          {["basic", "story", "visual"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeTab === tab
                  ? "bg-purple-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-gray-700/50"
              }`}
            >
              {getTabIcon(tab)}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="p-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar"
          >
            {activeTab === "visual" && <VisualCard data={summary.visual} />}
            {activeTab === "story" && <StoryCard data={summary.story} />}
            {activeTab === "basic" && <BasicCard data={summary.basic} />}
          </motion.div>
        </div>
      </div>

      {/* Custom Scrollbar + Audio Styling */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(147, 51, 234, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(147, 51, 234, 0.7);
        }

        audio {
          background-color: rgba(31, 41, 55, 0.3);
          border-radius: 0.5rem;
          padding: 0.25rem;
        }
      `}</style>
    </div>
  );
};

export default Summary;
