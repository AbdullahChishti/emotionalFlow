'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, Ear } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
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
        className="fixed inset-0 bg-zinc-900/20 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="bg-stone-50 rounded-2xl p-6 w-full max-w-md border border-zinc-200/80 shadow-2xl shadow-zinc-900/10"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-light text-zinc-800">Check-in</h2>
              <p className="text-sm text-zinc-500">How are you feeling right now?</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-zinc-500 hover:bg-zinc-200/70 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mood Scale */}
          <div className="mb-8">
            <div className="text-center mb-4">
              <div className="text-6xl mb-2 transition-transform duration-300 ease-out" style={{ transform: `scale(${1 + (moodScore - 5) / 20})` }}>
                {moodEmojis[moodScore - 1]}
              </div>
              <div className="text-xl font-medium text-zinc-700">{moodLabels[moodScore - 1]}</div>
              <div className="text-sm text-zinc-400 font-mono">
                {moodScore}/10
              </div>
            </div>

            <div className="space-y-2">
              <input
                type="range"
                min="1"
                max="10"
                value={moodScore}
                onChange={(e) => setMoodScore(parseInt(e.target.value))}
                className="w-full h-2 bg-zinc-200/80 rounded-lg appearance-none cursor-pointer mood-slider"
              />
            </div>
          </div>

          {/* Availability Options */}
          <div className="space-y-3 mb-8">
            <AvailabilityToggle
              icon={Heart}
              label="Seeking Support"
              description="I could use someone to listen"
              checked={seekingSupport}
              onChange={setSeekingSupport}
            />
            <AvailabilityToggle
              icon={Ear}
              label="Willing to Listen"
              description="I can support others right now"
              checked={willingToListen}
              onChange={setWillingToListen}
            />
          </div>

          {/* Notes */}
          <div className="mb-8">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add a private note..."
              className="w-full p-3 border border-zinc-200/80 rounded-lg bg-white/50 resize-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-shadow,border-color duration-200 shadow-inner-sm text-zinc-700 placeholder-zinc-400"
              rows={2}
              maxLength={200}
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:scale-100"
          >
            {loading ? <LoadingSpinner size="sm" /> : 'Update Mood'}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

const AvailabilityToggle = ({ icon: Icon, label, description, checked, onChange }: any) => (
  <div
    onClick={() => onChange(!checked)}
    className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all duration-300 ${ 
      checked 
        ? 'bg-white border-transparent shadow-lg shadow-indigo-500/10 ring-2 ring-indigo-400'
        : 'bg-white/60 border-zinc-200/80 hover:border-zinc-300 hover:bg-white'
    }`}
  >
    <div className="flex items-center space-x-4">
      <div className={`p-2 rounded-full transition-colors duration-300 ${checked ? 'bg-indigo-100' : 'bg-zinc-100'}`}>
        <Icon className={`w-5 h-5 transition-colors duration-300 ${checked ? 'text-indigo-500' : 'text-zinc-500'}`} />
      </div>
      <div>
        <div className={`font-medium transition-colors duration-300 ${checked ? 'text-zinc-800' : 'text-zinc-700'}`}>{label}</div>
        <div className={`text-sm transition-colors duration-300 ${checked ? 'text-zinc-600' : 'text-zinc-500'}`}>{description}</div>
      </div>
    </div>
    <div className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${checked ? 'bg-indigo-500' : 'bg-zinc-300'}`}>
      <motion.div 
        layout 
        transition={{ type: 'spring', stiffness: 700, damping: 30 }}
        className="w-5 h-5 bg-white rounded-full shadow-sm"
      />
    </div>
  </div>
)
