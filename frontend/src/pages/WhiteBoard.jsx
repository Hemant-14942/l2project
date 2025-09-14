import React, { useEffect } from "react";
import { ZegoSuperBoardManager } from "zego-superboard-web";
import { ZegoExpressEngine } from "zego-express-engine-webrtc";

const WhiteBoard = () => {
  const appID = Number(import.meta.env.VITE_ZEGO_APP_ID); 
  const server = import.meta.env.VITE_ZEGO_SERVER;
  const roomID = "12122";
  const userName = "hemant";
  const userID = "12345"; 
  const token = import.meta.env.VITE_ZEGO_TOKEN; 


   const zg = new ZegoExpressEngine(appID, server);
    const zegoSuperBoard = ZegoSuperBoardManager.getInstance();
  const initBoard = async () => {
    try {

      const initRes = await zegoSuperBoard.init(zg, {
        parentDomID: "whiteboard-container",
        appID,
        userID,
        token,
      });

      if (!initRes) {
        console.error("❌ Whiteboard init failed. Check params!");
        return;
      }

      const loginRes = await zg.loginRoom(
        roomID,
        token,
        { userID, userName },
        { userUpdate: true }
      );
      if (!loginRes) {
        console.error("❌ Room login failed");
        return;
      }

      const view = await zegoSuperBoard.createWhiteboardView({
        name: "my_whiteboard",
        perPageWidth: 1600,
        perPageHeight: 900,
        pageCount: 1,
      });
      
    } catch (err) {
      console.error("🚨 Whiteboard error:", err);
    }
  };

  useEffect(() => {
    if (zegoSuperBoard){
      initBoard();
         // ✅ Default tool = Pen
        zegoSuperBoard.setToolType(1); // Pen
        zegoSuperBoard.setBrushColor("#01BB35"); // Red
        zegoSuperBoard.setBrushSize(6);
    }
  }, [zegoSuperBoard]);



  return (
    <div className="flex flex-col items-center justify-center min-h-screen  bg-gray-100 p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        Collaborative Whiteboard
      </h1>
      <div
        id="whiteboard-container"
        className="w-full max-w-5xl h-[70vh] bg-white shadow-2xl rounded-2xl border border-gray-500 border-4 overflow-hidden"
      ></div>
    </div>
  );
};

export default WhiteBoard;
