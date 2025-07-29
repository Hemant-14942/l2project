import axios from "../api/axiosInstance";
import { Mic } from "lucide-react";
import { useState, useEffect } from "react";
import Summary from "./Summary";

const AIVoiceInput = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [time, setTime] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [summary, setSummary] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [loading, setLoading] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [mediaBlobUrl, setMediaBlobUrl] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);

  const visualizerBars = 48;

  useEffect(() => setIsClient(true), []);

  useEffect(() => {
    let intervalId;
    if (isRecording) {
      intervalId = setInterval(() => setTime((t) => t + 1), 1000);
    }
    return () => clearInterval(intervalId);
  }, [isRecording]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleMicClick = async () => {
    if (isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    } else {
      setTime(0);
      setSummary(null);
      setHasRecording(false);
      setMediaBlobUrl(null);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const chunks = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);
          setAudioChunks(chunks);
          setMediaBlobUrl(url);
          setHasRecording(true);
        };

        recorder.start();
        setMediaRecorder(recorder);
        setAudioChunks([]);
        setIsRecording(true);
      } catch (err) {
        console.error("Microphone access denied or error occurred:", err);
      }
    }
  };

  const handleSummarize = async () => {
    if (!hasRecording || !mediaBlobUrl) return;
    setLoading(true);
    setSummary(null);
    setActiveTab("basic");

    try {
      const blob = await fetch(mediaBlobUrl).then(res => res.blob());
      const audioFile = new File([blob], "recording.webm", { type: blob.type });

      const formData = new FormData();
      formData.append("file", audioFile);

      const res = await axios.post("/api/upload/audio", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const summaryRes = await axios.post("/api/summarize/all", {
        content: res.data.transcript
      });

      setSummary(summaryRes.data);
    } catch (err) {
      console.error(err);
      setSummary({
        basic: "Failed to generate summary.",
        story: "Failed to generate summary.",
        visual: "Failed to generate summary.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToInput = () => {
    setSummary(null);
    setActiveTab("basic");
    setMediaBlobUrl(null);
    setHasRecording(false);
    setTime(0);
  };

  const cn = (...classes) => classes.filter(Boolean).join(' ');

  return (
    <div className=" text-white p-6">
      <div className="max-w-6xl mx-auto ">
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center min-h-[80vh] ">

          {/* Left Panel: Input and Recorder */}
          {!summary && (
            <div className="lg:w-1/2 w-full flex flex-col items-center  gap-6 lg:pt-20 ">
              <button
                className={cn(
                  "group w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl",
                  isRecording ? "bg-[#7B3FE4]/30 scale-110" : "bg-[#0b0d1a] hover:bg-[#1c1f2e] border-2 border-[#7B3FE4]/20"
                )}
                onClick={handleMicClick}
              >
                {isRecording ? (
                  <div className="w-8 h-8 rounded-sm bg-[#7B3FE4] animate-pulse" />
                ) : (
                  <Mic className="w-8 h-8 text-[#7B3FE4]" />
                )}
              </button>

              <div className="text-center space-y-2">
                <span className={cn("font-mono text-lg font-semibold", isRecording ? "text-[#7B3FE4]" : "text-gray-400")}>{formatTime(time)}</span>
                <p className="text-sm text-gray-300">{isRecording ? "Recording..." : hasRecording ? "Recording completed" : "Click to start recording"}</p>
              </div>

              {/* Audio Visualizer */}
              <div className="h-16 w-80 flex items-end justify-center gap-1 bg-[#0b0d1a]/50 rounded-lg p-2">
                {[...Array(visualizerBars)].map((_, i) => (
                  <div
                    key={i}
                    className={cn("w-1 rounded-full transition-all duration-200", isRecording ? "bg-gradient-to-t from-[#7B3FE4] to-purple-300" : "bg-gray-600")}
                    style={isRecording && isClient ? { height: `${10 + Math.random() * 90}%`, animationDelay: `${i * 0.05}s` } : { height: "8px" }}
                  />
                ))}
              </div>

              {hasRecording && mediaBlobUrl && (
                <div className="w-full max-w-sm space-y-4">
                  <div className="p-4 bg-[#0b0d1a]/50 rounded-xl border border-white/10">
                    <div className="h-8 bg-gray-700 rounded flex items-center px-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-xs text-gray-300">Recording ready</span>
                    </div>
                  </div>

                  <button
                    onClick={handleSummarize}
                    disabled={loading}
                    className={cn("w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300",
                      loading ? "bg-gray-600 text-gray-400 cursor-not-allowed" : "bg-[#7B3FE4] hover:bg-[#6B2FD4] text-white shadow-lg hover:shadow-xl")}
                  >
                    {loading ? "Processing..." : "Summarize"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Right Panel: Summary */}
              {!loading && summary && (
                <Summary
                  summary={summary}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  handleBack={handleBackToInput}
                />
              )}
        </div>
      </div>
    </div>
  );
};

export default AIVoiceInput;
