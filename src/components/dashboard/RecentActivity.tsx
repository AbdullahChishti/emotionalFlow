'use client'

import { ListeningSession, Profile } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { Heart, Ear, Clock, Star, TrendingUp, TrendingDown } from 'lucide-react'
import { formatDuration, cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface RecentActivityProps {
  sessions: ListeningSession[]
  userId: string
}

type SessionWithProfiles = ListeningSession & {
  speaker: Profile | null
  listener: Profile | null
}

interface SessionItemProps {
  session: SessionWithProfiles
  isListener: boolean
}

function SessionItem({ session, isListener }: SessionItemProps) {
  const rating = isListener ? session.listener_rating : session.speaker_rating

  return (
    <div className="flex items-start space-x-4 p-4 rounded-2xl hover:bg-muted/50 transition-colors">
      <div className={cn(
        "w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center",
        isListener ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'
      )}>
        {isListener ? <Ear className="w-5 h-5" /> : <Heart className="w-5 h-5" />}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-foreground">
              {isListener ? 'Listened to someone' : 'Received support'}
            </h4>
            <p className="text-sm text-muted-foreground">
              {session.session_type} mode • {isListener ? session.speaker?.display_name : session.listener?.display_name || 'Anonymous'}
            </p>
          </div>
          <div className="text-right flex-shrink-0 ml-4">
            <div className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-2 text-sm">
          <div className="flex items-center space-x-4 text-muted-foreground">
            {session.duration_minutes > 0 && (
              <span className="flex items-center space-x-1.5">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(session.duration_minutes)}</span>
              </span>
            )}
            
            <span className={cn(
              "font-medium flex items-center space-x-1.5",
              isListener ? 'text-green-500' : 'text-blue-500'
            )}>
              {isListener ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{isListener ? '+' : '-'}{session.credits_transferred} credits</span>
            </span>
          </div>
          
          {rating && (
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-4 h-4",
                    i < rating ? 'text-yellow-400 fill-current' : 'text-muted-foreground/30'
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function RecentActivity({ sessions, userId }: RecentActivityProps) {
  if (sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No sessions yet</h3>
            <p className="text-muted-foreground">
              Your recent sessions will appear here once you've had one.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sessions.map((session) => (
            <SessionItem 
              key={session.id} 
              session={session as SessionWithProfiles} 
              isListener={session.listener_id === userId} 
            />
          ))}
        </div>
        <div className="mt-6 text-center">
          <button className="text-sm font-medium text-primary hover:underline">
            View All Activity
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
