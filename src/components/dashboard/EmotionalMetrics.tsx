'use client'

import { Profile, MoodEntry, ListeningSession } from '@/types'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { TrendingUp, TrendingDown, Heart, Shield, BrainCircuit } from 'lucide-react'
import { calculateBurnoutRisk, getMoodColor, cn } from '@/lib/utils'
import { format, subDays } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'

interface EmotionalMetricsProps {
  profile: Profile
  recentMoods: MoodEntry[]
  recentSessions: ListeningSession[]
}

interface WellnessScoreProps {
  profile: Profile
  recentSessions: ListeningSession[]
}

interface MoodChartProps {
  recentMoods: MoodEntry[]
}

function WellnessScore({ profile, recentSessions }: WellnessScoreProps) {
  const givingReceivingRatio = profile.total_credits_spent > 0 
    ? profile.total_credits_earned / profile.total_credits_spent 
    : profile.total_credits_earned > 0 ? Infinity : 1;

  const recentSessionsCount = recentSessions.filter(
    session => new Date(session.created_at) > subDays(new Date(), 7)
  ).length;

  const burnoutRisk = calculateBurnoutRisk(
    givingReceivingRatio,
    recentSessionsCount,
    profile.emotional_capacity
  );
  
  const wellnessScore = 100 - burnoutRisk;

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Wellness Score</CardTitle>
        <CardDescription>A measure of your emotional balance.</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center p-6">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full" viewBox="0 0 36 36">
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              className="stroke-current text-muted/20"
              strokeWidth="3" fill="none"
            />
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              className={cn("stroke-current transition-all duration-500", getScoreColor(wellnessScore))}
              strokeWidth="3" fill="none"
              strokeDasharray={`${wellnessScore}, 100`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-4xl font-bold", getScoreColor(wellnessScore))}>
              {wellnessScore}
            </span>
            <span className="text-sm text-muted-foreground">out of 100</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MoodChart({ recentMoods }: MoodChartProps) {
    const moodChartData = recentMoods
    .slice(0, 7)
    .reverse()
    .map((mood, index) => ({
      day: format(new Date(mood.created_at), 'MMM dd'),
      mood: mood.mood_score
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mood Trends</CardTitle>
        <CardDescription>Your mood over the last 7 entries.</CardDescription>
      </CardHeader>
      <CardContent>
        {moodChartData.length > 1 ? (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={moodChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <XAxis 
                  dataKey="day" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  domain={[1, 10]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)'
                  }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="mood" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ r: 4, fill: 'hsl(var(--primary))' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-center">
            <div>
              <BrainCircuit className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">Not enough mood data to display a trend.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function EmotionalMetrics({ profile, recentMoods, recentSessions }: EmotionalMetricsProps) {
  return (
    <div className="space-y-6">
      <WellnessScore profile={profile} recentSessions={recentSessions} />
      <MoodChart recentMoods={recentMoods} />
    </div>
  )
}
