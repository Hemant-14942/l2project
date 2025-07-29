import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";
import qs from "qs";
import Summary from "./Summary";

const YouTubeForm = () => {
  const [link, setLink] = useState("");
  const [loadingStep, setLoadingStep] = useState(null);
  const [summary, setSummary] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!link.trim()) return;

    setSummary(null);
    setLoadingStep("transcribing");

    try {
      const transcriptRes = await axios.post(
        "/api/youtube/transcript",
        qs.stringify({ url: link }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      const transcriptText = transcriptRes.data?.transcript || "";
      setLoadingStep("summarizing");

      const summaryRes = await axios.post("/api/summarize/all", {
        content: transcriptText,
      });

      setSummary(summaryRes.data);
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

  const resetForm = () => {
    setSummary(null);
    setLink("");
    setActiveTab("basic");
  };

  return (
    <div className=" text-white flex items-center justify-center p-6">
      <div className="max-w-4xl w-full pt-26">
        {/* Form (Only if summary not yet shown) */}
        {!summary && (
          <form
            onSubmit={handleSubmit}
            className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-xl space-y-6"
          >
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">YouTube Video Link</h2>
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="w-full p-3 bg-black/20 rounded-lg border border-white/10 focus:outline-none text-sm text-gray-200"
                placeholder="Enter YouTube URL"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-500 to-purple-700 hover:opacity-90 transition-all text-white"
            >
              {loadingStep ? "Processing..." : "Summarize"}
            </button>
          </form>
        )}

        {/* Loading UI */}
        {loadingStep && (
          <div className="mt-8 flex items-center justify-center   rounded-2xl">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto animate-spin" />
              <p className="text-sm text-gray-400">
                {loadingStep === "transcribing"
                  ? "Transcribing video..."
                  : "Generating summary..."}
              </p>
            </div>
          </div>
        )}

        {/* Summary UI */}
        {summary && !loadingStep && (
          <Summary
            summary={summary}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            resetForm={resetForm}
          />
        )}
      </div>
    </div>
  );
};

export default YouTubeForm;
