import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

import { Link } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);
  const MotionLink = motion(Link);

  return (
    <div className="flex justify-center w-full mt-7  bg-transparent">
      <div className="flex items-center justify-between px-6 py-3 bg-slate-900/90 rounded-full shadow-lg w-full max-w-4xl relative z-10 border border-slate-700">
        {/* Logo */}
        <motion.div
          className="flex items-center cursor-pointer"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          whileHover={{ rotate: 5 }}
          transition={{ duration: 0.3 }}
        >
          <img src="/spheric-vortex-of-pastel-light-loader.gif" alt="" className="w-10" />
          <span className="ml-3 font-bold text-white text-lg">EduVoice.ai</span>
        </motion.div>

        {/* Desktop Nav */}
       <nav className="hidden md:flex items-center space-x-8">
  {["Home", "Features", "Pricing", "FAQ","MotivAI"].map((item) => (
    <MotionLink
      key={item}
      to={`/${item.toLowerCase()}`}
      className="text-sm text-slate-200 hover:text-white transition-colors font-medium"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      whileHover={{ scale: 1.05 }}
    >
      {item}
    </MotionLink>
  ))}
</nav>

        {/* Desktop CTA */}
        <motion.div
          className="hidden md:block"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
        >
          <a
            href="#"
            className="inline-flex items-center justify-center px-5 py-2 text-sm text-white bg-[#6D28D9] rounded-full hover:bg-[#A855F7] transition-colors"
          >
            Get Started
          </a>
        </motion.div>

        {/* Mobile Toggle */}
        <motion.button
          className="md:hidden flex items-center"
          onClick={toggleMenu}
          whileTap={{ scale: 0.9 }}
        >
          <Menu className="h-6 w-6 text-white" />
        </motion.button>
      </div>

<motion.div>      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-slate-900 z-50 pt-24 px-6 md:hidden"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <motion.button
              className="absolute top-6 right-6 p-2"
              onClick={toggleMenu}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <X className="h-6 w-6 text-white" />
            </motion.button>

            <div className="flex flex-col space-y-6">
              {["Home", "Features", "Pricing", "FAQ", "MotivAI"].map((item, i) => (
                <MotionLink
                  key={item}
                   to={`/${item.toLowerCase()}`}
                  className="text-base text-slate-200 font-medium"
                  onClick={toggleMenu}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 + 0.1 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  {item}
                </MotionLink>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                exit={{ opacity: 0, y: 20 }}
                className="pt-6"
              >
                <a
                  href="#"
                  className="inline-flex items-center justify-center w-full px-5 py-3 text-base text-white bg-indigo-600 rounded-full hover:bg-indigo-500 transition-colors"
                  onClick={toggleMenu}
                >
                  Get Started
                </a>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Navbar;
