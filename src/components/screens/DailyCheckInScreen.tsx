'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

const moodOptions = [
  { icon: 'sentiment_dissatisfied', label: 'Sad', color: 'text-blue-500' },
  { icon: 'sentiment_neutral', label: 'Neutral', color: 'text-amber-500' },
  { icon: 'sentiment_satisfied', label: 'Happy', color: 'text-green-500' },
]

export function DailyCheckInScreen() {
  const router = useRouter()
  const [mood, setMood] = useState(50)
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null)
  const [journalText, setJournalText] = useState('')
  const [showActions, setShowActions] = useState(false)

  const handleSave = () => {
    // Here you would typically save the check-in data to the database
    setShowActions(true)
  }

  const getRecommendedActions = () => {
    if (mood < 33) {
      return [
        { label: 'Talk to someone', action: () => router.push('/session'), icon: 'chat', color: 'from-blue-500 to-blue-600' },
        { label: 'Crisis support', action: () => router.push('/crisis-support'), icon: 'emergency', color: 'from-red-500 to-red-600' },
        { label: 'Guided meditation', action: () => router.push('/meditation'), icon: 'self_improvement', color: 'from-green-500 to-green-600' }
      ]
    } else if (mood < 66) {
      return [
        { label: 'Journal more', action: () => router.push('/dashboard'), icon: 'edit_note', color: 'from-amber-500 to-amber-600' },
        { label: 'Listen to others', action: () => router.push('/session'), icon: 'hearing', color: 'from-green-500 to-green-600' },
        { label: 'Quick meditation', action: () => router.push('/meditation'), icon: 'self_improvement', color: 'from-blue-500 to-blue-600' }
      ]
    } else {
      return [
        { label: 'Share your joy', action: () => router.push('/session'), icon: 'celebration', color: 'from-yellow-500 to-yellow-600' },
        { label: 'Listen to others', action: () => router.push('/session'), icon: 'hearing', color: 'from-green-500 to-green-600' },
        { label: 'Continue journaling', action: () => router.push('/dashboard'), icon: 'edit_note', color: 'from-purple-500 to-purple-600' }
      ]
    }
  }

  const getSliderColor = () => {
    if (mood < 33) return 'from-blue-400 to-primary-400'
    if (mood < 66) return 'from-amber-400 to-orange-400'
    return 'from-green-400 to-emerald-400'
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-primary-100 via-white to-primary-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute rounded-full opacity-20"
          style={{
            width: 200,
            height: 200,
            background: 'radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%)',
            filter: 'blur(40px)',
            top: '20%',
            right: '20%'
          }}
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      </div>

      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          className="w-full max-w-md glassmorphic rounded-3xl shadow-xl p-8 space-y-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* Header */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="material-symbols-outlined text-4xl text-primary-600 mb-3 block">self_improvement</span>
            <h1 className="text-3xl font-bold text-secondary-800">Daily Check-In</h1>
            <p className="text-secondary-600 mt-2">How are you feeling right now?</p>
          </motion.div>

          {/* Mood Slider */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="space-y-4">
              <input
                type="range"
                min="0"
                max="100"
                value={mood}
                onChange={(e) => setMood(Number(e.target.value))}
                className={`w-full h-4 bg-gradient-to-r ${getSliderColor()} rounded-full appearance-none cursor-pointer transition-all duration-300`}
              />
              <div className="flex justify-between text-sm text-secondary-500">
                <span>Not so good</span>
                <span>Okay</span>
                <span>Great!</span>
              </div>
            </div>
          </motion.div>

          {/* Emoji Selection */}
          <motion.div
            className="flex justify-around items-center py-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {moodOptions.map(({ icon, label, color }) => (
              <motion.button
                key={label}
                onClick={() => setSelectedEmoji(label)}
                className={`p-4 rounded-2xl transition-all duration-300 ${
                  selectedEmoji === label
                    ? 'bg-primary-100 scale-110 shadow-lg'
                    : 'hover:bg-white/50'
                }`}
                whileHover={{ scale: selectedEmoji === label ? 1.1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className={`material-symbols-outlined text-4xl ${color} block`}>{icon}</span>
              </motion.button>
            ))}
          </motion.div>

          {/* Quick Journal */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <span className="material-symbols-outlined absolute top-4 left-4 text-secondary-400 text-xl">edit_note</span>
            <textarea
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full h-32 p-4 pl-12 bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-all duration-300 resize-none text-secondary-800 placeholder:text-secondary-400"
            />
          </motion.div>

          {/* Save Button */}
          <motion.button
            onClick={handleSave}
            className="w-full group inline-flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-lg font-semibold rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <span className="material-symbols-outlined text-xl">check_circle</span>
            Save Check-In
          </motion.button>

          {/* Action Recommendations */}
          {showActions && (
            <motion.div
              className="space-y-4 pt-4 border-t border-white/30"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-lg font-semibold text-secondary-800 text-center">
                What would help right now?
              </h3>
              <div className="space-y-3">
                {getRecommendedActions().map((action, index) => (
                  <motion.button
                    key={action.label}
                    onClick={action.action}
                    className={`w-full p-4 bg-gradient-to-r ${action.color} text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <span className="material-symbols-outlined text-xl">{action.icon}</span>
                    <span className="font-medium">{action.label}</span>
                  </motion.button>
                ))}
              </div>

            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
