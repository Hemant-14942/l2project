import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function YouTubeForm() {
  const [link, setLink] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/summary", { state: { inputType: "youtube", data: link } });
  };

  return (
    <div className="min-h-screen bg-[#0b0e1a] text-white flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white/5 p-6 rounded-2xl w-full max-w-lg space-y-4"
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
    </div>
  );
}
