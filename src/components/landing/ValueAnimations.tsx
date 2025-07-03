'use client'

import { motion } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'

// 1. Support - Floating Orbiting Orb Animation (Enhanced)
export const FloatingOrbitOrb = ({ color, size = 100, pulseSpeed = 4 }: { color: string, size?: number, pulseSpeed?: number }) => {
  return (
    <motion.div
      className="relative"
      style={{ width: size, height: size }}
    >
      {/* Inner Core */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ 
          width: size * 0.8,
          height: size * 0.8,
          top: '10%',
          left: '10%',
          backgroundImage: `radial-gradient(circle, ${color} 0%, transparent 70%)` 
        }}
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.6, 0.8, 0.6],
        }}
        transition={{
          duration: pulseSpeed,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      
      {/* Outer Glow */}
      <motion.div
        className="absolute inset-0 rounded-full blur-xl"
        style={{ backgroundColor: color }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: pulseSpeed * 1.5,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "reverse",
          delay: 0.5
        }}
      />
      
      {/* Orbiting Satellites */}
      {[...Array(2)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ 
            width: size,
            height: size,
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: (pulseSpeed * 2) + (i * 2),
            ease: "linear",
            repeat: Infinity,
          }}
        >
          <motion.div
            className="absolute rounded-full"
            style={{
              width: size * (i === 0 ? 0.15 : 0.1),
              height: size * (i === 0 ? 0.15 : 0.1),
              backgroundColor: color,
              opacity: i === 0 ? 0.9 : 0.6,
              top: '0%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}

// 2. Structure - Rising Light Beam Animation (Enhanced)
export const RisingLightBeam = ({ color, size = 100, beamSpeed = 3 }: { color: string, size?: number, beamSpeed?: number }) => {
  return (
    <motion.div
      className="relative overflow-hidden rounded-full"
      style={{ width: size, height: size, backgroundColor: `${color.replace('rgba', 'rgb').replace(/, [0-9\.]+\)/, ')')}`.slice(0, -1) + ', 0.1)' }}
    >
      {/* Base glow */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 rounded-t-full blur-2xl"
        style={{ 
          height: size * 0.5,
          backgroundColor: color,
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: beamSpeed,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      />
      
      {/* Rising beams */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bottom-0 rounded-full blur-sm"
          style={{ 
            left: `${10 + i * 18}%`,
            width: size * 0.05,
            height: size * 0.8,
            backgroundColor: color,
            transformOrigin: 'bottom',
          }}
          animate={{
            scaleY: [0, 1, 0],
            opacity: [0, 0.7, 0],
          }}
          transition={{
            duration: beamSpeed + Math.random() * 2,
            ease: "easeInOut",
            repeat: Infinity,
            delay: i * 0.4,
          }}
        />
      ))}
      
      {/* Center Orb */}
      <motion.div
        className="absolute rounded-full blur-md"
        style={{ 
          width: size * 0.2,
          height: size * 0.2,
          backgroundColor: color,
          left: '40%',
          top: '40%',
        }}
        animate={{
          opacity: [0.5, 1, 0.5],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: beamSpeed * 1.5,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: 'reverse'
        }}
      />
    </motion.div>
  )
}

// 3. Economy - Rhythmic Pulse Animation (Enhanced)
export const RhythmicPulse = ({ color, size = 100, pulseSpeed = 4 }: { color: string, size?: number, pulseSpeed?: number }) => {
  return (
    <motion.div
      className="relative"
      style={{ width: size, height: size }}
    >
      {/* Central circle */}
      <motion.div
        className="absolute rounded-full blur-lg"
        style={{ 
          width: size * 0.5, 
          height: size * 0.5, 
          backgroundColor: color,
          top: '25%',
          left: '25%',
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.8, 0.5]
        }}
        transition={{
          duration: pulseSpeed * 0.8,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
      
      {/* Pulse rings */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{ 
            width: '100%', 
            height: '100%', 
            border: `1.5px solid ${color}`,
            top: 0,
            left: 0,
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{
            scale: 1,
            opacity: 0,
          }}
          transition={{
            duration: pulseSpeed,
            ease: "easeOut",
            repeat: Infinity,
            delay: i * (pulseSpeed / 4),
          }}
        />
      ))}
      
      {/* Data dots */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`dot-${i}`}
          className="absolute rounded-full"
          style={{ 
            width: size * 0.05,
            height: size * 0.05,
            backgroundColor: color,
            top: '50%',
            left: '50%',
            transform: `rotate(${i * 45}deg) translateX(${size * 0.4}px)`
          }}
          animate={{
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: pulseSpeed,
            repeat: Infinity,
            delay: Math.random() * pulseSpeed
          }}
        />
      ))}
    </motion.div>
  )
}

