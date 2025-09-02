'use client'

import React from 'react'
import { motion } from 'framer-motion'
// Material Symbols icons import
import 'material-symbols/outlined.css'

interface NavigationParams {
  mode?: 'listen' | 'support'
}

interface WalletScreenProps {
  onNavigate: (screen: string, params?: NavigationParams) => void
}

const transactions = [
  {
    id: 1, type: 'received', amount: 50, description: 'From a listening session',
    source: 'From Alex', time: '2h ago',
  },
  {
    id: 2, type: 'sent', amount: 30, description: 'For a support session',
    source: 'To Sarah', time: '5h ago',
  },
  {
    id: 3, type: 'received', amount: 100, description: 'From a listening session',
    source: 'From EmpatheticSoul', time: '1d ago',
  },
  {
    id: 4, type: 'sent', amount: 60, description: 'For a support session',
    source: 'To MindfulListener', time: '2d ago',
  },
  {
    id: 5, type: 'received', amount: 25, description: 'From a listening session',
    source: 'From KindHeart', time: '3d ago',
  },
]

const totalBalance = transactions.reduce((acc, t) => acc + (t.type === 'received' ? t.amount : -t.amount), 0)
const totalReceived = transactions.filter(t => t.type === 'received').reduce((sum, t) => sum + t.amount, 0)
const totalSent = transactions.filter(t => t.type === 'sent').reduce((sum, t) => sum + t.amount, 0)

export function WalletScreen({ onNavigate }: WalletScreenProps) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-brand-green-50 via-white to-brand-green-100 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute rounded-full opacity-20"
          style={{
            width: 250,
            height: 250,
            background: 'radial-gradient(circle, rgba(51, 95, 100, 0.15) 0%, transparent 70%)',
            filter: 'blur(50px)',
            top: '15%',
            left: '10%'
          }}
          animate={{
            y: [0, -25, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        <motion.div
          className="absolute rounded-full opacity-20"
          style={{
            width: 200,
            height: 200,
            background: 'radial-gradient(circle, rgba(51, 95, 100, 0.15) 0%, transparent 70%)',
            filter: 'blur(50px)',
            bottom: '20%',
            right: '15%'
          }}
          animate={{
            y: [0, -25, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 7
          }}
        />
      </div>

      {/* Header */}
      <header className="relative flex items-center justify-center p-6 glassmorphic z-10">
        <div className="text-center">
          <motion.div
            className="flex items-center justify-center gap-3 mb-2"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <span className="material-symbols-outlined text-3xl text-brand-green-600">psychology</span>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-brand-green-600 to-brand-green-700 bg-clip-text text-transparent">
              MindWell
            </h1>
          </motion.div>
          <h2 className="text-lg font-semibold text-secondary-800">Your Wallet</h2>
        </div>
      </header>

      <main className="relative flex-1 flex flex-col p-6 z-0 overflow-y-auto">
        <div className="w-full max-w-2xl mx-auto">
          {/* Main Balance Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="glassmorphic rounded-3xl p-8 mb-8 text-center shadow-2xl shadow-secondary-900/20 relative overflow-hidden"
            whileHover={{ scale: 1.02 }}
          >
            <div className="absolute top-6 right-6 p-3 bg-brand-green-100/80 rounded-full border border-brand-green-200/60">
                <span className="material-symbols-outlined text-2xl text-brand-green-600">monetization_on</span>
            </div>
            <p className="text-base text-secondary-600 mb-2 font-medium">Your Balance</p>
            <p className="text-6xl font-bold text-secondary-800 tracking-tight mb-2">{totalBalance}</p>
            <p className="text-2xl text-secondary-500 font-medium">empathy credits</p>
          </motion.div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 gap-6 mb-10">
            <StatCard icon="arrow_downward" label="Received" value={totalReceived} color="text-green-600" />
            <StatCard icon="arrow_upward" label="Sent" value={totalSent} color="text-brand-green-600" />
          </div>

          {/* Transaction History */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-2xl text-secondary-600">history</span>
              <h2 className="text-xl font-bold text-secondary-800">Transaction History</h2>
            </div>
            <div className="space-y-4">
              {transactions.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05, ease: 'easeOut' }}
                >
                  <TransactionItem {...transaction} />
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-12 text-center">
            <motion.button
              onClick={() => onNavigate('Welcome')}
              className="w-full max-w-sm mx-auto py-4 bg-gradient-to-r from-brand-green-500 to-brand-green-600 text-white rounded-xl font-bold shadow-lg shadow-brand-green-500/30 hover:shadow-xl hover:shadow-brand-green-500/40 transition-all duration-300 flex items-center justify-center gap-3 text-lg"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="material-symbols-outlined text-xl">psychology</span>
              Start a New Session
            </motion.button>
          </div>
        </div>
      </main>
    </div>
  )
}

const StatCard = ({ icon, label, value, color }: { icon: string; label: string; value: number; color: string }) => (
  <motion.div
    className="glassmorphic rounded-2xl p-6 flex items-center gap-4"
    whileHover={{ scale: 1.05 }}
    transition={{ duration: 0.2 }}
  >
    <div className={`p-3 rounded-full bg-brand-green-100/60 border border-brand-green-200/60`}>
      <span className={`material-symbols-outlined text-2xl ${color}`}>{icon}</span>
    </div>
    <div>
      <p className={`text-3xl font-bold ${color}`}>{label === 'Received' ? '+' : '-'}{value}</p>
      <p className="text-sm text-secondary-600 font-medium">{label}</p>
    </div>
  </motion.div>
)

const TransactionItem = ({ type, amount, description, source, time }: { type: string; amount: number; description: string; source: string; time: string }) => (
  <motion.div
    className="glassmorphic rounded-2xl p-5 flex items-center hover:shadow-lg transition-all duration-300"
    whileHover={{ scale: 1.02 }}
    transition={{ duration: 0.2 }}
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-5 ${ type === 'received' ? 'bg-green-100/80 text-green-600' : 'bg-brand-green-100/80 text-brand-green-600' } border border-opacity-30 ${ type === 'received' ? 'border-green-200' : 'border-brand-green-200' }`}>
      <span className="material-symbols-outlined text-xl">{type === 'received' ? 'arrow_downward' : 'arrow_upward'}</span>
    </div>
    <div className="flex-1">
      <p className="font-semibold text-secondary-800 text-base">{description}</p>
      <p className="text-sm text-secondary-600">{source}</p>
    </div>
    <div className="text-right">
      <p className={`font-bold text-xl ${ type === 'received' ? 'text-green-600' : 'text-brand-green-600' }`}>
        {type === 'received' ? '+' : '-'}{amount}
      </p>
      <p className="text-xs text-secondary-500 font-medium">{time}</p>
    </div>
  </motion.div>
)
