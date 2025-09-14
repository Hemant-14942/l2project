import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import InputPage from './pages/InputPage';
import Summary from './pages/Summary.jsx';
import TextForm from './components/TextForm.jsx';
import YouTubeForm from './components/YouTubeForm.jsx';
import DocumentForm from './components/DocumentForm.jsx';
import AIVoiceInput from './components/AIVoiceInput.jsx';
import Chatbot from './components/ChatBot.jsx';
import MotivAI from './pages/MotivAI.jsx';
import { useAuth } from './context/AuthContext.jsx';
import LoginSignupPage from './components/LoginSignupPage.jsx';
import SummaryPlayer from './components/SummaryPlayer.jsx';
import Quiz from "./components/Quiz.jsx";
import FlashCards from "./components/FlashCards.jsx";
import TestInstructions from './pages/TestInstructions.jsx';
import TestSequence from './pages/TestSequence.jsx';

function AppContent() {
  const location = useLocation();
  // const { hideNavbar } = useAuth();
  const hideNavbarRoutes = ['/motivai','/login','/text','/youtube','/document','/voice',"/TestSequence",'/TestInstructions'];

  const shouldHideNavbarByPath = hideNavbarRoutes.includes(location.pathname);

  const shouldHideNavbar = shouldHideNavbarByPath;

  return (
    <div className="bg-[#090F22]/90 text-white overflow-x-hidden flex flex-col min-h-screen relative">
      {!shouldHideNavbar && (
        <div className="fixed top-0 left-0 w-full bg-[#090F22]/90 z-50">
          <Navbar />
        </div>
      )}
      <div className={!shouldHideNavbar ? "mt-23" : "mt-0"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/motivai" element={<MotivAI />} />
          <Route path="/about" element={<About />} />
          <Route path="/input" element={<InputPage />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="/text" element={<TextForm />} />
          <Route path="/youtube" element={<YouTubeForm />} />
          <Route path="/document" element={<DocumentForm />} />
          <Route path="/voice" element={<AIVoiceInput />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/flashcard" element={<FlashCards />} />
          <Route path="/SummaryPlayer" element={<SummaryPlayer />} />
          <Route path="/login" element={<LoginSignupPage />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/testInstructions" element={<TestInstructions />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/test" element={<Navigate to="/testInstructions" replace />} />
          <Route path="/testSequence" element={<TestSequence />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
