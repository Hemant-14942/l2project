import React, { useState ,useEffect} from 'react';
import { Eye, CheckCircle, XCircle, Target, Trophy, RotateCcw, BookOpen } from 'lucide-react';

const paragraphData = [
  {
    id: 1,
    text: [
      { word: 'I', correct: true },
      { word: 'receeve', correct: false },
      { word: 'the', correct: true },
      { word: 'package', correct: true },
      { word: 'on', correct: true },
      { word: 'tyme.', correct: false },
    ]
  },
  {
    id: 2,
    text: [
      { word: 'She', correct: true },
      { word: 'wrotes', correct: false },
      { word: 'a', correct: true },
      { word: 'beautifull', correct: false },
      { word: 'letter', correct: true },
      { word: 'yesterday.', correct: true },
    ]
  },
  {
    id: 3,
    text: [
      { word: 'The', correct: true },
      { word: 'childern', correct: false },
      { word: 'are', correct: true },
      { word: 'playing', correct: true },
      { word: 'in', correct: true },
      { word: 'the', correct: true },
      { word: 'gardden.', correct: false },
    ]
  },
  {
    id: 4,
    text: [
      { word: 'We', correct: true },
      { word: 'beleive', correct: false },
      { word: 'that', correct: true },
      { word: 'education', correct: true },
      { word: 'is', correct: true },
      { word: 'importent', correct: false },
      { word: 'for', correct: true },
      { word: 'everyone.', correct: true },
    ]
  },
  {
    id: 5,
    text: [
      { word: 'My', correct: true },
      { word: 'freind', correct: false },
      { word: 'loves', correct: true },
      { word: 'to', correct: true },
      { word: 'read', correct: true },
      { word: 'intresting', correct: false },
      { word: 'books.', correct: true },
    ]
  }
];

