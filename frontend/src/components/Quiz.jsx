import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axiosInstance';
import BackgroundBoxesDemo from './BackgroundBoxesDemo';
import { motion, AnimatePresence } from "framer-motion";

const Quiz = () => {
  const { basicSummary } = useAuth();
  const [quizData, setQuizData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [quizStarted, setQuizStarted] = useState(false);

  useEffect(()=>{
    console.log("basicSummary?.basic", basicSummary?.basic);
  },[basicSummary]);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const resp = await axios.post("/api/quiz/generate", {
          content: basicSummary?.basic || "The quick brown fox jumps over the lazy dog.",
          difficulty: "easy",
          user_id: "user123"
        });
        setQuizData(resp.data);
      } catch (error) {
        console.error("❌ Error generating quiz:", error);
      }
    };

    if (basicSummary?.basic) fetchQuiz();
  }, [basicSummary]);

  useEffect(() => {
    if (quizStarted && timeLeft > 0 && !showResults && !showExplanation) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showExplanation) {
      handleTimeUp();
    }
  }, [timeLeft, quizStarted, showResults, showExplanation]);

  const handleTimeUp = () => {
    setSelectedOption(null);
    setShowExplanation(true);
    setTimeout(() => {
      handleNextQuestion();
    }, 3000);
  };

  const handleOptionClick = (selectedIndex) => {
    if (selectedOption !== null) return;
    
    setSelectedOption(selectedIndex);
    setShowExplanation(true);
    
    setTimeout(() => {
      handleNextQuestion();
    }, 3000);
  };

  const handleNextQuestion = () => {
    const updatedAnswers = [...userAnswers, selectedOption];
    
    if (currentQuestionIndex + 1 < quizData.questions.length) {
      setUserAnswers(updatedAnswers);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setShowExplanation(false);
      setTimeLeft(30);
    } else {
      setUserAnswers(updatedAnswers);
      setShowResults(true);
    }
  };

  const calculateScore = () => {
    return quizData.questions.reduce((score, q, i) => {
      return q.correct_answer === userAnswers[i] ? score + 1 : score;
    }, 0);
  };

  const getScoreMessage = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage >= 90) return { message: "Outstanding! 🏆", color: "text-yellow-400" };
    if (percentage >= 80) return { message: "Excellent work! 🌟", color: "text-green-400" };
    if (percentage >= 70) return { message: "Good job! 👍", color: "text-blue-400" };
    if (percentage >= 60) return { message: "Nice effort! 💪", color: "text-purple-400" };
    return { message: "Keep practicing! 📚", color: "text-gray-400" };
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setShowResults(false);
    setSelectedOption(null);
    setShowExplanation(false);
    setTimeLeft(30);
    setQuizStarted(false);
  };

  if (!quizData) {
    return (
      <div className="min-h-screen  flex items-center justify-center z-2">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Generating your personalized quiz...</p>
          <p className="text-gray-400 mt-2">This may take a few moments</p>
        </div>
      </div>
    );
  }

  if (!quizStarted) {
  return (
    <div className="min-h-screen relative flex items-center justify-center p-6">
      {/* Background layer with fade-out */}
      <AnimatePresence>
        {!quizStarted && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <BackgroundBoxesDemo />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Foreground content */}
      <div className="relative z-20 max-w-2xl mx-auto text-center rounded-2xl p-8 border border-gray-800 bg-black/40 backdrop-blur-sm">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-white mb-4">🧠 Knowledge Quiz</h1>
          <p className="text-gray-300 text-lg">
            Test your understanding with {quizData.total_questions} engaging questions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* info boxes here */}
        </div>

        <button
          onClick={() => setQuizStarted(true)}
          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25"
        >
          Start Quiz 🚀
        </button>
      </div>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D0D0D] via-[#1a1a2e] to-[#16213e] p-6">
      {!showResults ? (
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-[#1F1F1F]/80 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-gray-800">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-4">
                <h2 className="text-2xl font-bold text-white">
                  Question {currentQuestionIndex + 1}
                </h2>
                <span className="text-gray-400">of {quizData.total_questions}</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
                  timeLeft <= 10 ? 'bg-red-500/20 border border-red-500/30' : 'bg-purple-500/20 border border-purple-500/30'
                }`}>
                  <span className="text-xl">⏱️</span>
                  <span className={`font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-white'}`}>
                    {timeLeft}s
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / quizData.total_questions) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-[#1F1F1F]/80 backdrop-blur-lg rounded-2xl p-8 border border-gray-800">
            <h3 className="text-2xl font-semibold text-white mb-8 leading-relaxed">
              {quizData.questions[currentQuestionIndex].question}
            </h3>
            
            <div className="grid gap-4">
              {quizData.questions[currentQuestionIndex].options.map((option, index) => {
                const isSelected = selectedOption === index;
                const isCorrect = index === quizData.questions[currentQuestionIndex].correct_answer;
                
                let buttonClass = "w-full text-left py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] border-2 ";
                
                if (!showExplanation) {
                  buttonClass += isSelected 
                    ? "bg-purple-600/30 border-purple-500 text-white shadow-lg shadow-purple-500/20" 
                    : "bg-[#2A2A2A] hover:bg-[#333] border-gray-600 text-gray-300 hover:border-gray-500";
                } else {
                  if (isCorrect) {
                    buttonClass += "bg-green-600/30 border-green-500 text-white shadow-lg shadow-green-500/20";
                  } else if (isSelected && !isCorrect) {
                    buttonClass += "bg-red-600/30 border-red-500 text-white shadow-lg shadow-red-500/20";
                  } else {
                    buttonClass += "bg-[#2A2A2A] border-gray-600 text-gray-400";
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleOptionClick(index)}
                    disabled={showExplanation}
                    className={buttonClass}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg">{option}</span>
                      {showExplanation && (
                        <span className="text-2xl">
                          {isCorrect ? '✅' : isSelected ? '❌' : ''}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {showExplanation && (
              <div className="mt-8 p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <h4 className="text-lg font-semibold text-blue-300 mb-2">💡 Explanation</h4>
                <p className="text-gray-300 leading-relaxed">
                  {quizData.questions[currentQuestionIndex].explanation}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          {/* Results Header */}
          <div className="text-center mb-8">
            <div className="bg-[#1F1F1F]/80 backdrop-blur-lg rounded-2xl p-8 border border-gray-800">
              <h2 className="text-4xl font-bold text-white mb-4">🎉 Quiz Complete!</h2>
              <div className="text-6xl mb-4">
                {(() => {
                  const score = calculateScore();
                  const percentage = (score / quizData.total_questions) * 100;
                  if (percentage >= 90) return '🏆';
                  if (percentage >= 80) return '🌟';
                  if (percentage >= 70) return '👍';
                  if (percentage >= 60) return '💪';
                  return '📚';
                })()}
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {calculateScore()} / {quizData.total_questions}
              </div>
              <div className={`text-xl ${getScoreMessage(calculateScore(), quizData.total_questions).color}`}>
                {getScoreMessage(calculateScore(), quizData.total_questions).message}
              </div>
              <div className="mt-6">
                <button
                  onClick={restartQuiz}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  Take Quiz Again 🔄
                </button>
              </div>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="space-y-6">
            {quizData.questions.map((q, i) => {
              const userAnswer = userAnswers[i];
              const isCorrect = userAnswer === q.correct_answer;

              return (
                <div key={i} className="bg-[#1F1F1F]/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-800">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold text-white text-lg flex-1 pr-4">
                      Q{i + 1}: {q.question}
                    </h3>
                    <div className={`text-2xl ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                      {isCorrect ? '✅' : '❌'}
                    </div>
                  </div>
                  
                  <div className="grid gap-3 mb-4">
                    {q.options.map((opt, j) => {
                      const isSelected = j === userAnswer;
                      const isRight = j === q.correct_answer;

                      let optionClass = "p-3 rounded-lg border ";
                      
                      if (isRight) {
                        optionClass += "bg-green-600/20 border-green-500/50 text-green-100";
                      } else if (isSelected && !isRight) {
                        optionClass += "bg-red-600/20 border-red-500/50 text-red-100";
                      } else {
                        optionClass += "bg-[#2A2A2A] border-gray-600 text-gray-400";
                      }

                      return (
                        <div key={j} className={optionClass}>
                          <div className="flex items-center justify-between">
                            <span>{opt}</span>
                            <span className="text-lg">
                              {isRight ? '✅' : isSelected && !isRight ? '❌' : ''}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <h4 className="text-blue-300 font-medium mb-2">💡 Explanation:</h4>
                    <p className="text-gray-300 text-sm leading-relaxed">{q.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Quiz;