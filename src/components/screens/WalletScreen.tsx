'use client'

import { motion } from 'framer-motion'
import { ChevronLeft, ArrowUp, ArrowDown, Coins, TrendingUp, Heart } from 'lucide-react'
import SketchbookBackground from '../ui/SketchbookBackground'

interface WalletScreenProps {
  onNavigate: (screen: string, params?: any) => void
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
    <div className="min-h-screen flex flex-col bg-stone-50 font-sans">
      <SketchbookBackground />
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-stone-50/80 backdrop-blur-sm border-b border-zinc-200/80 z-10">
        <button onClick={() => onNavigate('Welcome')} className="p-2 text-zinc-600 hover:bg-zinc-200/70 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-medium text-zinc-800 tracking-tight">Wallet</h1>
        <div className="w-10" />
      </header>

      <main className="flex-1 flex flex-col p-4 md:p-6 z-0 overflow-y-auto">
        <div className="w-full max-w-2xl mx-auto">
          {/* Main Balance Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="bg-white/70 border border-zinc-200/80 rounded-2xl p-6 mb-6 text-center shadow-lg shadow-zinc-900/5 relative"
          >
            <div className="absolute top-4 right-4 p-2 bg-amber-100/80 rounded-full border border-amber-200/80">
                <Coins className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-sm text-zinc-500 mb-1">Your Balance</p>
            <p className="text-5xl font-light text-zinc-800 tracking-tight">{totalBalance} <span className="text-3xl text-zinc-400">credits</span></p>
          </motion.div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <StatCard icon={ArrowDown} label="Received" value={totalReceived} color="text-emerald-600" bgColor="bg-emerald-50" borderColor="border-emerald-200/80" />
            <StatCard icon={ArrowUp} label="Sent" value={totalSent} color="text-sky-600" bgColor="bg-sky-50" borderColor="border-sky-200/80" />
          </div>

          {/* Transaction History */}
          <div>
            <h2 className="text-lg font-medium text-zinc-700 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-zinc-400" />
              History
            </h2>
            <div className="space-y-3">
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

          <div className="mt-8 text-center">
            <button
              onClick={() => onNavigate('Welcome')}
              className="w-full max-w-sm mx-auto py-3 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 text-lg"
            >
              Start a New Session
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

const StatCard = ({ icon: Icon, label, value, color, bgColor, borderColor }: any) => (
  <div className={`p-4 rounded-2xl border ${bgColor} ${borderColor}`}>
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-full ${color.replace('text-', 'bg-').replace('-600', '-100/80')}`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <p className={`text-2xl font-medium ${color}`}>{label === 'Received' ? '+' : '-'}{value}</p>
        <p className="text-sm text-zinc-500 -mt-1">{label}</p>
      </div>
    </div>
  </div>
)

const TransactionItem = ({ type, amount, description, source, time }: any) => (
  <div className="flex items-center p-3 bg-white/60 border border-zinc-200/80 rounded-xl hover:bg-white/100 hover:border-zinc-300/80 transition-colors duration-200">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${ type === 'received' ? 'bg-emerald-100/80 text-emerald-700' : 'bg-sky-100/80 text-sky-700' }`}>
      {type === 'received' ? <ArrowDown className="w-5 h-5" /> : <ArrowUp className="w-5 h-5" />}
    </div>
    <div className="flex-1">
      <p className="font-medium text-zinc-800">{description}</p>
      <p className="text-sm text-zinc-500">{source}</p>
    </div>
    <div className="text-right">
      <p className={`font-semibold text-lg ${ type === 'received' ? 'text-emerald-600' : 'text-sky-600' }`}>
        {type === 'received' ? '+' : '-'}{amount}
      </p>
      <p className="text-xs text-zinc-400">{time}</p>
    </div>
  </div>
)
