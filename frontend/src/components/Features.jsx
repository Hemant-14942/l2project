"use client";

import React from "react";
import { motion } from "framer-motion";
import { FileInput, BookOpen, Layers, Brain } from "lucide-react";


const features = [
  {
    title: "Multi-Input Support",
    description: "Provide YouTube links, text, PDFs, or voice input for AI-powered analysis.",
    icon: <FileInput className="h-10 w-10 text-purple" />,
  },
  {
    title: "AI Summarization & Explanation",
    description: "Get instant summaries and detailed AI-powered explanations.",
    icon: <BookOpen className="h-10 w-10 text-purple" />,
  },
  {
    title: "Three Learning Modes",
    description: "Basic, Medium, and Story-based High mode for in-depth understanding.",
    icon: <Layers className="h-10 w-10 text-purple" />,
  },
  {
    title: "AI Coach & Quiz Assistant",
    description: "Learn with flashcards, Q&A sessions, and AI-generated quizzes.",
    icon: <Brain className="h-10 w-10 text-purple" />,
  },
];

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    transition: { delay: index * 0.2 },
  }),
};

const Features = () => {
  return (
    <section className="py-20 h-[90vh] bg-gradient-to-b from-[#0B0F19] to-[#0D111F]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Heading */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, amount: 0.4 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Our <span className="text-purple">Services</span>
          </h2>
          <motion.p
            className="mt-4 text-gray-400 max-w-2xl mx-auto text-lg"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
          >
            EduVoice.AI delivers next-level learning experiences with multi-format input, AI-powered explanations, and smart quizzes.
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="bg-[#131A2A] rounded-2xl p-6 shadow-lg hover:shadow-indigo-500/20 border border-gray-800 transition-transform hover:scale-105"
              custom={index}
              initial="hidden"
              whileInView="visible"
              variants={cardVariants}
              viewport={{ once: true, amount: 0.2 }}
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
