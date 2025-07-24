import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";
import { motion } from "framer-motion";
import qs from "qs";

const formatSummary = (text) => {
  if (!text) return "";
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong class='text-purple-400'>$1</strong>")
    .replace(/\n/g, "<br />");
};

const VisualCard = ({ data }) => {
  if (!data) return null;
  const sections = data.split(/─{5,}/g);
  return (
    <div className="grid gap-4">
      {sections.map((section, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="p-4 bg-gradient-to-br from-purple-900/30 to-purple-700/10 rounded-xl border border-white/10 shadow-md"
        >
          <div
            dangerouslySetInnerHTML={{ __html: formatSummary(section.trim()) }}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default function YouTubeForm() {
  const [link, setLink] = useState("");
  const [loadingStep, setLoadingStep] = useState(null); // 'transcribing' | 'summarizing' | null
  const [summary, setSummary] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!link.trim()) return;
    console.log(link);
    

    setSummary(null);
    setLoadingStep("transcribing");

    try {
      // Step 1: Get transcript
      const transcriptRes = await axios.post("/youtube/transcript", qs.stringify({ url: link }), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      console.log("transcriptRes", transcriptRes);
      const transcriptText = transcriptRes.data?.transcript || "";
      console.log("transcriptText", transcriptText);

      // Move to next loader step
      setLoadingStep("summarizing");

      // Step 2: Summarize transcript
      const summaryRes = await axios.post("/summarize/all", {
        content: transcriptText,
      });
      setSummary(summaryRes.data); // { basic, story, visual }
      setActiveTab("basic");
    } catch (error) {
      console.error(error);
      setSummary({
        basic: "Error generating summary. Please try again.",
        story: "Error generating summary. Please try again.",
        visual: "Error generating summary. Please try again.",
      });
    } finally {
      setLoadingStep(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e1a] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-6 mt-34">
        {/* YouTube Link Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/5 p-6 rounded-2xl w-full space-y-4"
        >
          <h2 className="text-2xl font-bold mb-4">YouTube Video Link</h2>
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="w-full p-3 bg-black/20 rounded-lg border border-white/10 focus:outline-none"
            placeholder="Enter YouTube URL"
          />
          <button
            type="submit"
            className="w-full py-2 rounded-xl bg-gradient-to-r from-purple-500 to-purple-700 hover:opacity-90 transition-all"
          >
            Summarize
          </button>
        </form>

        {/* Loader with steps */}
        {loadingStep && (
          <div className="text-center mt-4">
            <motion.div
              className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full mx-auto animate-spin"
            />
            <p className="text-gray-400 mt-2">
              {loadingStep === "transcribing"
                ? "Transcribing video..."
                : "Generating summary..."}
            </p>
          </div>
        )}

        {/* Summary Tabs */}
        {summary && !loadingStep && (
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
              className="text-gray-300 leading-relaxed space-y-2"
            >
              {activeTab === "visual" ? (
                <VisualCard data={summary.visual} />
              ) : (
                <div
                  dangerouslySetInnerHTML={{
                    __html: formatSummary(summary[activeTab]),
                  }}
                />
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
