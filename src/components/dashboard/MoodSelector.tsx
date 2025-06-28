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

  const moodEmojis = ['😢', '😔', '😕', '😐', '🙂', '😊', '😄', '😁', '🤩', '🥳']
  const moodLabels = [
    'Terrible', 'Very Bad', 'Bad', 'Poor', 'Okay', 
    'Good', 'Great', 'Excellent', 'Amazing', 'Euphoric'
  ]

  const getEmotionalCapacity = (mood: number): 'low' | 'medium' | 'high' => {
    if (mood <= 3) return 'low'
    if (mood <= 6) return 'medium'
    return 'high'
  }

  const handleSubmit = async () => {
    if (!user) return

    setLoading(true)
    try {
      const emotionalCapacity = getEmotionalCapacity(moodScore)

      // Insert mood entry
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

      // Update profile with current emotional capacity
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
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-card rounded-xl p-6 w-full max-w-md border border-border"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">How are you feeling?</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mood Scale */}
          <div className="mb-6">
            <div className="text-center mb-4">
              <div className="text-6xl mb-2">{moodEmojis[moodScore - 1]}</div>
              <div className="text-xl font-semibold">{moodLabels[moodScore - 1]}</div>
              <div className="text-sm text-muted-foreground">
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
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>
          </div>

          {/* Availability Options */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex items-center space-x-3">
                <Heart className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="font-medium">Seeking Support</div>
                  <div className="text-sm text-muted-foreground">
                    I could use someone to listen
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={seekingSupport}
                  onChange={(e) => setSeekingSupport(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex items-center space-x-3">
                <Ear className="w-5 h-5 text-green-500" />
                <div>
                  <div className="font-medium">Willing to Listen</div>
                  <div className="text-sm text-muted-foreground">
                    I can support others right now
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={willingToListen}
                  onChange={(e) => setWillingToListen(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything specific you'd like to share about how you're feeling..."
              className="w-full p-3 border border-border rounded-lg bg-background resize-none"
              rows={3}
              maxLength={200}
            />
            <div className="text-xs text-muted-foreground mt-1">
              {notes.length}/200 characters
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              'Update Mood'
            )}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
