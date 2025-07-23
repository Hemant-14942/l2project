import { useNavigate } from "react-router-dom";

export default function VoiceForm() {
  const navigate = useNavigate();

  const handleRecord = () => {
    // Simulate voice input
    setTimeout(() => {
      navigate("/summary", { state: { inputType: "voice", data: "Recorded Audio" } });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#0b0e1a] text-white flex items-center justify-center p-6">
      <div className="bg-white/5 p-6 rounded-2xl w-full max-w-lg text-center space-y-4">
        <h2 className="text-2xl font-bold mb-4">Voice Input</h2>
        <button
          onClick={handleRecord}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-700 hover:opacity-90 transition-all"
        >
          Start Recording
        </button>
      </div>
    </div>
  );
}
