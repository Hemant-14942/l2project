import React, { memo } from "react";
import { motion } from "framer-motion";

export default function BackgroundBoxesDemo() {
  const rows = new Array(150).fill(1);
  const cols = new Array(100).fill(1);

  const colors = [
    "rgb(125 211 252)", // sky-300
    "rgb(249 168 212)", // pink-300
    "rgb(134 239 172)", // green-300
    "rgb(253 224 71)",  // yellow-300
    "rgb(252 165 165)", // red-300
    "rgb(216 180 254)", // purple-300
    "rgb(147 197 253)", // blue-300
    "rgb(165 180 252)", // indigo-300
    "rgb(196 181 253)", // violet-300
  ];

  const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];

   const BoxesCore = ({ className }) => (
    <div
      style={{
        transform: `translate(-40%,-60%) skewX(-48deg) skewY(14deg) scale(0.675) rotate(0deg) translateZ(0)`,
      }}
      className={`absolute left-1/4 p-4 -top-1/4 flex -translate-x-1/2 -translate-y-1/2 w-full h-full z-0 ${className || ""}`}
    >
      {rows.map((_, i) => (
        <motion.div key={`row-${i}`} className="w-16 h-8 border-l border-slate-700 relative">
          {cols.map((_, j) => (
            <motion.div
              whileHover={{
                backgroundColor: getRandomColor(),
                transition: { duration: 0 },
              }}
              key={`col-${j}`}
              className="w-16 h-8 border-r border-t border-slate-700 relative"
            />
          ))}
        </motion.div>
      ))}
    </div>
  );

  const Boxes = memo(BoxesCore);

  return (
    <div className="absolute inset-0 overflow-hidden bg-slate-900">
      <div className="absolute inset-0 z-0">
        <Boxes />
      </div>
      {/* optional mask overlay */}
      <div className="absolute inset-0 bg-slate-900 z-10 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />
    </div>
  );
}