export default function WrongWordDetectTest({ onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selected, setSelected] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [scores, setScores] = useState([]);
  const [started, setStarted] = useState(false);

  const toggleWord = (paraId, index) => {
    if (submitted) return;
    const key = `${paraId}-${index}`;
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const calculateScore = () => {
  const para = paragraphData[currentQuestion];
  let correct = 0;
  let total = para.text.length;

  // Check if the user selected any words for this question
  let hasAttempted = false;
  para.text.forEach((wordObj, idx) => {
    const key = `${para.id}-${idx}`;
    if (selected[key]) {
      hasAttempted = true;
    }
  });

  if (!hasAttempted) {
    return 0; // No attempt, no score
  }

  para.text.forEach((wordObj, idx) => {
    const key = `${para.id}-${idx}`;
    const isSelected = selected[key];
    const isIncorrect = !wordObj.correct;

    if (isIncorrect && isSelected) {
      // ✅ User correctly selected a wrong word
      correct++;
    } else if (isIncorrect && !isSelected) {
      // ❌ User missed an incorrect word
      correct--; // Penalty
    } else if (wordObj.correct && isSelected) {
      // ❌ User selected a correct word
      correct--; // Penalty
    } else if (wordObj.correct && !isSelected) {
      // ✅ User correctly ignored a correct word
      correct++;
    }
  });

  // Normalize the score to a percentage between 0–100
  if(correct<=0){
    return 0;
  }
  else{

    return Math.max(0, Math.round((correct / total) * 100));
  }
};

  const handleSubmit = () => {
    const score = calculateScore();
    setScores([...scores, score]);
    setSubmitted(true);
  };

  const nextQuestion = () => {
    if (currentQuestion < paragraphData.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelected({});
      setSubmitted(false);
    } else {
      setShowResult(true);
    }
  };

  const restartTest = () => {
    setCurrentQuestion(0);
    setSelected({});
    setSubmitted(false);
    setShowResult(false);
    setScores([]);
    setStarted(false);
  };

  const getTotalScore = () => {
    return Math.round(scores.reduce((acc, score) => acc + score, 0) / scores.length);
  };
  useEffect(() => {
  if (showResult && onComplete) {
    onComplete(getTotalScore());
  }
}, [showResult]);

  const getScoreMessage = (score) => {
    if (score >= 90) return { message: "Excellent! Perfect eye for detail! 🌟", color: "text-green-600" };
    if (score >= 75) return { message: "Great job! Well done! 🎉", color: "text-blue-600" };
    if (score >= 60) return { message: "Good effort! Keep practicing! 👍", color: "text-yellow-600" };
    return { message: "Keep trying! You'll get better! 💪", color: "text-red-600" };
  };

  if (!started) {
    return (
      <div className="min-h-screen bg-slate-300 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-md w-full text-center transform hover:scale-105 transition-all duration-300">
          <div className="mb-6">
            <Eye className="w-16 h-16 mx-auto text-emerald-600 mb-4 animate-pulse" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Spot the Errors
            </h1>
            <p className="text-gray-600 text-sm">
              Find and highlight the incorrectly spelled words
            </p>
          </div>
          
          <div className="mb-6 p-4 bg-emerald-50 rounded-xl">
            <BookOpen className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
            <p className="text-emerald-800 font-medium">
              {paragraphData.length} sentences to review
            </p>
            <p className="text-emerald-700 text-sm mt-1">
              Click on words you think are misspelled
            </p>
          </div>

          <button
            onClick={() => setStarted(true)}
            className="group bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-8 py-4 rounded-2xl hover:from-emerald-600 hover:to-blue-600 transform hover:scale-110 transition-all duration-300 shadow-lg font-semibold text-lg flex items-center justify-center gap-2 w-full"
          >
            <Target className="w-5 h-5 group-hover:animate-pulse" />
            Start Challenge
          </button>
        </div>
      </div>
    );
  }

  if (showResult) {
    const totalScore = getTotalScore();
    const scoreInfo = getScoreMessage(totalScore);
    
    return (
      <div className="min-h-screen bg-slate-300 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-2xl w-full text-center">
          <div className="mb-6">
            <Trophy className="w-20 h-20 mx-auto text-yellow-500 mb-4 animate-bounce" />
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Challenge Complete!</h2>
            <p className="text-gray-600">Here's how you performed</p>
          </div>

          <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
            <div className="text-6xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {totalScore}%
            </div>
            <div className="text-2xl text-gray-600 mb-2">Overall Score</div>
            <p className={`text-xl font-semibold ${scoreInfo.color} mb-4`}>
              {scoreInfo.message}
            </p>
          </div>

          <div className="mb-8 grid grid-cols-5 gap-2">
            {scores.map((score, index) => (
              <div key={index} className="bg-white rounded-lg p-3 border">
                <div className="text-xs text-gray-500 mb-1">Q{index + 1}</div>
                <div className={`text-lg font-bold ${score >= 75 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {score}%
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={restartTest}
            className="group bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-2xl hover:from-purple-600 hover:to-pink-600 transform hover:scale-110 transition-all duration-300 shadow-lg font-semibold text-lg flex items-center justify-center gap-2 w-full"
          >
            <RotateCcw className="w-5 h-5 group-hover:animate-spin" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const para = paragraphData[currentQuestion];
  const incorrectWordsCount = para.text.filter(w => !w.correct).length;

  return (
    <div className="min-h-screen bg-slate-300 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Spot the Spelling Errors
            </h1>
            <div className="flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full">
              <Eye className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-gray-700">
                Question {currentQuestion + 1} of {paragraphData.length}
              </span>
            </div>
          </div>
          
          <div className="flex justify-center mb-4">
            <div className="flex gap-2">
              {paragraphData.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index < currentQuestion
                      ? "bg-green-500"
                      : index === currentQuestion
                      ? "bg-blue-500 scale-125"
                      : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-4">
            <p className="text-lg font-medium text-gray-700 text-center">
              Click on words that you think are spelled incorrectly
            </p>
            <p className="text-sm text-gray-600 text-center mt-1">
              There are {incorrectWordsCount} incorrect words in this sentence
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
          <div className="mb-8">
            <div className="text-2xl leading-relaxed text-center p-6 whitespace-nowrap bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border-2 border-dashed border-gray-300">
              {para.text.map((wordObj, idx) => {
                const key = `${para.id}-${idx}`;
                const isSelected = selected[key];
                const isIncorrect = !wordObj.correct;

                let wordStyle = 'cursor-pointer px-3 py-2 rounded-xl mx-1 transition-all duration-200 inline-block font-medium';
                
                if (submitted) {
                  if (isSelected && isIncorrect) {
                    wordStyle += ' bg-green-200 border-2 border-green-400 text-green-800 transform scale-110';
                  } else if (isSelected && wordObj.correct) {
                    wordStyle += ' bg-red-200 border-2 border-red-400 text-red-800 transform scale-110';
                  } else if (!isSelected && isIncorrect) {
                    wordStyle += ' bg-yellow-200 border-2 border-yellow-400 text-yellow-800 underline decoration-wavy decoration-red-500';
                  } else {
                    wordStyle += ' text-gray-700';
                  }
                } else {
                  if (isSelected) {
                    wordStyle += ' bg-gradient-to-r from-blue-200 to-purple-200 border-2 border-blue-400 text-blue-800 transform scale-110 shadow-lg';
                  } else {
                    wordStyle += ' hover:bg-gradient-to-r hover:from-gray-100 hover:to-blue-100 hover:scale-105 text-gray-700 border-2 border-transparent';
                  }
                }

                return (
                  <span
                    key={key}
                    className={wordStyle}
                    onClick={() => toggleWord(para.id, idx)}
                  >
                    {wordObj.word}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="text-center space-y-4">
            {!submitted ? (
              <button
                onClick={handleSubmit}
                className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-8 py-4 rounded-2xl hover:from-emerald-600 hover:to-blue-600 transform hover:scale-110 transition-all duration-300 shadow-lg font-semibold text-lg"
              >
                Submit Answer
              </button>
            ) : (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <span className="text-xl font-bold text-green-800">
                      Score: {calculateScore()}%
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="inline-block w-4 h-4 bg-green-200 border border-green-400 rounded mr-2"></span>Correctly identified errors</p>
                    <p><span className="inline-block w-4 h-4 bg-red-200 border border-red-400 rounded mr-2"></span>Incorrectly selected words</p>
                    <p><span className="inline-block w-4 h-4 bg-yellow-200 border border-yellow-400 rounded mr-2"></span>Missed errors</p>
                  </div>
                </div>
                
                <button
                  onClick={nextQuestion}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-2xl hover:from-purple-600 hover:to-pink-600 transform hover:scale-110 transition-all duration-300 shadow-lg font-semibold text-lg"
                >
                  {currentQuestion < paragraphData.length - 1 ? 'Next Question' : 'View Results'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}