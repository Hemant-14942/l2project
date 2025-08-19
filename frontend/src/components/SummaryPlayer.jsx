import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import StarryBackground from "./StarryBackground";
import { useNavigate } from "react-router-dom";
const summaries = [
  "You've learned the key concepts and fundamentals.",
  // "Important topics and examples have been covered.",
  // "Time to test your knowledge and reinforce learning."
];

const AnimatedSummary = ({ summary, isComplete, onComplete }) => {
  const words = summary.split(" ");
  const [visibleWords, setVisibleWords] = useState(0);

  useEffect(() => {
    setVisibleWords(0);
    const interval = setInterval(() => {
      setVisibleWords((prev) => {
        const next = prev < words.length ? prev + 1 : prev;
        if (next === words.length && !isComplete) {
          setTimeout(() => onComplete(), 1000);
        }
        return next;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [summary, words.length, isComplete, onComplete]);

  return (
    <div className="relative">
      <div className="text-center min-h-[60px] flex items-center justify-center">
        <div className="max-w-4xl">
          {words.slice(0, visibleWords).map((word, i) => (
            <motion.span
              key={`${summary}-${i}`}
              className="inline-block mx-1.5 text-xl md:text-2xl font-medium text-gray-200"
              initial={{ scale: 0.5, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                delay: i * 0.1
              }}
            >
              {word}
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  );
};

const SummaryPlayer = () => {
  const [index, setIndex] = useState(0);
  const [allSummariesShown, setAllSummariesShown] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const navigate = useNavigate();

  const handleSummaryComplete = () => {
    if (index === summaries.length - 1) {
      setAllSummariesShown(true);
    }
  };

  const handleQuizSelect = () => {
    setSelectedOption("quiz");
    navigate("/quiz");

  };

  const handleFlashcardSelect = () => {
    setSelectedOption("flashcard");
    navigate("/flashcard");
  };

  const getHeadingText = () => {
    if (selectedOption === "quiz") return "Ready to take the quiz?";
    if (selectedOption === "flashcard") return "Ready for flashcard revision?";
    return "Ready to test your knowledge?";
  };

  const getSubtitleText = () => {
    if (selectedOption === "quiz")
      return "Test your understanding with interactive questions";
    if (selectedOption === "flashcard")
      return "Review key concepts with interactive flashcards";
    return "Choose how you'd like to continue learning";
  };

  const getPrimaryButtonText = () => {
    return "Take Quiz";
  };

  const getSecondaryButtonText = () => {
    return "Flashcard Revision"; // Always stays same
  };

  useEffect(() => {
    if (!allSummariesShown) {
      const timer = setInterval(() => {
        setIndex((prev) => {
          const nextIndex = (prev + 1) % summaries.length;
          if (nextIndex === 0 && prev === summaries.length - 1) {
            setAllSummariesShown(true);
          }
          return nextIndex;
        });
      }, 4500);
      return () => clearInterval(timer);
    }
  }, [allSummariesShown]);

  return (
    <div className="relative flex flex-col items-center justify-center h-[87vh] p-8 z-2">
      <StarryBackground/>
      {/* Main content area */}
      <div className="flex-1 flex items-center justify-center w-full">
        <motion.div
          className="text-center"
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <AnimatedSummary
            summary={summaries[index]}
            isComplete={allSummariesShown}
            onComplete={handleSummaryComplete}
          />
        </motion.div>
      </div>

      {/* Bottom section - appears after all summaries */}
      {allSummariesShown && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-center space-y-6 max-w-2xl"
        >
          <motion.h2
            className="text-2xl md:text-3xl font-semibold text-white mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            key={selectedOption}
          >
            {getHeadingText()}
          </motion.h2>

          <motion.p
            className="text-lg text-gray-400 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
            key={selectedOption + "subtitle"}
          >
            {getSubtitleText()}
          </motion.p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.9 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleQuizSelect}
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-all duration-200 border border-purple-500/20"
            >
              {getPrimaryButtonText()}
            </motion.button>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleFlashcardSelect}
              className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-gray-200 font-medium rounded-lg transition-all duration-200 border border-slate-600/50"
            >
              {getSecondaryButtonText()}
            </motion.button>
          </div>

          {/* Simple progress indicator */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "60%" }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="h-0.5 bg-purple-600/50 rounded-full mt-8 mx-auto"
          />
        </motion.div>
      )}
    </div>
  );
};

export default SummaryPlayer;
