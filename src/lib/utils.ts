import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCredits(credits: number): string {
  return credits.toLocaleString()
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

export function calculateBurnoutRisk(
  givingReceivingRatio: number,
  recentSessions: number,
  emotionalCapacity: 'low' | 'medium' | 'high'
): number {
  let risk = 0
  
  // High giving ratio increases risk
  if (givingReceivingRatio > 2) {
    risk += 30
  } else if (givingReceivingRatio > 1.5) {
    risk += 15
  }
  
  // Too many recent sessions
  if (recentSessions > 10) {
    risk += 25
  } else if (recentSessions > 5) {
    risk += 10
  }
  
  // Low emotional capacity increases risk
  if (emotionalCapacity === 'low') {
    risk += 20
  } else if (emotionalCapacity === 'medium') {
    risk += 10
  }
  
  return Math.min(risk, 100)
}

export function getMoodColor(mood: number): string {
  if (mood >= 8) return 'text-green-500'
  if (mood >= 6) return 'text-yellow-500'
  if (mood >= 4) return 'text-orange-500'
  return 'text-red-500'
}

export function getEmotionalCapacityColor(capacity: 'low' | 'medium' | 'high'): string {
  switch (capacity) {
    case 'high': return 'text-green-500'
    case 'medium': return 'text-yellow-500'
    case 'low': return 'text-red-500'
  }
}
