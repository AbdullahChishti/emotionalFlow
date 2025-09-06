export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      assessment_results: {
        Row: {
          assessment_id: string
          assessment_title: string
          created_at: string | null
          friendly_explanation: string | null
          id: string
          level: string
          responses: Json
          result_data: Json
          score: number
          severity: string
          taken_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assessment_id: string
          assessment_title: string
          created_at?: string | null
          friendly_explanation?: string | null
          id?: string
          level: string
          responses: Json
          result_data: Json
          score: number
          severity: string
          taken_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assessment_id?: string
          assessment_title?: string
          created_at?: string | null
          friendly_explanation?: string | null
          id?: string
          level?: string
          responses?: Json
          result_data?: Json
          score?: number
          severity?: string
          taken_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_progress: {
        Row: {
          average_sentiment: number
          created_at: string | null
          crisis_indicators: string[] | null
          emotional_tone: string
          id: string
          message_count: number
          session_id: string
          therapeutic_themes: string[] | null
          timestamp: string | null
          updated_at: string | null
          user_engagement: string
          user_id: string
        }
        Insert: {
          average_sentiment?: number
          created_at?: string | null
          crisis_indicators?: string[] | null
          emotional_tone?: string
          id?: string
          message_count?: number
          session_id: string
          therapeutic_themes?: string[] | null
          timestamp?: string | null
          updated_at?: string | null
          user_engagement?: string
          user_id: string
        }
        Update: {
          average_sentiment?: number
          created_at?: string | null
          crisis_indicators?: string[] | null
          emotional_tone?: string
          id?: string
          message_count?: number
          session_id?: string
          therapeutic_themes?: string[] | null
          timestamp?: string | null
          updated_at?: string | null
          user_engagement?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      listening_sessions: {
        Row: {
          created_at: string | null
          credits_transferred: number
          duration_minutes: number
          ended_at: string | null
          id: string
          listener_feedback: string | null
          listener_id: string
          listener_rating: number | null
          session_type: string
          speaker_feedback: string | null
          speaker_id: string
          speaker_rating: number | null
          started_at: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          credits_transferred?: number
          duration_minutes?: number
          ended_at?: string | null
          id?: string
          listener_feedback?: string | null
          listener_id: string
          listener_rating?: number | null
          session_type?: string
          speaker_feedback?: string | null
          speaker_id: string
          speaker_rating?: number | null
          started_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          credits_transferred?: number
          duration_minutes?: number
          ended_at?: string | null
          id?: string
          listener_feedback?: string | null
          listener_id?: string
          listener_rating?: number | null
          session_type?: string
          speaker_feedback?: string | null
          speaker_id?: string
          speaker_rating?: number | null
          started_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listening_sessions_listener_id_fkey"
            columns: ["listener_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listening_sessions_speaker_id_fkey"
            columns: ["speaker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mood_entries: {
        Row: {
          coping_strategies: string[] | null
          created_at: string | null
          emotional_capacity: string | null
          energy_level: number | null
          id: string
          metadata: Json | null
          mood_label: string | null
          mood_score: number
          notes: string | null
          physical_activity: string | null
          seeking_support: boolean | null
          sleep_quality: number | null
          social_activity: string | null
          stress_level: number | null
          triggers: string[] | null
          updated_at: string | null
          user_id: string
          willing_to_listen: boolean | null
        }
        Insert: {
          coping_strategies?: string[] | null
          created_at?: string | null
          emotional_capacity?: string | null
          energy_level?: number | null
          id?: string
          metadata?: Json | null
          mood_label?: string | null
          mood_score: number
          notes?: string | null
          physical_activity?: string | null
          seeking_support?: boolean | null
          sleep_quality?: number | null
          social_activity?: string | null
          stress_level?: number | null
          triggers?: string[] | null
          updated_at?: string | null
          user_id: string
          willing_to_listen?: boolean | null
        }
        Update: {
          coping_strategies?: string[] | null
          created_at?: string | null
          emotional_capacity?: string | null
          energy_level?: number | null
          id?: string
          metadata?: Json | null
          mood_label?: string | null
          mood_score?: number
          notes?: string | null
          physical_activity?: string | null
          seeking_support?: boolean | null
          sleep_quality?: number | null
          social_activity?: string | null
          stress_level?: number | null
          triggers?: string[] | null
          updated_at?: string | null
          user_id?: string
          willing_to_listen?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "mood_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      overall_assessments: {
        Row: {
          ai_analysis: Json
          created_at: string | null
          id: string
          overall_assessment_data: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_analysis: Json
          created_at?: string | null
          id?: string
          overall_assessment_data: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_analysis?: Json
          created_at?: string | null
          id?: string
          overall_assessment_data?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "overall_assessments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          emotional_capacity: string
          empathy_credits: number
          id: string
          is_anonymous: boolean
          last_active: string | null
          preferred_mode: string
          total_credits_earned: number
          total_credits_spent: number
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          emotional_capacity?: string
          empathy_credits?: number
          id: string
          is_anonymous?: boolean
          last_active?: string | null
          preferred_mode?: string
          total_credits_earned?: number
          total_credits_spent?: number
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          emotional_capacity?: string
          empathy_credits?: number
          id?: string
          is_anonymous?: boolean
          last_active?: string | null
          preferred_mode?: string
          total_credits_earned?: number
          total_credits_spent?: number
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      progress_insights: {
        Row: {
          action_url: string | null
          actionable: boolean
          category: string
          created_at: string | null
          description: string
          id: string
          insight_type: string
          metadata: Json | null
          priority: string
          title: string
          updated_at: string | null
          user_id: string
          viewed: boolean
        }
        Insert: {
          action_url?: string | null
          actionable?: boolean
          category: string
          created_at?: string | null
          description: string
          id?: string
          insight_type: string
          metadata?: Json | null
          priority?: string
          title: string
          updated_at?: string | null
          user_id: string
          viewed?: boolean
        }
        Update: {
          action_url?: string | null
          actionable?: boolean
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          insight_type?: string
          metadata?: Json | null
          priority?: string
          title?: string
          updated_at?: string | null
          user_id?: string
          viewed?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "progress_insights_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendation_tracking: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string | null
          feedback: string | null
          id: string
          recommendation_id: string
          recommendation_title: string
          recommendation_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          recommendation_id: string
          recommendation_title: string
          recommendation_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          recommendation_id?: string
          recommendation_title?: string
          recommendation_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendation_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_assessment_profiles: {
        Row: {
          created_at: string | null
          current_symptoms: Json | null
          id: string
          last_assessed: string | null
          personalization_data: Json | null
          preferences: Json | null
          profile_data: Json
          resilience_data: Json | null
          risk_factors: Json | null
          trauma_history: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_symptoms?: Json | null
          id?: string
          last_assessed?: string | null
          personalization_data?: Json | null
          preferences?: Json | null
          profile_data: Json
          resilience_data?: Json | null
          risk_factors?: Json | null
          trauma_history?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_symptoms?: Json | null
          id?: string
          last_assessed?: string | null
          personalization_data?: Json | null
          preferences?: Json | null
          profile_data?: Json
          resilience_data?: Json | null
          risk_factors?: Json | null
          trauma_history?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_assessment_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
