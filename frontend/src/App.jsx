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

function AppContent() {
  const location = useLocation();
  const { hideNavbar } = useAuth();
  const hideNavbarRoutes = ['/motivai','/login'];

  const shouldHideNavbarByPath = hideNavbarRoutes.includes(location.pathname);

  const shouldHideNavbar = hideNavbar || shouldHideNavbarByPath;

  return (
    <div className="bg-[#090F22]/90 text-white overflow-x-hidden flex flex-col min-h-screen relative">
      {!shouldHideNavbar && (
        <div className="fixed top-0 left-0 w-full bg-[#090F22]/90 z-50">
          <Navbar />
        </div>
      )}
      <div className={!shouldHideNavbar ? 'mt-23' : 'mt-5'}>
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
          <Route path='/login' element={<LoginSignupPage/>}/>
          <Route path="/chatbot" element={<Chatbot />} />
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
