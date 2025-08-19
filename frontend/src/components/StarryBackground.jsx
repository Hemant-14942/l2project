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
            />
          </React.Fragment>
        ))}
      </svg>

      {/* Twinkle animation CSS */}
      <style jsx>{`
        .stars {
          background-image:
            radial-gradient(2px 2px at 20px 30px, #eee, rgba(0, 0, 0, 0)),
            radial-gradient(2px 2px at 40px 70px, #fff, rgba(0, 0, 0, 0)),
            radial-gradient(2px 2px at 50px 160px, #ddd, rgba(0, 0, 0, 0)),
            radial-gradient(2px 2px at 90px 40px, #fff, rgba(0, 0, 0, 0)),
            radial-gradient(2px 2px at 130px 80px, #fff, rgba(0, 0, 0, 0)),
            radial-gradient(2px 2px at 160px 120px, #ddd, rgba(0, 0, 0, 0));
          background-repeat: repeat;
          background-size: 200px 200px;
          animation: twinkle 5s ease-in-out infinite;
          opacity: 0.5;
        }

        @keyframes twinkle {
          0% { opacity: 0.5; }
          50% { opacity: 0.8; }
          100% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
