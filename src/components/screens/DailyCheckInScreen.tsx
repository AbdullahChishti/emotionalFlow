'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Smile, Meh, Frown, Sparkles, PenLine, Check } from 'lucide-react'

const moodOptions = [
  { icon: Frown, label: 'Sad', color: 'text-blue-500' },
  { icon: Meh, label: 'Neutral', color: 'text-yellow-500' },
  { icon: Smile, label: 'Happy', color: 'text-green-500' },
]

export function DailyCheckInScreen() {
  const [mood, setMood] = useState(50)
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null)
  const [journalText, setJournalText] = useState('')

  const getSliderColor = () => {
    if (mood < 33) return 'from-blue-400 to-purple-400'
    if (mood < 66) return 'from-yellow-400 to-orange-400'
    return 'from-green-400 to-teal-400'
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-green-100 font-sans p-4">
      <motion.div 
        className="w-full max-w-md bg-white/70 backdrop-blur-lg rounded-3xl shadow-lg shadow-purple-500/10 p-8 space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <div className="text-center">
          <Sparkles className="mx-auto w-10 h-10 text-purple-400 mb-2" />
          <h1 className="text-3xl font-bold text-zinc-700">Daily Check-In</h1>
          <p className="text-zinc-500 mt-1">How are you feeling right now?</p>
        </div>

        {/* Mood Slider */}
        <div className="space-y-4">
          <input
            type="range"
            min="0"
            max="100"
            value={mood}
            onChange={(e) => setMood(Number(e.target.value))}
            className={`w-full h-3 bg-gradient-to-r ${getSliderColor()} rounded-full appearance-none cursor-pointer transition-all duration-300`}
            style={{ 
              '--thumb-color': mood < 33 ? '#60a5fa' : mood < 66 ? '#fbbf24' : '#2dd4bf',
            }}
          />
          <div className="flex justify-between text-xs text-zinc-500">
            <span>Not so good</span>
            <span>Okay</span>
            <span>Great!</span>
          </div>
        </div>

        {/* Emoji Selection */}
        <div className="flex justify-around items-center">
          {moodOptions.map(({ icon: Icon, label, color }) => (
            <motion.button
              key={label}
              onClick={() => setSelectedEmoji(label)}
              className={`p-4 rounded-full transition-all duration-300 ${selectedEmoji === label ? 'bg-purple-100 scale-110' : 'hover:bg-gray-100'}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon className={`w-10 h-10 ${color}`} strokeWidth={1.5} />
            </motion.button>
          ))}
        </div>

        {/* Quick Journal */}
        <div className="relative">
          <PenLine className="absolute top-3 left-3 w-5 h-5 text-zinc-400" />
          <textarea
            value={journalText}
            onChange={(e) => setJournalText(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full h-28 p-3 pl-10 bg-white/50 border border-purple-200/50 rounded-xl focus:ring-2 focus:ring-purple-300 focus:outline-none transition-all duration-300 resize-none"
          />
        </div>

        {/* Save Button */}
        <motion.button
          className="w-full group inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-500 text-white text-lg font-semibold rounded-full shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300"
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
        >
          <Check className="w-6 h-6" />
          Save Check-In
        </motion.button>
      </motion.div>
    </div>
  )
}
