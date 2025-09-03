export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          username: string | null
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          empathy_credits: number
          total_credits_earned: number
          total_credits_spent: number
          emotional_capacity: 'low' | 'medium' | 'high'
          preferred_mode: 'therapist' | 'friend' | 'both'
          is_anonymous: boolean
          last_active: string
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          empathy_credits?: number
          total_credits_earned?: number
          total_credits_spent?: number
          emotional_capacity?: 'low' | 'medium' | 'high'
          preferred_mode?: 'therapist' | 'friend' | 'both'
          is_anonymous?: boolean
          last_active?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          empathy_credits?: number
          total_credits_earned?: number
          total_credits_spent?: number
          emotional_capacity?: 'low' | 'medium' | 'high'
          preferred_mode?: 'therapist' | 'friend' | 'both'
          is_anonymous?: boolean
          last_active?: string
        }
      }
      listening_sessions: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          listener_id: string
          speaker_id: string
          session_type: 'therapist' | 'friend'
          duration_minutes: number
          credits_transferred: number
          status: 'pending' | 'active' | 'completed' | 'cancelled'
          listener_rating: number | null
          speaker_rating: number | null
          listener_feedback: string | null
          speaker_feedback: string | null
          started_at: string | null
          ended_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          listener_id: string
          speaker_id: string
          session_type: 'therapist' | 'friend'
          duration_minutes?: number
          credits_transferred?: number
          status?: 'pending' | 'active' | 'completed' | 'cancelled'
          listener_rating?: number | null
          speaker_rating?: number | null
          listener_feedback?: string | null
          speaker_feedback?: string | null
          started_at?: string | null
          ended_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          listener_id?: string
          speaker_id?: string
          session_type?: 'therapist' | 'friend'
          duration_minutes?: number
          credits_transferred?: number
          status?: 'pending' | 'active' | 'completed' | 'cancelled'
          listener_rating?: number | null
          speaker_rating?: number | null
          listener_feedback?: string | null
          speaker_feedback?: string | null
          started_at?: string | null
          ended_at?: string | null
        }
      }
      mood_entries: {
        Row: {
          id: string
          created_at: string
          user_id: string
          mood_score: number
          emotional_capacity: 'low' | 'medium' | 'high'
          seeking_support: boolean
          willing_to_listen: boolean
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          mood_score: number
          emotional_capacity: 'low' | 'medium' | 'high'
          seeking_support?: boolean
          willing_to_listen?: boolean
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          mood_score?: number
          emotional_capacity?: 'low' | 'medium' | 'high'
          seeking_support?: boolean
          willing_to_listen?: boolean
          notes?: string | null
        }
      }
      emotional_labor_logs: {
        Row: {
          id: string
          created_at: string
          user_id: string
          session_id: string
          action_type: 'gave_support' | 'received_support'
          credits_amount: number
          emotional_impact: number
          burnout_risk_score: number
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          session_id: string
          action_type: 'gave_support' | 'received_support'
          credits_amount: number
          emotional_impact: number
          burnout_risk_score?: number
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          session_id?: string
          action_type?: 'gave_support' | 'received_support'
          credits_amount?: number
          emotional_impact?: number
          burnout_risk_score?: number
        }
      }
      assessment_results: {
        Row: {
          id: string
          user_id: string
          assessment_id: string
          assessment_title: string
          score: number
          level: string
          severity: string
          responses: Json
          result_data: Json
          friendly_explanation: string | null
          taken_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          assessment_id: string
          assessment_title: string
          score: number
          level: string
          severity: string
          responses: Json
          result_data: Json
          friendly_explanation?: string | null
          taken_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          assessment_id?: string
          assessment_title?: string
          score?: number
          level?: string
          severity?: string
          responses?: Json
          result_data?: Json
          friendly_explanation?: string | null
          taken_at?: string
          created_at?: string
          updated_at?: string
        }
      }

      user_assessment_profiles: {
        Row: {
          id: string
          user_id: string
          profile_data: Json
          trauma_history: Json | null
          current_symptoms: Json | null
          resilience_data: Json | null
          risk_factors: Json | null
          preferences: Json | null
          personalization_data: Json | null
          last_assessed: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          profile_data: Json
          trauma_history?: Json | null
          current_symptoms?: Json | null
          resilience_data?: Json | null
          risk_factors?: Json | null
          preferences?: Json | null
          personalization_data?: Json | null
          last_assessed?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          profile_data?: Json
          trauma_history?: Json | null
          current_symptoms?: Json | null
          resilience_data?: Json | null
          risk_factors?: Json | null
          preferences?: Json | null
          personalization_data?: Json | null
          last_assessed?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
