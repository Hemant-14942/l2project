import { useLocation, useNavigate } from "react-router-dom";

export default function Summary() {
  const { state } = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0b0e1a] text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-4">Summary Result</h1>
      <p className="text-gray-300 mb-6">
        Your {state?.inputType || "input"} summary is ready!
      </p>
      <button
        onClick={() => navigate("/")}
        className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-700 hover:opacity-90 transition-all"
      >
        Back to Input
      </button>
    </div>
  );
}
