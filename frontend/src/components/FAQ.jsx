import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  { q: 'What is EduVoice.ai?', a: 'An AI learning companion that turns any content into summaries, flashcards, quizzes & more.' },
  { q: 'Can I try it for free?', a: 'Yes. The Free tier lets you explore core features before upgrading.' },
  { q: 'Which inputs are supported?', a: 'Text, YouTube links, voice recordings, and PDF documents.' },
];

function FAQItem({q,a}) {
  const [open,setOpen]=useState(false);
  return (
    <div className="glass rounded-xl p-4">
      <button
        onClick={()=>setOpen(!open)}
        className="w-full flex items-center justify-between text-left gap-4"
      >
        <span className="text-white font-medium">{q}</span>
        <ChevronDown size={20} className={`transition-transform ${open?'rotate-180':''}`} />
      </button>
      {open && <p className="mt-3 text-slate-300 text-sm">{a}</p>}
    </div>
  );
}

export default function FAQ() {
  return (
    <section className="py-20 bg-gradient-to-b from-[#0B0F19] to-[#0D111F]" id="faq">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gradient text-center mb-12">FAQ</h2>
        <div className="space-y-4">
          {faqs.map(f => <FAQItem key={f.q} {...f} />)}
        </div>
      </div>
    </section>
  );
}