'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const moodData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Mood',
      data: [60, 75, 65, 80, 70, 85, 90],
      borderColor: 'var(--color-primary)',
      backgroundColor: 'rgba(0, 113, 227, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#FFFFFF',
      pointBorderColor: 'var(--color-primary)',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    },
  ],
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1D1D1F',
      padding: 12,
      borderRadius: 8,
      titleColor: '#FFFFFF',
      bodyColor: '#FFFFFF',
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
      grid: { color: '#E8E8ED', drawBorder: false },
      ticks: { color: '#86868B', font: { size: 12 } },
    },
    x: {
      grid: { display: false },
      ticks: { color: '#86868B', font: { size: 12 } },
    },
  },
}

export default function ProgressDashboardScreen() {
  const streak = 7

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header - Aesthetic & Minimal */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-1 bg-gradient-to-r from-transparent via-[#0071E3]/30 to-transparent mb-8 mx-auto rounded-full" />
          <h1 className="text-4xl font-medium text-[#1D1D1F] mb-3 tracking-tight">
            Your Progress
          </h1>
          <p className="text-[#86868B] font-light text-lg">
            Track your wellness journey
          </p>
        </motion.div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mood Chart - Takes 2 columns */}
          <motion.div
            className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-[#E8E8ED]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[var(--color-primary)]/10 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-[var(--color-primary)]">show_chart</span>
              </div>
              <h2 className="text-xl font-medium text-[#1D1D1F]">Mood Trend</h2>
            </div>
            <div className="h-64">
              <Line options={chartOptions} data={moodData} />
            </div>
          </motion.div>

          {/* Streak Card - Artistic */}
          <motion.div
            className="bg-gradient-to-br from-[var(--color-primary-gradient-from)] to-[var(--color-primary-gradient-to)] rounded-3xl p-8 shadow-lg text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-center">
              <span className="material-symbols-outlined text-5xl mb-4 block opacity-90">local_fire_department</span>
              <h2 className="text-lg font-normal mb-2 opacity-90">Daily Streak</h2>
              <p className="text-6xl font-light my-4">{streak}</p>
              <p className="text-sm opacity-75 mb-6">days in a row</p>

              {/* Progress bar */}
              <div className="w-full bg-white/20 rounded-full h-2">
                <motion.div
                  className="bg-white h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(streak / 30) * 100}%` }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />
              </div>
              <p className="text-xs mt-3 opacity-75">Keep going! 🎉</p>
            </div>
          </motion.div>
        </div>

        {/* Stats Grid - Minimal & Clean */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {[
            { icon: 'trending_up', label: 'This Week', value: '+15%', color: 'text-[#34C759]' },
            { icon: 'self_improvement', label: 'Sessions', value: '24', color: 'text-[var(--color-primary)]' },
            { icon: 'schedule', label: 'Avg. Mood', value: '7.8', color: 'text-[#FF9500]' },
            { icon: 'emoji_events', label: 'Achievements', value: '12', color: 'text-[#AF52DE]' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="bg-white rounded-2xl p-6 text-center shadow-sm border border-[#E8E8ED]"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <span className={`material-symbols-outlined text-3xl ${stat.color} mb-2 block`}>
                {stat.icon}
              </span>
              <p className="text-2xl font-light text-[#1D1D1F] mb-1">{stat.value}</p>
              <p className="text-xs text-[#86868B] uppercase tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
