import React from "react";

const FinalResult = ({ scores }) => {
  const scoreValues = Object.values(scores).filter((s) => s !== null);
  const average =
    scoreValues.reduce((acc, val) => acc + val, 0) / scoreValues.length;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-100 text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">📝 Final Report</h1>
      <div className="text-lg text-gray-700 mb-6">
        Here's how you performed across all the tests:
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 mb-6">
        {Object.entries(scores).map(([test, score]) => (
          <div
            key={test}
            className="bg-white rounded-xl shadow-md p-6 border border-gray-200"
          >
            <h3 className="font-semibold text-gray-800 capitalize mb-2">
              {test} Test
            </h3>
            <p className="text-2xl font-bold text-indigo-600">{score}%</p>
          </div>
        ))}
      </div>

      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-4">
        <h2 className="text-xl font-semibold text-indigo-700 mb-2">Average Score</h2>
        <p className="text-3xl font-bold text-indigo-800">{average.toFixed(1)}%</p>
      </div>

      <p className="text-gray-600 text-sm">
        This score gives an indication of overall attention and literacy skills.
      </p>
        <a href="/">
          <button className="mt-4 bg-indigo-600 text-white font-bold py-2 px-4 rounded hover:bg-indigo-700">
            Back to Home
          </button>
        </a>
    </div>
  );
};

export default FinalResult;
