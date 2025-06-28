'use client'

import { motion } from 'framer-motion'
import { Heart, TrendingUp, TrendingDown, Coins, Star, LucideIcon } from 'lucide-react'
import { formatCredits } from '@/lib/utils'

interface CreditBalanceProps {
  credits: number
  totalEarned: number
  totalSpent: number
}

interface StatCardProps {
  icon: LucideIcon
  title: string
  value: number
  color: string
  gradient: string
}

function StatCard({ icon: Icon, title, value, color, gradient }: StatCardProps) {
  return (
    <div className={`p-6 rounded-2xl bg-gradient-to-br ${gradient}`}>
      <div className="flex items-center space-x-3 mb-2">
        <Icon className={`w-5 h-5 ${color}`} />
        <span className="text-sm font-medium text-white/80">{title}</span>
      </div>
      <p className="text-3xl font-bold text-white">{formatCredits(value)}</p>
    </div>
  )
}

export function CreditBalance({ credits, totalEarned, totalSpent }: CreditBalanceProps) {
  const ratio = totalSpent > 0 ? totalEarned / totalSpent : totalEarned > 0 ? Infinity : 1

  const getRatioHealth = (ratio: number) => {
    if (ratio === Infinity || ratio >= 1.2) return { text: 'Healthy Balance', color: 'text-green-400' }
    if (ratio >= 0.8) return { text: 'Needs Attention', color: 'text-yellow-400' }
    return { text: 'Unbalanced', color: 'text-red-400' }
  }
  const ratioHealth = getRatioHealth(ratio)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      {/* Main Balance */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-primary via-slate-800 to-primary text-primary-foreground shadow-2xl shadow-primary/20">
        <motion.div 
          className="flex items-center justify-between mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-xl font-medium">Your Empathy Credits</h2>
          <Star className="w-6 h-6 text-yellow-300" />
        </motion.div>
        
        <motion.p 
          className="text-7xl font-bold mb-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {formatCredits(credits)}
        </motion.p>
        
        <p className="text-sm text-primary-foreground/70 mb-8">
          {credits >= 10 ? 'Ready to seek support when you need it.' : 'Earn more by listening to others.'}
        </p>

        <div className="mt-6 pt-6 border-t border-primary-foreground/10">
            <h3 className="font-semibold text-primary-foreground/90 mb-2">Giving/Receiving Ratio</h3>
            <p className={`text-lg font-medium ${ratioHealth.color}`}>{ratioHealth.text}</p>
        </div>
      </div>
      
      {/* Stats */}
      <div className="space-y-6">
        <StatCard 
          icon={TrendingUp}
          title="Total Earned"
          value={totalEarned}
          color="text-green-300"
          gradient="from-green-500/20 to-secondary/20"
        />
        <StatCard 
          icon={TrendingDown}
          title="Total Spent"
          value={totalSpent}
          color="text-blue-300"
          gradient="from-blue-500/20 to-secondary/20"
        />
      </div>
    </div>
  )
}
