import { useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud } from "lucide-react";
import axios from "../api/axiosInstance";
import Summary from "./Summary";

export default function DocumentForm() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [isDragging, setIsDragging] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setSummary(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await axios.post("/api/upload/pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const summarizeRes = await axios.post("/api/summarize/all", {
        content: uploadRes.data.extracted_text,
      });

      setSummary(summarizeRes.data);
      setActiveTab("basic");
    } catch (error) {
      console.error("Error:", error);
      setSummary({
        basic: "❌ Error generating summary. Please try again.",
        story: "❌ Error generating summary. Please try again.",
        visual: "❌ Error generating summary. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const resetForm = () => {
    setFile(null);
    setSummary(null);
    setActiveTab("basic");
  };

  return (
    <div className="text-white p-6 flex items-center justify-center">
      <div className="w-full max-w-5xl pt-23">
        {!summary && (
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/5 p-8 rounded-2xl space-y-6 shadow-xl border border-white/10 flex flex-col items-center justify-center"
          >
            <h2 className="text-2xl font-bold text-center mb-4">
              Upload a Document to Summarize
            </h2>

            <label
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center w-full p-6 border border-dashed 
                rounded-lg cursor-pointer transition-all text-center 
                ${
                  isDragging
                    ? "border-purple-500 bg-purple-500/10"
                    : "border-white/20 hover:border-purple-500"
                }`}
            >
              <UploadCloud className="w-10 h-10 text-purple-400 mb-2" />
              <span className="text-gray-300 mb-1">
                {file ? file.name : "Click or drag file here"}
              </span>
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
              />
            </label>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-500 to-purple-700 hover:opacity-90 transition-all text-white"
            >
              {loading ? "Generating..." : "Summarize"}
            </motion.button>
          </motion.form>
        )}

        {summary && !loading && (
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
}
