"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "./../components/Button.jsx"; // Make sure this exists (JSX)
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
// ─────────────────────────────────────────────────────────────
// Geometric Grid Paths
// ─────────────────────────────────────────────────────────────
function GeometricPaths() {
  const gridSize = 40;
  const paths = [];
  for (let x = 0; x < 20; x++) {
    for (let y = 0; y < 12; y++) {
      if (Math.random() > 0.7) {
        paths.push({
          id: `grid-${x}-${y}`,
          d: `M${x * gridSize},${y * gridSize} L${(x + 1) * gridSize},${
            y * gridSize
          } L${(x + 1) * gridSize},${(y + 1) * gridSize} L${x * gridSize},${
            (y + 1) * gridSize
          } Z`,
          delay: Math.random() * 5,
        });
      }
    }
  }

  return (
    <svg
      className="absolute inset-0 h-full w-full opacity-20"
      viewBox="0 0 800 480"
    >
      {paths.map((path) => (
        <motion.path
          key={path.id}
          d={path.d}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: [0, 1, 0],
            opacity: [0, 0.6, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 8,
            delay: path.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Organic Flow Paths
// ─────────────────────────────────────────────────────────────
function FlowPaths() {
  const flowPaths = Array.from({ length: 12 }, (_, i) => {
    const amplitude = 50 + i * 10;
    const offset = i * 60;
    return {
      id: `flow-${i}`,
      d: `M-100,${200 + offset} Q200,${200 + offset - amplitude} 500,${
        200 + offset
      } T900,${200 + offset}`,
      strokeWidth: 1 + i * 0.3,
      opacity: 0.1 + i * 0.05,
      delay: i * 0.8,
    };
  });

  return (
    <svg
      className="absolute inset-0 h-full w-full opacity-30"
      viewBox="0 0 800 800"
    >
      {flowPaths.map((path) => (
        <motion.path
          key={path.id}
          d={path.d}
          fill="none"
          stroke="currentColor"
          strokeWidth={path.strokeWidth}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{
            pathLength: [0, 1, 0.8, 0],
            opacity: [0, path.opacity, path.opacity * 0.7, 0],
          }}
          transition={{
            duration: 15,
            delay: path.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Neural Network Paths
// ─────────────────────────────────────────────────────────────
function NeuralPaths() {
  const nodes = Array.from({ length: 50 }, (_, i) => ({
    x: Math.random() * 800,
    y: Math.random() * 600,
    id: `node-${i}`,
  }));

  const connections = [];
  nodes.forEach((node, i) => {
    const nearbyNodes = nodes.filter((other, j) => {
      if (i === j) return false;
      const dx = node.x - other.x;
      const dy = node.y - other.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < 120 && Math.random() > 0.6;
    });
    nearbyNodes.forEach((target) => {
      connections.push({
        id: `conn-${i}-${target.id}`,
        d: `M${node.x},${node.y} L${target.x},${target.y}`,
        delay: Math.random() * 10,
      });
    });
  });

  return (
    <svg
      className="absolute inset-0 h-full w-full opacity-15"
      viewBox="0 0 800 600"
    >
      {connections.map((conn) => (
        <motion.path
          key={conn.id}
          d={conn.d}
          stroke="currentColor"
          strokeWidth="0.5"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: [0, 1, 0],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 6,
            delay: conn.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      {nodes.map((node) => (
        <motion.circle
          key={node.id}
          cx={node.x}
          cy={node.y}
          r="2"
          fill="currentColor"
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 1, 1.2, 1],
            opacity: [0, 0.6, 0.8, 0.6],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Spiral Paths
// ─────────────────────────────────────────────────────────────
function SpiralPaths() {
  const spirals = Array.from({ length: 8 }, (_, i) => {
    const centerX = 400 + ((i % 4) - 1.5) * 200;
    const centerY = 300 + Math.floor(i / 4 - 0.5) * 200;
    const radius = 80 + i * 15;
    const turns = 3 + i * 0.5;

    let path = `M${centerX + radius},${centerY}`;
    for (let angle = 0; angle <= turns * 360; angle += 5) {
      const rad = (angle * Math.PI) / 180;
      const currentRadius = radius * (1 - angle / (turns * 360));
      const x = centerX + currentRadius * Math.cos(rad);
      const y = centerY + currentRadius * Math.sin(rad);
      path += ` L${x},${y}`;
    }

    return {
      id: `spiral-${i}`,
      d: path,
      delay: i * 1.2,
    };
  });

  return (
    <svg
      className="absolute inset-0 h-full w-full opacity-25"
      viewBox="0 0 800 600"
    >
      {spirals.map((spiral) => (
        <motion.path
          key={spiral.id}
          d={spiral.d}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{
            pathLength: [0, 1, 0],
            rotate: [0, 360],
          }}
          transition={{
            pathLength: { duration: 12, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            delay: spiral.delay,
          }}
        />
      ))}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Hero Component (EduVoiceHero)
// ─────────────────────────────────────────────────────────────
export default function EduVoiceHero({ title = "eduvoice.ai" }) {
  const { user, isLoggedIn, logout } = useAuth();
  console.log(user);
  
  const [currentPattern, setCurrentPattern] = useState(0);
  const patterns = ["neural", "flow", "geometric", "spiral"];
  const words = title.split(" ");

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPattern((prev) => (prev + 1) % patterns.length);
    }, 12000); // rotate every 12s
    return () => clearInterval(interval);
  }, []);

  const renderPattern = () => {
    switch (currentPattern) {
      case 0:
        return <NeuralPaths />;
      case 1:
        return <FlowPaths />;
      case 2:
        return <GeometricPaths />;
      case 3:
        return <SpiralPaths />;
      default:
        return <NeuralPaths />;
    }
  };

  return (
    <div className="relative  flex min-h-screen w-full items-center justify-center  bg-gradient-to-br from-[hsl(var(--background)_/_1)] via-[hsl(var(--background)_/_0.8)] to-[hsl(var(--background)_/_1)] text-[hsl(var(--foreground))] dark:from-[hsl(var(--background-dark)_/_1)] dark:via-[hsl(var(--background-dark)_/_0.8)] dark:to-[hsl(var(--background-dark)_/_1)]">
      {/* Animated Background */}
      <div className="absolute inset-0 -top-23 text-muted-foreground dark:text-muted-foreground/80">
        <motion.div
          key={currentPattern}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2 }}
        >
          {renderPattern()}
        </motion.div>
      </div>

      {/* Gradient Soft Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-background/60 dark:from-background-dark/60 dark:via-transparent dark:to-background-dark/60" />

      {/* Main Content */}
      <div className="relative -top-23 z-10 container mx-auto px-4 text-center md:px-6">
        <motion.div
          className="mx-auto max-w-5xl  mb-23"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          {/* Title (animated letters) */}
          <div className="mb-8 relative ">
            {/* <h1 className=" text-6xl font-black leading-none tracking-tighter sm:text-8xl md:text-9xl">
              {words.map((word, wordIndex) => (
                <span key={wordIndex} className="mr-6 inline-block last:mr-0">
                  {word.split("").map((letter, letterIndex) => (
                    <motion.span
                      key={`${wordIndex}-${letterIndex}`}
                      initial={{ y: 100, opacity: 0, rotateX: -90 }}
                      animate={{ y: 0, opacity: 1, rotateX: 0 }}
                      transition={{
                        delay: wordIndex * 0.15 + letterIndex * 0.05,
                        type: "spring",
                        stiffness: 100,
                        damping: 20,
                        duration: 0.8,
                      }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="inline-block cursor-default bg-gradient-to-br from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent hover:from-primary hover:to-secondary dark:hover:from-primary/80 dark:hover:to-secondary/80 transition-all duration-700"
                    >
                      {letter}
                    </motion.span>
                  ))}
                </span>
              ))}
            </h1> */}
            <div className="flex justify-start items-center  mb-20  ">
              <div className="flex flex-col gap-7">
                {/* Subtitle */}
                <motion.p
                  className="mx-auto max-w-2xl text-5xl font-bold tracking-wide 
             text-white md:text-8xl transition-colors duration-300 
             hover:text-[#6D28D9]"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 1 }}
                >
                  EduVoice.AI

                </motion.p>
                {
                  isLoggedIn ? (
                    <motion.p
                      className="mx-auto max-w-2xl text-3xl font-light tracking-wide text-muted-foreground dark:text-muted-foreground/80 md:text-2xl "
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1, duration: 1 }}
                    >
                      Welcome, {user.name}
                    </motion.p>
                  ) : (
                   ""
                  )
                }

                <motion.p
                  className="mx-auto max-w-2xl text-xl font-light tracking-wide text-muted-foreground dark:text-muted-foreground/80 md:text-2xl "
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 1 }}
                >
                  Experience the future of interactive learning & design with
                  dynamic pattern generation.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1, duration: 0.6 }}
                >
                  <Link
                    to="/input"
                    className="rounded-xl bg-[#6D28D9] px-8 py-4 text-lg font-semibold text-white transition-transform duration-300 hover:scale-105 hover:bg-[#5B21B6]"
                  >
                    Explore EduVoice →
                  </Link>
                </motion.div>
              </div>
              <motion.img
                className="mx-auto mt-10 max-w-2xl h-[100px]dark:text-muted-foreground/80 hidden md:block "
                src="/chatbot-using-laptop-3.gif"
                alt="EduVoice Logo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
              />
            </div>
          </div>

          {/* CTA Button */}
        </motion.div>
      </div>
    </div>
  );
}
