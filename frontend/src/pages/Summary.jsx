import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Type, Youtube, Upload, Mic, CheckCircle } from "lucide-react";

export default function Summary() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // Icon based on input type
  const getIcon = () => {
    switch (state?.inputType) {
      case "text":
        return <Type className="w-10 h-10 text-purple-400" />;
      case "youtube":
        return <Youtube className="w-10 h-10 text-red-400" />;
      case "document":
        return <Upload className="w-10 h-10 text-green-400" />;
      case "voice":
        return <Mic className="w-10 h-10 text-blue-400" />;
      default:
        return <CheckCircle className="w-10 h-10 text-purple-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e1a] text-white flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center w-full max-w-lg shadow-lg"
      >
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex justify-center mb-4"
        >
          {getIcon()}
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-3xl font-bold mb-2"
        >
          Summary Result
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-gray-300 mb-6"
        >
          Your <span className="font-semibold text-purple-400">{state?.inputType || "input"}</span> summary is ready!
        </motion.p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/input")}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-700 hover:opacity-90 transition-all"
        >
          Back to Input
        </motion.button>
      </motion.div>
    </div>
  );
}
