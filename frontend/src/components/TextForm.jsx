import { useState } from "react";
import axios from "../api/axiosInstance";
import { motion } from "framer-motion";

export default function TextForm() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");

  const handleSummarize = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setSummary(null);

    try {
      const res = await axios.post("/summarize", { text });
      console.log(res.data);
      setSummary(res.data); // API should return { basic, story, visual }
      setActiveTab("basic");
    } catch (err) {
      console.error(err);
      setSummary({
        basic: "Error generating summary. Please try again.",
        story: "Error generating summary. Please try again.",
        visual: "Error generating summary. Please try again.",
      });
    } finally {
      setLoading(false);
      setText("");
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e1a] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-6">
        {/* Text Form */}
        <form
          onSubmit={handleSummarize}
          className="bg-white/5 p-6 rounded-2xl w-full space-y-4"
        >
          <h2 className="text-2xl font-bold mb-4">Enter Text</h2>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-32 md:h-56 p-3 bg-black/20 rounded-lg border border-white/10 focus:outline-none"
            placeholder="Paste your text here..."
          />
          <button
            type="submit"
            className="w-full py-2 rounded-xl bg-gradient-to-r from-purple-500 to-purple-700 hover:opacity-90 transition-all"
          >
            Summarize
          </button>
        </form>

        {/* Loader */}
        {loading && (
          <div className="text-center mt-4">
            <motion.div
              className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full mx-auto animate-spin"
            />
            <p className="text-gray-400 mt-2">Generating summary...</p>
          </div>
        )}

        {/* Summary Tabs */}
        {summary && !loading && (
          <div className="bg-white/5 rounded-2xl p-4 space-y-4 shadow-lg border border-white/10">
            {/* Tabs */}
            <div className="flex justify-center gap-3">
              {["basic", "story", "visual"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    activeTab === tab
                      ? "bg-purple-600 text-white"
                      : "bg-purple-900/30 text-gray-300 hover:bg-purple-800/50"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Summary Content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-gray-300"
            >
              {summary[activeTab]}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
