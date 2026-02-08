"use client";

import { motion, type Variants } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import type { MascotMood } from "@/types/gamification";

interface PepperBirdProps {
  mood?: MascotMood;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  interactive?: boolean;
}

const sizeClasses = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-32 h-32",
  xl: "w-48 h-48",
};

const moodAnimations: Record<MascotMood, Variants> = {
  happy: {
    animate: {
      y: [0, -5, 0],
      rotate: [0, 2, -2, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  },
  celebrating: {
    animate: {
      y: [0, -15, 0],
      rotate: [0, 10, -10, 0],
      scale: [1, 1.1, 1],
      transition: {
        duration: 0.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  },
  encouraging: {
    animate: {
      x: [0, 3, -3, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  },
  sleeping: {
    animate: {
      y: [0, 2, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  },
  thinking: {
    animate: {
      rotate: [0, 5, 0, -5, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  },
};

// Eye variants based on mood
const getEyeVariants = (mood: MascotMood) => {
  switch (mood) {
    case "sleeping":
      return { scaleY: 0.1 };
    case "celebrating":
      return { scaleY: 1.2 };
    default:
      return { scaleY: 1 };
  }
};

export function PepperBird({ mood = "happy", size = "md", className = "", interactive = false }: PepperBirdProps) {
  const eyeVariants = getEyeVariants(mood);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track mouse movement for interactive response
  useEffect(() => {
    if (!interactive) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate angle towards mouse
      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
      const distance = Math.hypot(e.clientX - centerX, e.clientY - centerY);
      
      // Max distance for effect (viewport diagonal)
      const maxDistance = Math.hypot(window.innerWidth, window.innerHeight);
      const influence = Math.min(distance / maxDistance, 0.5);
      
      // Move bird slightly towards mouse
      const moveX = Math.cos(angle) * 15 * influence;
      const moveY = Math.sin(angle) * 15 * influence;
      
      setMousePosition({ x: moveX, y: moveY });
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [interactive]);
  
  // Reset position when not hovering (on desktop) or on mobile
  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => {
    setIsHovering(false);
    setMousePosition({ x: 0, y: 0 });
  };
  
  return (
    <motion.div
      ref={containerRef}
      className={`${sizeClasses[size]} ${className} cursor-pointer`}
      variants={moodAnimations[mood]}
      animate="animate"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileHover={interactive && isHovering ? { scale: 1.1 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={interactive && isHovering ? { 
        x: mousePosition.x, 
        y: mousePosition.y 
      } : {}}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Body */}
        <motion.ellipse
          cx="50"
          cy="55"
          rx="30"
          ry="35"
          fill="#6E8658"
          stroke="#290907"
          strokeWidth="2"
        />
        
        {/* Belly */}
        <ellipse
          cx="50"
          cy="62"
          rx="20"
          ry="22"
          fill="#D0D5CE"
        />
        
        {/* Head */}
        <motion.circle
          cx="50"
          cy="28"
          r="22"
          fill="#6E8658"
          stroke="#290907"
          strokeWidth="2"
        />
        
        {/* Face circle */}
        <circle
          cx="50"
          cy="30"
          r="15"
          fill="#D0D5CE"
        />
        
        {/* Left eye */}
        <motion.ellipse
          cx="43"
          cy="26"
          rx="4"
          ry="5"
          fill="#290907"
          animate={eyeVariants}
          transition={{ duration: 0.3 }}
        />
        
        {/* Right eye */}
        <motion.ellipse
          cx="57"
          cy="26"
          rx="4"
          ry="5"
          fill="#290907"
          animate={eyeVariants}
          transition={{ duration: 0.3 }}
        />
        
        {/* Eye shine */}
        {mood !== "sleeping" && (
          <>
            <circle cx="44" cy="24" r="1.5" fill="white" />
            <circle cx="58" cy="24" r="1.5" fill="white" />
          </>
        )}
        
        {/* Beak */}
        <motion.path
          d="M50 32 L45 38 L55 38 Z"
          fill="#F3C24F"
          stroke="#290907"
          strokeWidth="1"
          animate={mood === "celebrating" ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.3, repeat: mood === "celebrating" ? Infinity : 0 }}
        />
        
        {/* Crest/Plume */}
        <motion.path
          d="M50 8 Q55 3 60 10 Q55 8 50 12 Q45 8 40 10 Q45 3 50 8"
          fill="#D63A3A"
          stroke="#290907"
          strokeWidth="1"
          animate={mood === "celebrating" ? { 
            rotate: [0, 5, -5, 0],
            y: [0, -2, 0]
          } : {}}
          transition={{ duration: 0.5, repeat: mood === "celebrating" ? Infinity : 0 }}
        />
        
        {/* Left wing */}
        <motion.ellipse
          cx="25"
          cy="55"
          rx="8"
          ry="20"
          fill="#57473A"
          stroke="#290907"
          strokeWidth="1.5"
          animate={mood === "celebrating" ? { 
            rotate: [-20, -40, -20],
            x: [-5, 0, -5]
          } : { rotate: -15 }}
          transition={{ duration: 0.3, repeat: mood === "celebrating" ? Infinity : 0 }}
        />
        
        {/* Right wing */}
        <motion.ellipse
          cx="75"
          cy="55"
          rx="8"
          ry="20"
          fill="#57473A"
          stroke="#290907"
          strokeWidth="1.5"
          animate={mood === "celebrating" ? { 
            rotate: [20, 40, 20],
            x: [5, 0, 5]
          } : { rotate: 15 }}
          transition={{ duration: 0.3, repeat: mood === "celebrating" ? Infinity : 0 }}
        />
        
        {/* Left foot */}
        <path
          d="M40 88 L35 95 M40 88 L40 95 M40 88 L45 95"
          stroke="#F3C24F"
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Right foot */}
        <path
          d="M60 88 L55 95 M60 88 L60 95 M60 88 L65 95"
          stroke="#F3C24F"
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Cheeks (blush) */}
        {(mood === "happy" || mood === "celebrating") && (
          <>
            <circle cx="35" cy="32" r="4" fill="#E85C5C" opacity="0.4" />
            <circle cx="65" cy="32" r="4" fill="#E85C5C" opacity="0.4" />
          </>
        )}
        
        {/* Sleeping Z's */}
        {mood === "sleeping" && (
          <motion.text
            x="70"
            y="15"
            fill="#73A1B2"
            fontSize="12"
            fontWeight="bold"
            animate={{ 
              opacity: [0, 1, 0],
              y: [15, 5, -5],
              scale: [0.8, 1, 0.8]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            z
          </motion.text>
        )}
        
        {/* Thinking dots */}
        {mood === "thinking" && (
          <>
            <motion.circle
              cx="72"
              cy="20"
              r="3"
              fill="#73A1B2"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0 }}
            />
            <motion.circle
              cx="80"
              cy="15"
              r="4"
              fill="#73A1B2"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
            />
            <motion.circle
              cx="88"
              cy="8"
              r="5"
              fill="#73A1B2"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.6 }}
            />
          </>
        )}
      </svg>
    </motion.div>
  );
}
