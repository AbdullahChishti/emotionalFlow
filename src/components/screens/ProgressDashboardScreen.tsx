'use client'

import { motion } from 'framer-motion'
import { LineChart, Zap, TrendingUp, Award } from 'lucide-react'
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
      borderColor: 'rgba(168, 85, 247, 0.8)',
      backgroundColor: 'rgba(168, 85, 247, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: 'white',
      pointBorderColor: 'rgba(168, 85, 247, 1)',
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
      grid: { color: 'rgba(200, 200, 200, 0.1)' },
      ticks: { color: '#9ca3af' },
    },
    x: {
      grid: { display: false },
      ticks: { color: '#9ca3af' },
    },
  },
};

export function ProgressDashboardScreen() {
  const streak = 7;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-100 via-purple-100 to-green-100 font-sans p-4 sm:p-6 md:p-8">
      <motion.div 
        className="w-full max-w-4xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-zinc-700">Your Progress</h1>
          <p className="text-zinc-500 mt-1">Celebrate your journey of self-discovery.</p>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Mood Trend Chart */}
          <motion.div 
            className="md:col-span-2 bg-white/60 backdrop-blur-lg rounded-2xl shadow-lg shadow-purple-500/5 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <LineChart className="w-6 h-6 text-purple-500" />
              <h2 className="text-xl font-bold text-zinc-700">Mood Trend</h2>
            </div>
            <div className="h-64">
              <Line options={chartOptions} data={moodData} />
            </div>
          </motion.div>

          {/* Streaks Card */}
          <motion.div 
            className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-lg shadow-purple-500/5 p-6 flex flex-col items-center justify-center text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Zap className="w-8 h-8 text-yellow-500 mb-2" />
            <h2 className="text-xl font-bold text-zinc-700">Daily Streak</h2>
            <p className="text-5xl font-extrabold text-purple-600 my-2">{streak}</p>
            <p className="text-zinc-500">days in a row!</p>
            <div className="w-full bg-purple-200/50 rounded-full h-2.5 mt-4">
              <motion.div 
                className="bg-purple-500 h-2.5 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(streak / 30) * 100}%` }} // Example: 30 day goal
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        </div>

      </motion.div>
    </div>
  )
}
