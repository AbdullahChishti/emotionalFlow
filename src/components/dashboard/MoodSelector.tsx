'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
// Material Symbols icons import
import 'material-symbols/outlined.css'
import { useAuth } from '@/components/providers/TestAuthProvider'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface MoodSelectorProps {
  onClose: () => void
  onMoodSubmitted: () => void
}

export function MoodSelector({ onClose, onMoodSubmitted }: MoodSelectorProps) {
  const { user } = useAuth()
  const [moodScore, setMoodScore] = useState(5)
  const [seekingSupport, setSeekingSupport] = useState(false)
  const [willingToListen, setWillingToListen] = useState(true)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const moodEmojis = ['😔', '😟', '😕', '😐', '🙂', '😊', '😄', '😁', '🤩', '💖']
  const moodLabels = [
    'Very Low', 'Low', 'Down', 'Neutral', 'Okay', 
    'Good', 'Happy', 'Great', 'Excited', 'Euphoric'
  ]

  const getEmotionalCapacity = (mood: number): 'low' | 'medium' | 'high' => {
    if (mood <= 3) return 'low'
    if (mood <= 7) return 'medium'
    return 'high'
  }

  const handleSubmit = async () => {
    if (!user) return

    setLoading(true)
    try {
      const emotionalCapacity = getEmotionalCapacity(moodScore)

      const { error: moodError } = await supabase
        .from('mood_entries')
        .insert({
          user_id: user.id,
          mood_score: moodScore,
          emotional_capacity: emotionalCapacity,
          seeking_support: seekingSupport,
          willing_to_listen: willingToListen,
          notes: notes.trim() || null,
        })

      if (moodError) throw moodError

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          emotional_capacity: emotionalCapacity,
          last_active: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      onMoodSubmitted()
    } catch (error) {
      console.error('Error submitting mood:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-secondary-900/20 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="glassmorphic rounded-3xl p-8 w-full max-w-md shadow-2xl shadow-secondary-900/20"
        >
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-bold text-secondary-800">Daily Check-in</h2>
              <p className="text-base text-secondary-600 mt-1">How are you feeling right now?</p>
            </div>
            <motion.button
              onClick={onClose}
              className="p-3 text-secondary-500 hover:bg-secondary-100/70 hover:text-secondary-700 rounded-full transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </motion.button>
          </div>

          {/* Mood Scale */}
          <div className="mb-10">
            <div className="text-center mb-6">
              <motion.div
                className="text-7xl mb-3 transition-transform duration-300 ease-out"
                style={{ transform: `scale(${1 + (moodScore - 5) / 20})` }}
                key={moodScore}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 + (moodScore - 5) / 20 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {moodEmojis[moodScore - 1]}
              </motion.div>
              <div className="text-2xl font-bold text-secondary-800">{moodLabels[moodScore - 1]}</div>
              <div className="text-base text-secondary-500 font-medium mt-1">
                {moodScore}/10
              </div>
            </div>

            <div className="space-y-4">
              <input
                type="range"
                min="1"
                max="10"
                value={moodScore}
                onChange={(e) => setMoodScore(parseInt(e.target.value))}
                className="w-full h-3 bg-secondary-200 rounded-full appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, rgb(14 165 233) 0%, rgb(14 165 233) ${(moodScore - 1) * 11.11}%, rgb(148 163 184) ${(moodScore - 1) * 11.11}%, rgb(148 163 184) 100%)`
                }}
              />
            </div>
          </div>

          {/* Availability Options */}
          <div className="space-y-4 mb-10">
            <AvailabilityToggle
              icon="favorite"
              label="Seeking Support"
              description="I could use someone to listen"
              checked={seekingSupport}
              onChange={setSeekingSupport}
            />
            <AvailabilityToggle
              icon="headphones"
              label="Willing to Listen"
              description="I can support others right now"
              checked={willingToListen}
              onChange={setWillingToListen}
            />
          </div>

          {/* Notes */}
          <div className="mb-10">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add a private note... (optional)"
              className="w-full p-4 border border-secondary-200/80 rounded-xl bg-white/60 backdrop-blur-sm resize-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all duration-300 shadow-inner text-secondary-700 placeholder-secondary-400 font-medium"
              rows={3}
              maxLength={200}
            />
          </div>

          {/* Submit Button */}
          <motion.button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-300 flex items-center justify-center gap-3 text-lg disabled:opacity-50 disabled:scale-100"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? <LoadingSpinner size="sm" /> : (
              <>
                <span className="material-symbols-outlined text-xl">check_circle</span>
                Update Mood
              </>
            )}
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

const AvailabilityToggle = ({ icon, label, description, checked, onChange }: { icon: string; label: string; description: string; checked: boolean; onChange: (checked: boolean) => void }) => (
  <motion.div
    onClick={() => onChange(!checked)}
    className={`flex items-center justify-between p-5 border rounded-2xl cursor-pointer transition-all duration-300 glassmorphic ${
      checked
        ? 'bg-white/80 border-primary-300 shadow-lg shadow-primary-500/20 ring-2 ring-primary-400/50'
        : 'bg-white/40 border-secondary-200/60 hover:border-secondary-300 hover:bg-white/60'
    }`}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <div className="flex items-center space-x-4">
      <div className={`p-3 rounded-full transition-all duration-300 ${checked ? 'bg-primary-100 shadow-sm' : 'bg-secondary-100'}`}>
        <span className={`material-symbols-outlined text-xl transition-colors duration-300 ${checked ? 'text-primary-600' : 'text-secondary-500'}`}>
          {icon}
        </span>
      </div>
      <div>
        <div className={`font-semibold transition-colors duration-300 ${checked ? 'text-secondary-800' : 'text-secondary-700'}`}>{label}</div>
        <div className={`text-sm transition-colors duration-300 ${checked ? 'text-secondary-600' : 'text-secondary-500'}`}>{description}</div>
      </div>
    </div>
    <div className={`w-12 h-7 flex items-center rounded-full p-1 transition-all duration-300 ${checked ? 'bg-primary-500 shadow-sm' : 'bg-secondary-300'}`}>
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 700, damping: 30 }}
        className="w-5 h-5 bg-white rounded-full shadow-sm"
      />
    </div>
  </motion.div>
)
