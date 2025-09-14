import React, { useState, useEffect } from "react";

const paragraphText = `John loved watching the stars. Every night, he would set up his small telescope on the balcony and search for new constellations. One evening, he noticed a bright moving object. Unsure if it was a comet or a plane, he quickly noted its direction. The next day, he shared it with his science teacher, who confirmed it was a rare meteor. John felt proud of his discovery and started reading more about astronomy.`;

const questions = [
  {
    question: "What did John like doing at night?",
    options: ["Reading", "Watching stars", "Playing games", "Sleeping"],
    answer: "Watching stars",
  },
  {
    question: "What tool did he use?",
    options: ["Microscope", "Telescope", "Binoculars", "Camera"],
    answer: "Telescope",
  },
  {
    question: "What did John see one evening?",
    options: ["A shooting star", "A plane", "A bright moving object", "A comet"],
    answer: "A bright moving object",
  },
  {
    question: "Who did John speak to?",
    options: ["His friend", "His teacher", "His father", "A scientist"],
    answer: "His science teacher",
  },
];

const ReadingTest = ({ onComplete }) => {
  const [step, setStep] = useState("reading");
  const [timeLeft, setTimeLeft] = useState(10);
  const [currentQ, setCurrentQ] = useState(0);
  const [responses, setResponses] = useState([]);
  const [questionTimer, setQuestionTimer] = useState(10);

// ✅ Reading Timer
  useEffect(() => {
    if (step === "reading" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    } else if (step === "reading" && timeLeft === 0) {
      setStep("quiz");
    }
  }, [step, timeLeft]);

// ✅ Question Timer
  useEffect(() => {
    if (step === "quiz" && currentQ < questions.length && questionTimer > 0) {
      const qTimer = setTimeout(() => setQuestionTimer((t) => t - 1), 1000);
      return () => clearTimeout(qTimer);
    } else if (step === "quiz" && questionTimer === 0) {
      recordAnswer(null); // unanswered
    }
  }, [step, questionTimer, currentQ]);


  const recordAnswer = (choice) => {
  const correct = questions[currentQ].answer;
  const newResponse = {
    question: questions[currentQ].question,
    selected: choice,
    correct,
    result:
      choice === null
        ? "unanswered"
        : choice === correct
        ? "correct"
        : "wrong",
  };

  const updatedResponses = [...responses, newResponse];
  setResponses(updatedResponses);
  setQuestionTimer(10);

  // ✅ Use updatedResponses.length to control flow
  if (updatedResponses.length < questions.length) {
    setCurrentQ((i) => i + 1);
  } else {
    setStep("result");
  }
};


  const calculateScore = () => {
    if (responses.length === 0) return 0;
    const correct = responses.filter((r) => r.result === "correct").length;
    // const wrong = responses.filter((r) => r.result === "wrong").length;
    const total = questions.length;
    return Math.max(0, Math.round(((correct ) / total) * 100));
  };
  

  // Result interpretation
  const interpret = () => {
    const unanswered = responses.filter((r) => r.result === "unanswered").length;
    const wrong = responses.filter((r) => r.result === "wrong").length;

    if (unanswered >= 2) return "⚠️ Attention difficulties detected";
    if (wrong >= 2) return "⚠️ Reading comprehension needs improvement";
    return "✅ Excellent performance";
  };

  const getResultColor = () => {
    const score = calculateScore();
    if (score >= 75) return "text-emerald-600";
    if (score >= 50) return "text-amber-600";
    return "text-rose-600";
  };

  const resetTest = () => {
    setStep("reading");
    setTimeLeft(10);
    setCurrentQ(0);
    setResponses([]);
    setQuestionTimer(10);
  };
    useEffect(() => {
    if (step === "result" && onComplete) {
      onComplete(calculateScore());
    }
  }, [step]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-stone-100 p-4">
      <div className="bg-white p-8 md:p-12 max-w-2xl w-full rounded-3xl shadow-2xl border border-gray-100">
        {step === "reading" && (
          <div className="text-center space-y-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">📚 Reading Comprehension Test</h1>
              <div className="flex items-center justify-center space-x-2 text-slate-600">
                <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                <span className="text-sm font-medium">Reading Phase</span>
                <div className="w-2 h-2 bg-slate-200 rounded-full"></div>
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-700">📖 Read Carefully</h2>
                <div className="bg-slate-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                  ⏱️ {timeLeft}s
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-slate-100">
                <p className="text-gray-700 text-left leading-relaxed text-lg">{paragraphText}</p>
              </div>
            </div>
          </div>
        )}

        {step === "quiz" && currentQ < questions.length && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">🧠 Quiz Time</h1>
              <div className="flex items-center justify-center space-x-2 text-slate-600">
                <div className="w-2 h-2 bg-slate-200 rounded-full"></div>
                <span className="text-sm font-medium">Question {currentQ + 1} of {questions.length}</span>
                <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-700">Question {currentQ + 1}</h2>
                <div className="bg-slate-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                  ⏱️ {questionTimer}s
                </div>
              </div>
              
              <p className="text-gray-800 text-lg mb-6 font-medium">{questions[currentQ].question}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {questions[currentQ].options.map((opt, index) => (
                  <button
                    key={opt}
                    onClick={() => recordAnswer(opt)}
                    className="bg-white hover:bg-slate-50 text-gray-700 hover:text-slate-800 border-2 border-slate-200 hover:border-slate-300 rounded-xl py-4 px-6 transition-all duration-200 text-left font-medium shadow-sm hover:shadow-md"
                  >
                    <span className="text-slate-500 font-semibold mr-3">{String.fromCharCode(65 + index)}.</span>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === "result" && (
          <div className="space-y-6 ">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">🎉 Test Complete</h1>
              <div className="flex items-center justify-center space-x-2 text-slate-600">
                <div className="w-2 h-2 bg-slate-200 rounded-full"></div>
                <span className="text-sm font-medium">Results</span>
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 text-center">
              <div className="mb-6">
                <div className={`text-6xl font-bold mb-2 ${getResultColor()}`}>
                  {calculateScore()}%
                </div>
                <p className="text-xl font-semibold text-gray-700">{interpret()}</p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-slate-100">
                <h3 className="font-semibold text-gray-800 mb-4 text-lg">📊 Detailed Results</h3>
                <div className="space-y-3 h-[140px] overflow-y-auto">
                  {responses.map((r, i) => (
                    <div key={i} className="flex items-start justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="text-left flex-1">
                        <p className="font-medium text-gray-700 text-sm mb-1">Q{i + 1}: {r.question}</p>
                        <p className="text-xs text-gray-500">
                          Your answer: <span className="font-medium">{r.selected ?? "No Answer"}</span>
                        </p>
                      </div>
                      <div className="ml-4">
                        {r.result === "correct" && <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">✓ Correct</span>}
                        {r.result === "wrong" && <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs font-semibold">✗ Wrong</span>}
                        {r.result === "unanswered" && <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-semibold">⊘ Missed</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={resetTest}
                className="mt-8 bg-slate-700 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-medium transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                🔄 Take Test Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReadingTest;