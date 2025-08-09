import { useState } from "react";
import axios from "../api/axiosInstance";
import {
  Loader2,
  Volume2,
} from "lucide-react";
const AudioGenerator = ({ text, voiceType }) => {
  console.log("inside audio generator");
  
  
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const BASE_URL = "http://localhost:8000";
  // console.log(text);


  const handleGenerateAudio = async () => {
    console.log("inside handle generate audio");

    setLoading(true);
    setAudioUrl(null);
    try {
      const formData = new FormData();
      formData.append("text", text);
      // formData.append("voice_type", voiceType);
      console.log("going for the response giys🎟 ");
      
      const response = await axios.post("/api/tts/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log(response.data);
      console.log(response.data.audio_file);
      

      if (response.data.audio_file) {
        setAudioUrl(`${BASE_URL}${response.data.audio_file}?t=${Date.now()}`);
        console.log("Audio URL:", audioUrl);
      }
    } catch (error) {
      console.error("Error generating audio:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3 ">
      <button
        onClick={handleGenerateAudio}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
          loading
            ? "bg-gray-700 text-gray-400 cursor-not-allowed"
            : "bg-purple-600 hover:bg-purple-700 text-white"
        }`}
      >
        {loading ? (
          <Loader2 className="animate-spin" size={16} />
        ) : (
          <Volume2 size={16} />
        )}
        {loading ? "Generating..." : "Generate Audio"}
      </button>

      {audioUrl && (
         <CustomAudioPlayer src={audioUrl} />
        // <audio controls className="mt-3 w-full max-w-md block">
        //   <source src={audioUrl} type="audio/mpeg" />
        //   Your browser does not support the audio element.
        // </audio>
      )}
    </div>
  );
};
export default AudioGenerator;