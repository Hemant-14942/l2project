import React from 'react';
import { Twitter, Linkedin, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 py-8 text-center text-slate-400">
      <p className="mb-4">&copy; {new Date().getFullYear()} EduVoice.ai – All rights reserved.</p>
      <div className="flex justify-center gap-6">
        <Twitter className="hover:text-white cursor-pointer" />
        <Linkedin className="hover:text-white cursor-pointer" />
        <Mail className="hover:text-white cursor-pointer" />
      </div>
    </footer>
  );
}