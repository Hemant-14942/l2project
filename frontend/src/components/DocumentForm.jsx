import { useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud } from "lucide-react";
import axios from "../api/axiosInstance";

export default function DocumentForm() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setSummary(null);

    try {
      // Prepare FormData for file upload
      const formData = new FormData();
      formData.append("file", file);

      // 1. Upload PDF and get transcript/text
      const uploadRes = await axios.post("/upload/pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Upload Response:", uploadRes.data);

      // 2. Call summarization endpoint
      const summarizeRes = await axios.post("/summarize/all", {
        content: uploadRes.data.extracted_text, // assuming API returns text
      });

      console.log("Summaries:", summarizeRes.data);
      setSummary(summarizeRes.data); // { basic, story, visual }
      setActiveTab("basic");
    } catch (error) {
      console.error("Error processing document:", error);
      setSummary({
        basic: "Error generating summary. Please try again.",
        story: "Error generating summary. Please try again.",
        visual: "Error generating summary. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e1a] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-6 mt-20">
        {/* Upload Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-white/5 p-6 rounded-2xl w-full space-y-5 shadow-lg border border-white/10"
        >
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold mb-4 text-center"
          >
            Upload Document
          </motion.h2>

          {/* File Input with Icon */}
          <motion.label
            whileHover={{ scale: 1.02 }}
            className="flex flex-col items-center justify-center p-6 border border-dashed border-white/20 rounded-lg cursor-pointer hover:border-purple-500 transition-all"
          >
            <UploadCloud className="w-10 h-10 text-purple-400 mb-2" />
            <span className="text-gray-300 mb-2">
              {file ? file.name : "Click or drag file here"}
            </span>
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={(e) => setFile(e.target.files[0])}
              className="hidden"
            />
          </motion.label>

          {/* Submit Button */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-2 rounded-xl bg-gradient-to-r from-purple-500 to-purple-700 hover:opacity-90 transition-all"
          >
            Summarize
          </motion.button>
        </motion.form>

        {/* Loader */}
        {loading && (
          <div className="text-center mt-4">
            <motion.div
              className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full mx-auto animate-spin"
            />
            <p className="text-gray-400 mt-2">Processing document...</p>
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
              className="text-gray-300 whitespace-pre-line"
            >
              {summary[activeTab]}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
