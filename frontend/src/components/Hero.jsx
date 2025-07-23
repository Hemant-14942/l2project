import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import EduVoiceHero from './EduVoiceHero';

export default function Hero() {
  return (
     <EduVoiceHero title="eduvoice.ai" />
    // <header id="top" className="pt-32 pb-20 text-center bg-gradient-to-b from-slate-900 to-slate-800">
    //   <motion.h1
    //     initial={{opacity:0, y:20}}
    //     animate={{opacity:1, y:0}}
    //     transition={{duration:0.6}}
    //     className="text-4xl md:text-6xl font-bold text-gradient mb-6"
    //   >
    //     Your AI Study Coach
    //   </motion.h1>
    //   <motion.p
    //     initial={{opacity:0}}
    //     animate={{opacity:1}}
    //     transition={{delay:0.3, duration:0.6}}
    //     className="text-slate-300 max-w-2xl mx-auto mb-8"
    //   >
    //     Turn text, YouTube links, voice notes, and PDFs into story summaries, flashcards, quizzes, and mind maps.
    //   </motion.p>
    //   <motion.a
    //     whileHover={{scale:1.05}}
    //     href="#features"
    //     className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-xl text-white font-medium"
    //   >
    //     Get Started <ArrowRight size={20} />
    //   </motion.a>
    // </header>
  );
}