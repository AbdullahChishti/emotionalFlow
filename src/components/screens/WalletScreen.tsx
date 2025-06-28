'use client'

import { motion } from 'framer-motion'
import { ChevronLeft, ArrowUp, ArrowDown, Coins, TrendingUp, Heart } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface WalletScreenProps {
  onNavigate: (screen: string, params?: any) => void
}

export function WalletScreen({ onNavigate }: WalletScreenProps) {
  const transactions = [
    {
      id: 1,
      type: 'received',
      amount: 50,
      description: 'Credits Received',
      source: 'From Alex',
      time: '2h ago',
    },
    {
      id: 2,
      type: 'sent',
      amount: 30,
      description: 'Credits Sent',
      source: 'To Sarah',
      time: '5h ago',
    },
    {
      id: 3,
      type: 'received',
      amount: 100,
      description: 'Credits Received',
      source: 'From EmpatheticSoul',
      time: '1d ago',
    },
    {
      id: 4,
      type: 'sent',
      amount: 60,
      description: 'Credits Sent',
      source: 'To MindfulListener',
      time: '2d ago',
    },
  ]

  const totalBalance = 120
  const totalReceived = transactions.filter(t => t.type === 'received').reduce((sum, t) => sum + t.amount, 0)
  const totalSent = transactions.filter(t => t.type === 'sent').reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Background gradients matching landing page */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/30 via-transparent to-green-50/30" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-violet-200/40 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-blue-200/40 to-transparent rounded-full blur-3xl" />
      {/* Header */}
      <div className="flex items-center justify-between p-4 md:p-6 bg-white/60 backdrop-blur-sm border-b border-white/20 relative z-10">
        <button
          onClick={() => onNavigate('Welcome')}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </button>
        <h1 className="text-lg md:text-xl font-light text-foreground tracking-tight">
          Emotional Wallet
        </h1>
        <div className="w-10" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative px-2 md:px-6 py-4 md:py-8 z-10">
        {/* Main Balance */}
        <div className="flex flex-col items-center mb-8 md:mb-12">
          <div className="relative">
            <div className="w-40 h-40 md:w-56 md:h-56 rounded-full bg-white/80 shadow-2xl shadow-primary/10 flex flex-col items-center justify-center border-4 border-white/40 backdrop-blur-xl">
              <span className="text-5xl md:text-6xl font-bold text-foreground mb-2">{totalBalance}</span>
              <span className="text-lg md:text-xl text-muted-foreground font-light">Credits</span>
            </div>
            <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
              <Coins className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="flex flex-row gap-6 mb-8 md:mb-12 w-full max-w-xl justify-center">
          <div className="flex-1 bg-white/80 rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center border border-white/30 backdrop-blur-xl">
            <ArrowDown className="w-6 h-6 text-green-500 mb-2" />
            <span className="text-2xl font-semibold text-green-600">+{totalReceived}</span>
            <span className="text-sm text-muted-foreground">Credits Received</span>
          </div>
          <div className="flex-1 bg-white/80 rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center border border-white/30 backdrop-blur-xl">
            <ArrowUp className="w-6 h-6 text-blue-500 mb-2" />
            <span className="text-2xl font-semibold text-blue-600">-{totalSent}</span>
            <span className="text-sm text-muted-foreground">Credits Sent</span>
          </div>
        </div>

        {/* Empathy Credits Info */}
        <div className="flex items-center gap-3 mb-8 md:mb-12">
          <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
            <Heart className="w-5 h-5 text-pink-500" />
          </div>
          <div>
            <div className="text-base font-medium text-foreground">Empathy Credits</div>
            <div className="text-xs text-muted-foreground">Give empathy to earn more credits and spread kindness</div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="w-full max-w-xl">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-text-secondary" />
            <h2 className="text-lg font-semibold text-text-primary">Give & Receive History</h2>
          </div>
          <div className="bg-white/80 rounded-2xl shadow-lg border border-white/30 backdrop-blur-xl overflow-hidden">
            {transactions.map((transaction, index) => (
              <div
                key={transaction.id}
                className="flex items-center p-4 border-b border-border-light last:border-b-0 hover:bg-surface-secondary transition-colors"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${
                  transaction.type === 'received'
                    ? 'bg-status-success'
                    : 'bg-status-info'
                }`}>
                  {transaction.type === 'received' ? (
                    <ArrowDown className="w-5 h-5 text-text-primary" />
                  ) : (
                    <ArrowUp className="w-5 h-5 text-text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-text-primary text-base">
                    {transaction.description}
                  </div>
                  <div className="text-xs text-text-tertiary">
                    {transaction.source}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold text-base ${
                    transaction.type === 'received' ? 'text-status-success' : 'text-status-info'
                  }`}>
                    {transaction.type === 'received' ? '+' : '-'}{transaction.amount}
                  </div>
                  <div className="text-xs text-text-tertiary">
                    {transaction.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Button at the bottom with space above */}
      <div className="flex justify-center py-6 md:py-8 z-10">
        <Button
          onClick={() => onNavigate('Welcome')}
          variant="primary"
          size="lg"
        >
          Start New Session
        </Button>
      </div>
    </div>
  )
}
