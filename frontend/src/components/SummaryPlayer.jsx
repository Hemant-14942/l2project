import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const summaries = [
  "React makes UI building easier and faster.",
  "Framer Motion adds life to animations with simple code.",
  "Engaging text animations improve user experience."
];

const AnimatedSummary = ({ summary }) => {
  const words = summary.split(" ");
  const [visibleWords, setVisibleWords] = useState(0);
  const wordRefs = useRef([]); // Store refs for each word
  const [handPosition, setHandPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setVisibleWords(0);
    const interval = setInterval(() => {
      setVisibleWords((prev) => {
        const next = prev < words.length ? prev + 1 : prev;
        if (wordRefs.current[next - 1]) {
          const el = wordRefs.current[next - 1];
          const rect = el.getBoundingClientRect();
          setHandPosition({ x: rect.left, y: rect.top });
        }
        return next;
      });
    }, 500); // 0.5 sec per word
    return () => clearInterval(interval);
  }, [summary, words.length]);

  return (
    <div className="relative inline-block">
      {/* Words */}
      {words.slice(0, visibleWords).map((word, i) => (
        <motion.span
          ref={(el) => (wordRefs.current[i] = el)}
          key={i}
          className="inline-block mx-1 text-lg font-semibold"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {word}
        </motion.span>
      ))}

      {/* Hand pointer */}
      {visibleWords < words.length && (
        <motion.span
          className="absolute text-2xl"
          animate={{ x: handPosition.x - 50, y: 40 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          👉
        </motion.span>
      )}
    </div>
  );
};

const SummaryPlayer = () => {
  const [index, setIndex] = useState(0);

  // Switch summaries every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % summaries.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="p-10 text-center">
      <AnimatedSummary summary={summaries[index]} />
    </div>
  );
};

export default SummaryPlayer;
