"use client";
import React, { useEffect, useState, useRef } from "react";

export default function StarryBackground({
  minSpeed = 10,
  maxSpeed = 20,
  minDelay = 1000,
  maxDelay = 2000,
  starColor = "#9E00FF",
  trailColor = "#2EB9DF",
  starWidth = 10,
  starHeight = 1.7,
  layers = 3, // number of shooting star layers
  className = ""
}) {
  const [stars, setStars] = useState([]);
  const svgRef = useRef(null);

  // Helper to get random start point
  const getRandomStartPoint = () => {
    const side = Math.floor(Math.random() * 4);
    const offset = Math.random() * window.innerWidth;
    switch (side) {
      case 0: return { x: offset, y: 0, angle: 45 };
      case 1: return { x: window.innerWidth, y: offset, angle: 135 };
      case 2: return { x: offset, y: window.innerHeight, angle: 225 };
      case 3: return { x: 0, y: offset, angle: 315 };
      default: return { x: 0, y: 0, angle: 45 };
    }
  };

  // Create shooting stars
  useEffect(() => {
    let timeouts = [];

    const createStar = () => {
      const { x, y, angle } = getRandomStartPoint();
      const newStar = {
        id: Date.now() + Math.random(),
        x,
        y,
        angle,
        scale: 1,
        speed: Math.random() * (maxSpeed - minSpeed) + minSpeed,
        distance: 0,
        color: {
          star: starColor,
          trail: trailColor
        }
      };
      setStars(prev => [...prev, newStar]);

      const randomDelay = Math.random() * (maxDelay - minDelay) + minDelay;
      timeouts.push(setTimeout(createStar, randomDelay));
    };

    createStar();

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [minSpeed, maxSpeed, minDelay, maxDelay, starColor, trailColor]);

  // Move stars
  useEffect(() => {
    let animationId;

    const moveStars = () => {
      setStars(prevStars =>
        prevStars
          .map(star => {
            const newX = star.x + star.speed * Math.cos((star.angle * Math.PI) / 180);
            const newY = star.y + star.speed * Math.sin((star.angle * Math.PI) / 180);
            const newDistance = star.distance + star.speed;
            const newScale = 1 + newDistance / 100;

            if (
              newX < -20 ||
              newX > window.innerWidth + 20 ||
              newY < -20 ||
              newY > window.innerHeight + 20
            ) {
              return null;
            }

            return { ...star, x: newX, y: newY, distance: newDistance, scale: newScale };
          })
          .filter(Boolean)
      );

      animationId = requestAnimationFrame(moveStars);
    };

    animationId = requestAnimationFrame(moveStars);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className} z-0 pointer-events-none`}>
      {/* Twinkling star background */}
      <div className="absolute inset-0">
        <div className="stars absolute inset-0" />
      </div>

      {/* Shooting stars */}
      <svg ref={svgRef} className="w-full h-full absolute inset-0">
        <defs>
          {/* Glow filter for shooting stars */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {stars.map(star => (
          <React.Fragment key={star.id}>
            <defs>
              <linearGradient id={`gradient-${star.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: star.color.trail, stopOpacity: 0 }} />
                <stop offset="100%" style={{ stopColor: star.color.star, stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <rect
              x={star.x}
              y={star.y}
              width={starWidth * star.scale}
              height={starHeight}
              fill={`url(#gradient-${star.id})`}
              transform={`rotate(${star.angle}, ${star.x + (starWidth * star.scale) / 2}, ${star.y + starHeight / 2})`}
              filter="url(#glow)"
            />
          </React.Fragment>
        ))}
      </svg>

      {/* Enhanced twinkle animation CSS with white colors only */}
      <style jsx>{`
        .stars {
          background-image:
            radial-gradient(1px 1px at 23px 47px, #ffffff, rgba(255, 255, 255, 0)),
            radial-gradient(1.5px 1.5px at 178px 112px, #ffffff, rgba(255, 255, 255, 0)),
            radial-gradient(1px 1px at 67px 189px, #ffffff, rgba(255, 255, 255, 0)),
            radial-gradient(2px 2px at 234px 31px, #ffffff, rgba(255, 255, 255, 0)),
            radial-gradient(1px 1px at 145px 78px, #ffffff, rgba(255, 255, 255, 0)),
            radial-gradient(1.5px 1.5px at 89px 234px, #ffffff, rgba(255, 255, 255, 0)),
            radial-gradient(1px 1px at 312px 167px, #ffffff, rgba(255, 255, 255, 0)),
            radial-gradient(2px 2px at 12px 145px, #ffffff, rgba(255, 255, 255, 0)),
            radial-gradient(1px 1px at 267px 89px, #ffffff, rgba(255, 255, 255, 0)),
            radial-gradient(1.5px 1.5px at 134px 12px, #ffffff, rgba(255, 255, 255, 0)),
            radial-gradient(1px 1px at 45px 278px, #ffffff, rgba(255, 255, 255, 0)),
            radial-gradient(2px 2px at 198px 201px, #ffffff, rgba(255, 255, 255, 0)),
            radial-gradient(1px 1px at 289px 156px, #ffffff, rgba(255, 255, 255, 0)),
            radial-gradient(1.5px 1.5px at 56px 67px, #ffffff, rgba(255, 255, 255, 0)),
            radial-gradient(1px 1px at 167px 289px, #ffffff, rgba(255, 255, 255, 0)),
            radial-gradient(2px 2px at 223px 134px, #ffffff, rgba(255, 255, 255, 0)),
            radial-gradient(1px 1px at 78px 23px, #ffffff, rgba(255, 255, 255, 0)),
            radial-gradient(1.5px 1.5px at 301px 245px, #ffffff, rgba(255, 255, 255, 0)),
            radial-gradient(1px 1px at 112px 198px, #ffffff, rgba(255, 255, 255, 0)),
            radial-gradient(2px 2px at 34px 112px, #ffffff, rgba(255, 255, 255, 0));
          background-repeat: repeat;
          background-size: 350px 350px;
          animation: 
            star1 4.1s ease-in-out infinite 0.5s,
            star2 3.7s ease-in-out infinite 1.8s,
            star3 5.3s ease-in-out infinite 3.2s,
            star4 3.9s ease-in-out infinite 0.9s,
            star5 4.8s ease-in-out infinite 4.1s,
            star6 2.9s ease-in-out infinite 2.3s,
            star7 6.2s ease-in-out infinite 1.4s,
            star8 3.3s ease-in-out infinite 5.1s,
            star9 4.7s ease-in-out infinite 0.2s,
            star10 5.8s ease-in-out infinite 3.7s;
          opacity: 0.9;
          filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 15px rgba(255, 255, 255, 0.4)) drop-shadow(0 0 25px rgba(255, 255, 255, 0.2));
        }

        @keyframes star1 {
          0%, 100% { opacity: 0.8; }
          45% { opacity: 1; }
          70% { opacity: 0.9; }
        }

        @keyframes star2 {
          0%, 100% { opacity: 0.4; }
          60% { opacity: 0.9; }
          30% { opacity: 0.1; }
        }

        @keyframes star3 {
          0%, 100% { opacity: 0.7; }
          25% { opacity: 0.9; }
          80% { opacity: 0.3; }
        }

        @keyframes star4 {
          0%, 100% { opacity: 0.2; }
          35% { opacity: 0.1; }
          75% { opacity: 1; }
          90% { opacity: 0.8; }
        }

        @keyframes star5 {
          0%, 100% { opacity: 0.9; }
          20% { opacity: 0.7; }
          50% { opacity: 0.2; }
          85% { opacity: 1; }
        }

        @keyframes star6 {
          0%, 100% { opacity: 0.3; }
          40% { opacity: 0.8; }
          65% { opacity: 0.1; }
          90% { opacity: 0.6; }
        }

        @keyframes star7 {
          0%, 100% { opacity: 0.6; }
          30% { opacity: 1; }
          55% { opacity: 0.4; }
        }

        @keyframes star8 {
          0%, 100% { opacity: 0.1; }
          25% { opacity: 0.3; }
          70% { opacity: 0.9; }
        }

        @keyframes star9 {
          0%, 100% { opacity: 0.5; }
          15% { opacity: 0.8; }
          45% { opacity: 0.2; }
          80% { opacity: 1; }
        }

        @keyframes star10 {
          0%, 100% { opacity: 0.8; }
          35% { opacity: 0.4; }
          60% { opacity: 1; }
          85% { opacity: 0.1; }
        }
      `}</style>
    </div>
  );
}