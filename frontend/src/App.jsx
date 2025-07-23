import React from 'react';
import Navbar from './components/Navbar';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import InputPage from './pages/InputPage';
import Summary from './pages/Summary.jsx';
import TextForm from './components/TextForm.jsx';
import YouTubeForm from './components/YouTubeForm.jsx';
import DocumentForm from './components/DocumentForm.jsx';
import VoiceForm from './components/VoiceForm.jsx';
import { AIVoiceInput } from './components/AIVoiceInput.jsx';
import Chatbot from './components/ChatBot.jsx';

export default function App() {
  return (
    <div className="bg-[#090F22]/90 text-white overflow-x-hidden flex flex-col min-h-screen relative">
      <div className="fixed top-0 left-0 w-full  bg-[#090F22]/90 z-50">
        <Navbar />
      </div>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/input" element={<InputPage />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="/text" element={<TextForm />} />
          <Route path="/youtube" element={<YouTubeForm />} />
          <Route path="/document" element={<DocumentForm />} />
          <Route path="/voice" element={<AIVoiceInput />} />
          <Route  path='/chatbot' element={<Chatbot/>} />
        </Routes>
      </Router>
    </div>
  );
}