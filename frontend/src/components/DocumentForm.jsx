import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function DocumentForm() {
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/summary", { state: { inputType: "document", data: file?.name } });
  };

  return (
    <div className="min-h-screen bg-[#0b0e1a] text-white flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white/5 p-6 rounded-2xl w-full max-w-lg space-y-4"
      >
        <h2 className="text-2xl font-bold mb-4">Upload Document</h2>
        <input
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full p-2 bg-black/20 rounded-lg border border-white/10"
        />
        <button
          type="submit"
          className="w-full py-2 rounded-xl bg-gradient-to-r from-purple-500 to-purple-700 hover:opacity-90 transition-all"
        >
          Summarize
        </button>
      </form>
    </div>
  );
}
