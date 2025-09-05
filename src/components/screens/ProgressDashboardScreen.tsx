'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const moodData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Mood Trend',
      data: [60, 75, 65, 80, 70, 85, 90],
      borderColor: 'rgba(14, 165, 233, 0.8)',
      backgroundColor: 'rgba(14, 165, 233, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: 'white',
      pointBorderColor: 'rgba(14, 165, 233, 1)',
      pointRadius: 5,
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
      grid: { color: 'rgba(148, 163, 184, 0.1)' },
      ticks: { color: '#64748b' },
    },
    x: {
      grid: { display: false },
      ticks: { color: '#64748b' },
    },
  },
};

export default function ProgressDashboardScreen() {
  const streak = 7;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-primary-100 via-white to-primary-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute rounded-full opacity-20"
          style={{
            width: 300,
            height: 300,
            background: 'radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%)',
            filter: 'blur(60px)',
            top: '10%',
            right: '10%'
          }}
          animate={{
            y: [0, -30, 0],
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
            width: 250,
            height: 250,
            background: 'radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%)',
            filter: 'blur(60px)',
            bottom: '20%',
            left: '15%'
          }}
          animate={{
            y: [0, -30, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 8
          }}
        />
      </div>

      <motion.div
        className="relative w-full max-w-6xl mx-auto p-4 sm:p-6 md:p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <motion.header
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="flex items-center justify-center gap-3 mb-4"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <span className="material-symbols-outlined text-4xl text-primary-600">psychology</span>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
              MindWell
            </h1>
          </motion.div>
          <h2 className="text-3xl font-semibold text-secondary-800 mb-2">Your Progress Dashboard</h2>
          <p className="text-secondary-600 max-w-2xl mx-auto">Track your emotional wellness journey and celebrate your growth</p>
        </motion.header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Mood Trend Chart */}
          <motion.div
            className="md:col-span-2 glassmorphic rounded-3xl shadow-xl p-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-3xl text-primary-600">show_chart</span>
              <h2 className="text-2xl font-bold text-secondary-800">Mood Trend</h2>
            </div>
            <div className="h-80">
              <Line options={chartOptions} data={moodData} />
            </div>
          </motion.div>

          {/* Streaks Card */}
          <motion.div
            className="glassmorphic rounded-3xl shadow-xl p-8 flex flex-col items-center justify-center text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
          >
            <span className="material-symbols-outlined text-5xl text-amber-500 mb-4">local_fire_department</span>
            <h2 className="text-2xl font-bold text-secondary-800 mb-2">Daily Streak</h2>
            <p className="text-6xl font-extrabold text-primary-600 my-3">{streak}</p>
            <p className="text-secondary-600 mb-6">days in a row!</p>
            <div className="w-full bg-primary-100 rounded-full h-3">
              <motion.div
                className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full shadow-sm"
                initial={{ width: 0 }}
                animate={{ width: `${(streak / 30) * 100}%` }} // Example: 30 day goal
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </div>
            <p className="text-sm text-secondary-500 mt-2">Keep it up! 🎉</p>
          </motion.div>
        </div>

        {/* Quick Stats Row */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {[
            { icon: 'trending_up', label: 'This Week', value: '+15%', color: 'text-green-600' },
            { icon: 'self_improvement', label: 'Sessions', value: '24', color: 'text-primary-600' },
            { icon: 'schedule', label: 'Avg. Mood', value: '7.8/10', color: 'text-amber-600' },
            { icon: 'emoji_events', label: 'Achievements', value: '12', color: 'text-purple-600' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="glassmorphic rounded-2xl p-6 text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <span className={`material-symbols-outlined text-3xl ${stat.color} mb-2 block`}>{stat.icon}</span>
              <p className="text-2xl font-bold text-secondary-800">{stat.value}</p>
              <p className="text-sm text-secondary-600">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

      </motion.div>
    </div>
  )
}
