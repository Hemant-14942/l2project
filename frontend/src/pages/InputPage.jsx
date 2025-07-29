import { Mic, Upload, Youtube, Type } from "lucide-react";
import { useNavigate } from "react-router-dom";


export default function InputPage() {
  const navigate = useNavigate();

  const goToForm = (type) => {
    navigate(`/${type}`);
  };

  return (
    <div className=" relative  text-white flex flex-col items-center justify-center p-6 pt-23 ">
      {/* <SplashCursor/> */}
      <h1 className="text-4xl font-bold mb-8 text-center">
        Choose Your Input Type
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        <Card icon={<Type size={40} />} title="Text Input" onClick={() => goToForm("text")} />
        <Card icon={<Youtube size={40} />} title="YouTube Link" onClick={() => goToForm("youtube")} />
        <Card icon={<Upload size={40} />} title="Document Upload" onClick={() => goToForm("document")} />
        <Card icon={<Mic size={40} />} title="Voice Input" onClick={() => goToForm("voice")} />
      </div>
    </div>
  );
}

const Card = ({ icon, title, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-purple-500/10 transition-all duration-300"
  >
    <div className="mb-4 text-purple-400">{icon}</div>
    <p className="text-lg font-medium">{title}</p>
  </div>
);