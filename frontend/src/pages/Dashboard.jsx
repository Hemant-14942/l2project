import React from "react";
import { useAuth } from "../context/AuthContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const Dashboard = () => {
  const { dashscores } = useAuth();
  console.log("dashscores---->", dashscores);
  

  // Convert dashscores object to chart-friendly data
  const scoreData = Object.entries(dashscores).map(([test, score]) => ({
    name: test,
    score
  }));
  console.log("scoreData--->", scoreData);
  

  // Mocked practice quiz scores (for demo)
  const practiceData = [
    { name: "Quiz 1", score: 70 },
    { name: "Quiz 2", score: 85 },
    { name: "Quiz 3", score: 60 },
    { name: "Quiz 4", score: 90 }
  ];

  const COLORS = ["#6366F1", "#22D3EE", "#F43F5E", "#FACC15"];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <h1 className="text-4xl font-bold mb-6">📊 Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart for Test Scores */}
        <div className="bg-gray-800 rounded-xl p-4 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={scoreData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="name" stroke="#bbb" />
              <YAxis stroke="#bbb" />
              <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none" }} />
              <Bar dataKey="score" fill="#6366F1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart for Practice Quiz */}
        <div className="bg-gray-800 rounded-xl p-4 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Practice Quiz Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={practiceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="name" stroke="#bbb" />
              <YAxis stroke="#bbb" />
              <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none" }} />
              <Line type="monotone" dataKey="score" stroke="#22D3EE" strokeWidth={3} dot={{ fill: "#22D3EE" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart for Overall Distribution */}
        <div className="bg-gray-800 rounded-xl p-4 shadow-lg lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Score Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={scoreData}
                dataKey="score"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label
              >
                {scoreData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
