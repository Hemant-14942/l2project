import React from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import Features from '../components/Features.jsx';
import { ParticleTextEffect } from '../components/ParticleTextEffect.jsx';
import FAQ from '../components/FAQ.jsx';
import EduVoiceHeroHero from '../components/EduVoiceHero.jsx';

export default function Home() {
  return (
    <div className="flex flex-col text-slate-200 overflow-x-hidden relative">
      <main className="flex-1 pt-23">
                <EduVoiceHeroHero />
                <Features />
                <ParticleTextEffect />
                <FAQ />
                <Footer />
      </main>
    </div>
  );
}