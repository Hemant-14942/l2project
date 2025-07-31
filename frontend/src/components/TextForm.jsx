// TextForm.jsx
import { useState } from "react";
import axios from "../api/axiosInstance";
import Summary from "./Summary";

export default function TextForm() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");

  const handleSummarize = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setSummary(null);
    try {
      const res = await axios.post("/api/summarize/all", { content: text });
      console.log(res.data);
      
      setSummary(res.data);
      setActiveTab("basic");
      setShowSummary(true);
    } catch (err) {
      console.error(err);
      setSummary({
        basic: "Error generating summary. Please try again.",
        story: "Error generating summary. Please try again.",
        visual: "Error generating summary. Please try again.",
      });
      setShowSummary(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e1a] text-white px-4 py-10 flex flex-col items-center">
      {!showSummary && !loading && (
        <div className="w-full max-w-4xl bg-[#1b1033] rounded-2xl p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-center mb-2 text-purple-400">
            Text Summarizer
          </h1>
          <p className="text-center text-sm text-gray-400 mb-6">
            Paste your content below
          </p>

          <form onSubmit={handleSummarize} className="space-y-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-52 p-4 bg-[#2a194f] text-white text-sm rounded-lg border border-white/10 focus:outline-none resize-none"
              placeholder="Enter your text here..."
            ></textarea>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold bg-gradient-to-r from-purple-600 to-purple-800 hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Generating Summary..." : "Generate Summary"}
            </button>
          </form>
        </div>
      )}

      {loading && (
  <div className="mt-20 flex flex-col items-center justify-center gap-6 animate-fade-in">
    {/* Glowing animated container */}
    <div className="relative w-52 h-52 rounded-full overflow-hidden bg-amber-100 shadow-[0_0_60px_10px_rgba(255,191,0,0.3)] animate-bounce-slow flex justify-center items-center">
      <img
        src="/monkeyfunny.gif"
        alt="Loading monkey"
        className="w-full h-full object-cover p-4 rounded-full"
      />
    </div>

    {/* Spinner & message */}
    <div className="text-center space-y-3">
      <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto animate-spin" />
      <p className="text-md text-gray-400 font-light tracking-wide">
        Monkey is thinking hard... <br /> Please hold tight while we generate your summary.
      </p>
    </div>
  </div>
)}

      {summary && !loading && showSummary && (
        <Summary
          summary={summary}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          resetForm={() => {
            setText("");
            setSummary(null);
            setShowSummary(false);
          }}
        />
      )}
    </div>
  );
}
