import React, { useState, useEffect, useRef } from "react";
import { Play, RotateCcw, Target, Brain, Timer, Award } from "lucide-react";

const shapes = [
  { type: "circle", color: "red", isTarget: true },
  { type: "circle", color: "blue", isTarget: false },
  { type: "square", color: "red", isTarget: false },
  { type: "square", color: "blue", isTarget: false },
];

const TOTAL_ROUNDS = 20;
const DISPLAY_TIME = 1000; // ms

export default function ADHDTest2({onComplete}) {
  const [round, setRound] = useState(0);
  const [currentShape, setCurrentShape] = useState(null);
  const [hits, setHits] = useState(0);
  const [falseAlarms, setFalseAlarms] = useState(0);
  const [misses, setMisses] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState("");
  const [finalScore, setFinalScore] = useState(null);
  const [analysis, setAnalysis] = useState(null);


    const timerRef = useRef(null);
    const waitingForClickRef = useRef(false);

    function getRandomShape() {
        return shapes[Math.floor(Math.random() * shapes.length)];
    }

    useEffect(() => {
        return () => clearTimeout(timerRef.current);
    }, []);
    useEffect(() => {
    if (gameOver) {
        calculateFinalScore();
    }
    }, [gameOver]);

function nextRound() {
    if (round >= TOTAL_ROUNDS) {
      setElapsedTime(Date.now() - startTime);
      setCurrentShape(null);
      setGameOver(true);
      setTestStarted(false);
      calculateFinalScore();
      return;
    }

    const shape = getRandomShape();
    setCurrentShape(shape);
    waitingForClickRef.current = true;

    timerRef.current = setTimeout(() => {
      if (waitingForClickRef.current) {
        if (shape.isTarget) {
          setMisses((m) => m + 1);
          showQuickFeedback("miss");
        }
      }
      waitingForClickRef.current = false;
      setRound((r) => r + 1);
    }, DISPLAY_TIME);
  }

  useEffect(() => {
    if (testStarted && round > 0) {
      nextRound();
    }
  }, [round, testStarted]);

  function showQuickFeedback(type) {
    setFeedbackType(type);
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 800);
  }

   function startGame() {
    setRound(1);
    setHits(0);
    setFalseAlarms(0);
    setMisses(0);
    setGameOver(false);
    setElapsedTime(0);
    setTestStarted(true);
    setStartTime(Date.now());
    setShowFeedback(false);
    setFinalScore(null);
  }

  function handleShapeClick() {
    if (!waitingForClickRef.current) return;

    waitingForClickRef.current = false;

    if (currentShape.isTarget) {
      setHits((h) => h + 1);
      showQuickFeedback("hit");
    } else {
      setFalseAlarms((f) => f + 1);
      showQuickFeedback("false");
    }
  }
   function calculateFinalScore() {
  const maxTargets = Math.ceil(TOTAL_ROUNDS / 4);
  const hitScore = hits / maxTargets;
  const penalty = (falseAlarms + misses) / TOTAL_ROUNDS;
  const score = Math.max(0, (hitScore - penalty)) * 100;
  const roundedScore = score.toFixed(1);
  setFinalScore(roundedScore);

  // Set analysis based on score
  if (score >= 80) {
    setAnalysis({
      title: "Excellent Focus! 🌟",
      message: "Your attention and impulse control are working great!",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    });
  } else if (score >= 60) {
    setAnalysis({
      title: "Good Job! 👍",
      message: "You're showing solid attention skills. Keep practicing!",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    });
  } else if (score >= 40) {
    setAnalysis({
      title: "Slow Down & Focus 🎯",
      message: "Try taking a breath before clicking. Quality over speed!",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
    });
  } else {
    setAnalysis({
      title: "Keep Practicing! 💪",
      message: "Attention skills improve with practice. You've got this!",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    });
  }
}
useEffect(() => {
  if (gameOver && finalScore && onComplete) {
    onComplete(parseFloat(finalScore));
  }
}, [gameOver, finalScore]);

  const progress = (round / TOTAL_ROUNDS) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-8 ${testStarted || gameOver ? "hidden" : ""}`}>
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-indigo-100 rounded-full">
              <Brain className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Focus Challenge
            </h1>
          </div>
          <p className="text-gray-600 text-lg">Train your attention and focus skills</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          
          {/* Start Screen */}
          {!testStarted && !gameOver && (
            <div className="text-center space-y-6">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                <Target className="w-12 h-12 text-white" />
              </div>
              
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-800">Ready to Test Your Focus?</h2>
                <div className="bg-gray-50 rounded-2xl p-6 space-y-3">
                  <p className="text-gray-700 font-medium">🎯 Your Mission:</p>
                  <p className="text-gray-600">Click <strong>ONLY</strong> on the <span className="text-red-500 font-bold">RED CIRCLES</span></p>
                  <p className="text-sm text-gray-500">Ignore everything else - stay focused!</p>
                </div>
              </div>

              <button
                onClick={startGame}
                className="group bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-3 mx-auto"
              >
                <Play className="w-6 h-6 group-hover:scale-110 transition-transform" />
                Start Challenge
              </button>
            </div>
          )}

          {/* Game Screen */}
          {testStarted && !gameOver && (
            <div className="space-y-6">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Progress</span>
                  <span className="text-sm font-bold text-indigo-600">
                    {round} / {TOTAL_ROUNDS}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Game Area */}
              <div className="relative">
                <div
                  onClick={handleShapeClick}
                  className="w-80 h-80 mx-auto bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl border-4 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-indigo-300 transition-all duration-200 relative overflow-hidden"
                >
                  {/* Animated Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-50"></div>
                  
                  {/* Shape Display */}
                  {currentShape && (
                    <div className="relative z-10 animate-pulse">
                      {currentShape.type === "circle" ? (
                        <div
                          className="w-32 h-32 rounded-full shadow-2xl transform hover:scale-110 transition-transform duration-200"
                          style={{
                            backgroundColor: currentShape.color,
                            boxShadow: `0 20px 40px ${currentShape.color === 'red' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(59, 130, 246, 0.4)'}`
                          }}
                        />
                      ) : (
                        <div
                          className="w-32 h-32 shadow-2xl transform hover:scale-110 transition-transform duration-200 rounded-lg"
                          style={{
                            backgroundColor: currentShape.color,
                            boxShadow: `0 20px 40px ${currentShape.color === 'red' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(59, 130, 246, 0.4)'}`
                          }}
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Feedback Overlay */}
                {showFeedback && (
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className={`px-6 py-3 rounded-2xl font-bold text-lg shadow-lg animate-bounce ${
                      feedbackType === 'hit' ? 'bg-green-500 text-white' :
                      feedbackType === 'false' ? 'bg-red-500 text-white' :
                      'bg-orange-500 text-white'
                    }`}>
                      {feedbackType === 'hit' ? '✓ Great!' : 
                       feedbackType === 'false' ? '✗ Wrong!' : 
                       '○ Missed!'}
                    </div>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="text-center bg-red-50 border border-red-200 rounded-2xl p-4">
                <p className="text-red-700 font-semibold">
                  🎯 Click ONLY on <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm">RED CIRCLES</span>
                </p>
              </div>

              {/* Live Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center bg-green-50 rounded-xl p-3 border border-green-200">
                  <div className="text-2xl font-bold text-green-600">{hits}</div>
                  <div className="text-xs text-green-700">Correct</div>
                </div>
                <div className="text-center bg-red-50 rounded-xl p-3 border border-red-200">
                  <div className="text-2xl font-bold text-red-600">{falseAlarms}</div>
                  <div className="text-xs text-red-700">Wrong</div>
                </div>
                <div className="text-center bg-orange-50 rounded-xl p-3 border border-orange-200">
                  <div className="text-2xl font-bold text-orange-600">{misses}</div>
                  <div className="text-xs text-orange-700">Missed</div>
                </div>
              </div>
            </div>
          )}

          {/* Results Screen */}
          {gameOver && (
            <div className="text-center space-y-3">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <Award className="w-10 h-10 text-white" />
              </div>

              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Challenge Complete!</h2>
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <Timer className="w-5 h-5" />
                  <span>Time: {(elapsedTime / 1000).toFixed(1)}s</span>
                </div>
              </div>

              {/* Score Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                  <div className="text-3xl font-bold text-green-600 mb-1">{hits}</div>
                  <div className="text-green-700 font-medium">Correct Hits</div>
                  <div className="text-green-600 text-sm">Perfect targets! 🎯</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                  <div className="text-3xl font-bold text-red-600 mb-1">{falseAlarms}</div>
                  <div className="text-red-700 font-medium">False Alarms</div>
                  <div className="text-red-600 text-sm">Slow down next time 🛑</div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
                  <div className="text-3xl font-bold text-orange-600 mb-1">{misses}</div>
                  <div className="text-orange-700 font-medium">Missed Targets</div>
                  <div className="text-orange-600 text-sm">Stay alert! 👁️</div>
                </div>
              </div>
              {/* {finalscore} */}
              {finalScore && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4">
                    <div className="text-2xl font-bold text-indigo-700 mb-1">Score: {finalScore} / 100</div>
                    <div className="text-indigo-600 text-sm">Calculated based on hits, misses, and false alarms.</div>
                </div>
            )}

              {/* Analysis */}
              {analysis && (
                <div className={`${analysis.bgColor} ${analysis.borderColor} border-2 rounded-2xl p-6`}>
                  <h3 className={`text-xl font-bold ${analysis.color} mb-2`}>
                    {analysis.title}
                  </h3>
                  <p className="text-gray-700">{analysis.message}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={startGame}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            💡 Regular practice can help improve focus and attention skills
          </p>
        </div>
      </div>
    </div>
  );
}