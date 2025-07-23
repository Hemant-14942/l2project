"use client";

import { Mic } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "../lib/utils";
import { useNavigate } from "react-router-dom";
import { useReactMediaRecorder } from "react-media-recorder";

export function AIVoiceInput() {
  const [isRecording, setIsRecording] = useState(false);
  const [time, setTime] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const visualizerBars = 48; 

  const { 
    status,         // idle | recording | stopped
    startRecording, 
    stopRecording,  
    mediaBlobUrl    
  } = useReactMediaRecorder({ audio: true });

  const navigate = useNavigate();

  useEffect(() => setIsClient(true), []);

  // Timer logic
  useEffect(() => {
    let intervalId;
    if (isRecording) {
      intervalId = setInterval(() => setTime((t) => t + 1), 1000);
    } else {
      setTime(0);
    }
    return () => clearInterval(intervalId);
  }, [isRecording]);

  const handleClick = () => {
    setIsRecording((prev) => !prev);
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleSubmit = () => {
    setTimeout(() => {
      navigate("/summary", { state: { inputType: "voice", data: "Recorded Audio" } });
    }, 500);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full py-4">
      <div className="relative max-w-xl w-full mx-auto flex items-center flex-col gap-4 mt-50">
        {/* Mic button */}
        <button
          className={cn(
            "group w-16 h-16 rounded-full flex items-center justify-center transition-colors shadow-lg",
            isRecording
              ? "bg-[#7B3FE4]/30"
              : "bg-[#0b0d1a] hover:bg-[#1c1f2e]"
          )}
          type="button"
          onClick={handleClick}
        >
          {isRecording ? (
            <div
              className="w-6 h-6 rounded-sm animate-spin bg-[#7B3FE4]"
              style={{ animationDuration: "3s" }}
            />
          ) : (
            <Mic className="w-6 h-6 text-[#7B3FE4]" />
          )}
        </button>

        {/* Timer */}
        <span
          className={cn(
            "font-mono text-sm transition-opacity duration-300",
            isRecording ? "text-white" : "text-gray-400"
          )}
        >
          {formatTime(time)}
        </span>

        {/* Visualizer */}
        <div className="h-4 w-64 flex items-center justify-center gap-0.5">
          {[...Array(visualizerBars)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-0.5 rounded-full transition-all duration-300",
                isRecording
                  ? "bg-gradient-to-t from-[#7B3FE4] to-purple-300 animate-pulse"
                  : "bg-gray-600 h-1"
              )}
              style={
                isRecording && isClient
                  ? {
                      height: `${20 + Math.random() * 80}%`,
                      animationDelay: `${i * 0.05}s`,
                    }
                  : undefined
              }
            />
          ))}
        </div>

        {/* Status text */}
        <p className="h-4 text-xs text-gray-300">
          {isRecording ? "Listening..." : "Click to speak"}
        </p>

        {/* Audio player (only show if stopped and we have a recording) */}
        {status === "stopped" && mediaBlobUrl && (
          <div className="w-full mt-4 p-3 bg-[#0b0d1a] rounded-xl shadow-lg">
            <audio
              src={mediaBlobUrl}
              controls
              className="w-full rounded-lg"
            />
          </div>
        )}

        {/* Summarise button (show only after recording stops) */}
        {status === "stopped" && (
          <button
            onClick={handleSubmit}
            className="mt-4 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-700 hover:opacity-90 transition-all shadow-md"
          >
            Summarise
          </button>
        )}
      </div>
    </div>
  );
}
