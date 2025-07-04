'use client'

import { motion, Variants } from 'framer-motion'

const iconVariants: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
  hover: { scale: 1.1, transition: { duration: 0.3 } },
}

// 1. Give Support: A hand gently holding a heart.
export const GiveSupportIcon = ({ color, size }: { color: string; size: number }) => (
  <motion.svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    variants={iconVariants}
    initial="initial"
    animate="animate"
    whileHover="hover"
  >
    <motion.path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      stroke={color}
      strokeWidth="1.5"
      fill={`${color}33`}
      initial={{ pathLength: 0, fillOpacity: 0 }}
      animate={{ pathLength: 1, fillOpacity: 1, transition: { duration: 1.5, delay: 0.2 } }}
    />
    <motion.path
      d="M17.5 3C15.74 3 14.09 3.81 13 5.09V14c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2V8c0-2.21 1.79-4 4-4h1.5"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1, transition: { duration: 1.5 } }}
    />
  </motion.svg>
)

// 2. Earn Empathy Credits: A glowing, pulsating token.
export const EarnCreditsIcon = ({ color, size }: { color: string; size: number }) => (
  <motion.svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    variants={iconVariants}
    initial="initial"
    animate="animate"
    whileHover="hover"
  >
    <motion.circle
      cx="12"
      cy="12"
      r="10"
      stroke={color}
      strokeWidth="2"
      fill={`${color}4D`}
    />
    <motion.circle
      cx="12"
      cy="12"
      r="10"
      stroke={color}
      strokeWidth="4"
      fill="transparent"
      initial={{ scale: 1, opacity: 0.6 }}
      animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0, 0.6], transition: { duration: 2, repeat: Infinity } }}
    />
    <motion.path d="M12 6v12M8 10l8 4M8 14l8-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
  </motion.svg>
)

// 3. Get Matched: Two orbs connecting.
export const GetMatchedIcon = ({ color, size }: { color: string; size: number }) => (
  <motion.div style={{ width: size, height: size, position: 'relative' }} variants={iconVariants} initial="initial" animate="animate" whileHover="hover">
    <motion.circle
      cx={size * 0.35}
      cy={size * 0.5}
      r={size * 0.15}
      fill={`${color}80`}
      animate={{ cx: [size * 0.35, size * 0.65, size * 0.35], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
    />
    <motion.circle
      cx={size * 0.65}
      cy={size * 0.5}
      r={size * 0.15}
      fill={`${color}80`}
      animate={{ cx: [size * 0.65, size * 0.35, size * 0.65], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
    />
    <motion.svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: 'absolute', top: 0, left: 0 }}>
      <motion.path
        d={`M ${size * 0.35} ${size * 0.5} C ${size * 0.5} ${size * 0.3}, ${size * 0.5} ${size * 0.7}, ${size * 0.65} ${size * 0.5}`}
        stroke={color}
        strokeWidth="2"
        fill="transparent"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: [0, 1, 0], opacity: [0, 1, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
      />
    </motion.svg>
  </motion.div>
)

// 4. Receive Support: An abstract, warm glow.
export const ReceiveSupportIcon = ({ color, size }: { color: string; size: number }) => (
  <motion.div style={{ width: size, height: size, position: 'relative' }} variants={iconVariants} initial="initial" animate="animate" whileHover="hover">
    <motion.div
      style={{ width: '100%', height: '100%', borderRadius: '50%', background: `radial-gradient(circle, ${color}33 0%, ${color}00 70%)` }}
      animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8], transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } }}
    />
    <motion.div
      style={{ position: 'absolute', top: '50%', left: '50%', width: '60%', height: '60%', borderRadius: '50%', background: `radial-gradient(circle, ${color}66 0%, ${color}00 70%)`, transform: 'translate(-50%, -50%)' }}
      animate={{ scale: [1, 0.95, 1], transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } }}
    />
  </motion.div>
)

// 5. AI Companion: A simple, friendly orb.
export const AICompanionIcon = ({ color, size }: { color: string; size: number }) => (
  <motion.svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    variants={iconVariants}
    initial="initial"
    animate="animate"
    whileHover="hover"
  >
    <motion.circle cx="12" cy="12" r="8" fill={`${color}4D`} stroke={color} strokeWidth="2" />
    <motion.circle
      cx="12"
      cy="12"
      r="2.5"
      fill="#fff"
      initial={{ scale: 0.8, opacity: 0.7 }}
      animate={{ scale: [0.8, 1, 0.8], opacity: [0.7, 1, 0.7], transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } }}
    />
  </motion.svg>
)
