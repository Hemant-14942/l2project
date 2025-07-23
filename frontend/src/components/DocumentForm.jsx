import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UploadCloud } from "lucide-react";

export default function DocumentForm() {
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) return;
    console.log(file);
    navigate("/summary", { state: { inputType: "document", data: file?.name } });
  };

  return (
    <div className="min-h-screen bg-[#0b0e1a] text-white flex items-center justify-center p-6">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white/5 p-6 rounded-2xl w-full max-w-lg space-y-5 shadow-lg border border-white/10"
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
    </div>
  );
}
