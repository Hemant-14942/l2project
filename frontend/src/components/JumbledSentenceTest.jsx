import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, CheckCircle, RotateCcw } from "lucide-react";

const questions = [
  {
    id: 1,
    correctSentence: "The sun rises in the east",
    jumbledWords: ["rises", "The", "in", "sun", "east", "the"],
  },
  {
    id: 2,
    correctSentence: "She is reading a book",
    jumbledWords: ["book", "reading", "is", "She", "a"],
  },
  {
    id: 3,
    correctSentence: "I love learning new things",
    jumbledWords: ["new", "things", "learning", "I", "love"],
  },
  {
    id: 4,
    correctSentence: "He plays football every evening",
    jumbledWords: ["evening", "He", "football", "plays", "every"],
  },
  {
    id: 5,
    correctSentence: "Birds fly in the sky",
    jumbledWords: ["the", "Birds", "sky", "in", "fly"],
  },
];


const JumbledSentenceTest = ({ onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedWords, setSelectedWords] = useState([]);
  const [remainingWords, setRemainingWords] = useState(questions[0].jumbledWords);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  const handleWordClick = (word, source) => {
    if (isAnimating) return;
    if (source === "remaining") {
      setRemainingWords((prev) => prev.filter((w) => w !== word));
      setSelectedWords((prev) => [...prev, word]);
    } else {
      setSelectedWords((prev) => prev.filter((w) => w !== word));
      setRemainingWords((prev) => [...prev, word]);
    }
  };

  const checkAnswer = () => {
    setIsAnimating(true);
    const userAnswer = selectedWords.join(" ");
    const correctAnswer = questions[currentQuestionIndex].correctSentence.toLowerCase();
    if (userAnswer.toLowerCase() === correctAnswer) {
      setScore((prev) => prev + 1);
    }

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        setSelectedWords([]);
        setRemainingWords(questions[nextIndex].jumbledWords);
      } else {
        setShowScore(true);
      }
      setIsAnimating(false);
    }, 800);
  };

  // const restartTest = () => {
  //   setCurrentQuestionIndex(0);
  //   setSelectedWords([]);
  //   setRemainingWords(questions[0].jumbledWords);
  //   setScore(0);
  //   setShowScore(false);
  //   setIsStarted(false);
  // };

  const startTest = () => {
    setIsStarted(true);
  };
  useEffect(() => {
  if (showScore && onComplete) {
    const percentage = (score / questions.length) * 100;
    onComplete(percentage);
  }
}, [showScore]);

  const getScoreMessage = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage === 100) return "Excellent work!";
    if (percentage >= 70) return "Good job!";
    if (percentage >= 50) return "Nice try!";
    return "Keep practicing!";
  };

  if (!isStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
          <Brain className="w-14 h-14 mx-auto text-blue-600 mb-4" />
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">Jumbled Sentence Practice</h1>
          <p className="text-gray-500 mb-4">Arrange the words to form a meaningful sentence.</p>
          <button
            onClick={startTest}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            Start Test
          </button>
        </div>
      </div>
    );
  }

  if (showScore) {
    const percentage = (score / questions.length) * 100;

    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-md p-8 max-w-lg w-full text-center">
          <CheckCircle className="w-12 h-12 mx-auto text-green-600 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Test Completed</h2>
          <p className="text-gray-600 mb-4">{getScoreMessage()}</p>

          <div className="mb-6">
            <div className="text-sm text-gray-500 mb-1">Your Score</div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-green-500 h-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            <div className="text-lg mt-2 font-semibold text-blue-700">
              {score} / {questions.length} ({percentage.toFixed(0)}%)
            </div>
          </div>

            {/* <button
              onClick={restartTest}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              Restart Test
            </button> */}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center ">
      <div className="bg-white rounded-xl shadow-md p-8 max-w-2xl w-full">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-gray-700">
            Question {currentQuestionIndex + 1} of {questions.length}
          </h2>
          <p className="text-gray-500">Rearrange the words below:</p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center bg-gray-100 p-4 rounded-lg border border-gray-200 mb-4">
          {remainingWords.map((word, index) => (
            <motion.button
              key={`remaining-${index}`}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg shadow-sm hover:bg-gray-300 transition"
              onClick={() => handleWordClick(word, "remaining")}
            >
              {word}
            </motion.button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 justify-center min-h-[48px] p-4 border-2 border-dashed border-blue-300 bg-blue-50 rounded-lg mb-4">
          {selectedWords.map((word, index) => (
            <motion.button
              key={`selected-${index}`}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition"
              onClick={() => handleWordClick(word, "selected")}
            >
              {word}
            </motion.button>
          ))}
        </div>

        <button
            onClick={checkAnswer}
            disabled={isAnimating || remainingWords.length > 0}
            className={`mt-4 w-full px-6 py-3 rounded-lg text-white font-medium transition ${
              isAnimating || remainingWords.length > 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isAnimating ? "Checking..." : "Submit Answer"}
      </button>
      </div>
    </div>
  );
};

export default JumbledSentenceTest;