// 4. Authenticity - Hand-drawn Spiral Animation
export const HandDrawnSpiral = ({ color, size = 100, drawSpeed = 5 }: { color: string, size?: number, drawSpeed?: number }) => {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);
  
  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, []);
  
  return (
    <motion.div
      className="relative"
      style={{ width: size, height: size }}
    >
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        fill="none"
        className="absolute inset-0"
      >
        <motion.path
          ref={pathRef}
          d="M50,90 C60,90 70,80 70,70 C70,60 60,50 50,50 C40,50 30,40 30,30 C30,20 40,10 50,10"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ 
            pathLength: [0, 1, 1, 0], 
            opacity: [0, 1, 1, 0],
            rotate: [0, 0, 10, 0],
          }}
          transition={{ 
            duration: drawSpeed,
            ease: "easeInOut",
            repeat: Infinity,
            times: [0, 0.4, 0.8, 1],
          }}
        />
        
        {/* Small circles along the path */}
        {[0.2, 0.4, 0.6, 0.8].map((pos, i) => (
          <motion.circle
            key={i}
            cx="50"
            cy="50"
            r="3"
            fill={color}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              delay: drawSpeed * pos,
              duration: drawSpeed * 0.3,
              repeat: Infinity,
              repeatDelay: drawSpeed * 0.7,
            }}
          />
        ))}
      </svg>
      
      {/* Subtle glow */}
      <motion.div
        className="absolute inset-0 rounded-full blur-xl"
        style={{ backgroundColor: color }}
        animate={{
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: drawSpeed,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      />
    </motion.div>
  )
}

// 5. Always Held - Breathing Orb Animation (original)
export const BreathingOrb = ({ color, size = 100, pulseSpeed = 4 }: { color: string, size?: number, pulseSpeed?: number }) => {
  return (
    <motion.div
      className="relative"
      style={{ width: size, height: size }}
    >
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: color }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.7, 0.9, 0.7],
        }}
        transition={{
          duration: pulseSpeed,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      <motion.div
        className="absolute inset-0 rounded-full blur-md"
        style={{ backgroundColor: color }}
        animate={{
          scale: [1, 1.35, 1],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: pulseSpeed * 1.2,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "reverse",
          delay: 0.5
        }}
      />
    </motion.div>
  )
}

// Gentle Sparkle Animation
export const GentleSparkle = ({ color = '#fff', count = 15 }: { color?: string, count?: number }) => {
  const [sparkles, setSparkles] = useState<Array<{ id: number, x: number, y: number, size: number, delay: number }>>([])

  useEffect(() => {
    const newSparkles = Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 5
    }))
    setSparkles(newSparkles)
  }, [count])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          className="absolute rounded-full"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: sparkle.size,
            height: sparkle.size,
            backgroundColor: color
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0]
          }}
          transition={{
            duration: 3,
            delay: sparkle.delay,
            repeat: Infinity,
            repeatDelay: Math.random() * 10 + 5
          }}
        />
      ))}
    </div>
  )
}

// Looped Heart Glow
export const LoopedHeartGlow = ({ size = 60, color = '#ff6b6b' }: { size?: number, color?: string }) => {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 w-full h-full"
      >
        <motion.path
          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0.6 }}
          animate={{
            pathLength: [0, 1, 1],
            opacity: [0.6, 1, 0.6],
            scale: [0.9, 1.05, 0.9]
          }}
          transition={{
            duration: 4,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "loop"
          }}
        />
      </svg>
      <motion.div
        className="absolute inset-0 rounded-full blur-xl"
        style={{ backgroundColor: color }}
        animate={{
          opacity: [0.1, 0.3, 0.1]
        }}
        transition={{
          duration: 3,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
    </div>
  )
}

// Flowing Wave Animation
export const FlowingWave = ({ color = 'rgba(147, 51, 234, 0.3)' }: { color?: string }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg width="100%" height="100%" className="absolute inset-0">
        <motion.path
          d="M0,50 Q25,30 50,50 T100,50 T150,50 T200,50 T250,50 T300,50 T350,50 T400,50"
          fill="none"
          stroke={color}
          strokeWidth="20"
          initial={{ pathLength: 0 }}
          animate={{
            y: [0, -10, 0],
            pathOffset: [0, 1]
          }}
          transition={{
            y: {
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            },
            pathOffset: {
              duration: 10,
              repeat: Infinity,
              ease: "linear"
            }
          }}
        />
      </svg>
    </div>
  )
}

// Floating Element
export const FloatingElement = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      animate={{
        y: [0, -10, 0],
        rotate: [0, 2, 0, -2, 0]
      }}
      transition={{
        duration: 6,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse"
      }}
    >
      {children}
    </motion.div>
  )
}

// Handwritten Line
export const HandwrittenLine = ({ text, color = '#9333ea', width = 100 }: { text: string, color?: string, width?: number }) => {
  return (
    <div className="relative mt-4 mb-6">
      <p className="text-center italic text-sm opacity-80">{text}</p>
      <motion.div
        className="absolute left-1/2 -bottom-2 h-0.5 rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0, x: -width/2 }}
        whileInView={{ width }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
    </div>
  )
}
