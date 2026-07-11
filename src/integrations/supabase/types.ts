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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      action_stakeholders: {
        Row: {
          action_id: string
          created_at: string
          id: string
          stakeholder_id: string
        }
        Insert: {
          action_id: string
          created_at?: string
          id?: string
          stakeholder_id: string
        }
        Update: {
          action_id?: string
          created_at?: string
          id?: string
          stakeholder_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_stakeholders_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "actions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_stakeholders_stakeholder_id_fkey"
            columns: ["stakeholder_id"]
            isOneToOne: false
            referencedRelation: "stakeholders"
            referencedColumns: ["id"]
          },
        ]
      }
      actions: {
        Row: {
          artifact: string | null
          based_on: string | null
          completed_at: string | null
          created_at: string
          deadline: string | null
          deal_id: string
          email_body: string | null
          email_subject: string | null
          id: string
          meeting_agenda: string | null
          meeting_duration_minutes: number | null
          priority: Database["public"]["Enums"]["action_priority"]
          status: Database["public"]["Enums"]["action_status"]
          title: string
          type: Database["public"]["Enums"]["action_type"]
          updated_at: string
        }
        Insert: {
          artifact?: string | null
          based_on?: string | null
          completed_at?: string | null
          created_at?: string
          deadline?: string | null
          deal_id: string
          email_body?: string | null
          email_subject?: string | null
          id?: string
          meeting_agenda?: string | null
          meeting_duration_minutes?: number | null
          priority?: Database["public"]["Enums"]["action_priority"]
          status?: Database["public"]["Enums"]["action_status"]
          title: string
          type?: Database["public"]["Enums"]["action_type"]
          updated_at?: string
        }
        Update: {
          artifact?: string | null
          based_on?: string | null
          completed_at?: string | null
          created_at?: string
          deadline?: string | null
          deal_id?: string
          email_body?: string | null
          email_subject?: string | null
          id?: string
          meeting_agenda?: string | null
          meeting_duration_minutes?: number | null
          priority?: Database["public"]["Enums"]["action_priority"]
          status?: Database["public"]["Enums"]["action_status"]
          title?: string
          type?: Database["public"]["Enums"]["action_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "actions_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      activities: {
        Row: {
          created_at: string
          deal_id: string | null
          description: string
          id: string
          sentiment: Database["public"]["Enums"]["stakeholder_status"]
          source: string | null
          stakeholder_id: string | null
        }
        Insert: {
          created_at?: string
          deal_id?: string | null
          description: string
          id?: string
          sentiment?: Database["public"]["Enums"]["stakeholder_status"]
          source?: string | null
          stakeholder_id?: string | null
        }
        Update: {
          created_at?: string
          deal_id?: string | null
          description?: string
          id?: string
          sentiment?: Database["public"]["Enums"]["stakeholder_status"]
          source?: string | null
          stakeholder_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_stakeholder_id_fkey"
            columns: ["stakeholder_id"]
            isOneToOne: false
            referencedRelation: "stakeholders"
            referencedColumns: ["id"]
          },
        ]
      }
      attachments: {
        Row: {
          action_id: string | null
          created_at: string
          file_path: string | null
          file_size: number | null
          file_type: string | null
          id: string
          name: string
          signal_id: string | null
        }
        Insert: {
          action_id?: string | null
          created_at?: string
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          name: string
          signal_id?: string | null
        }
        Update: {
          action_id?: string | null
          created_at?: string
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          name?: string
          signal_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attachments_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "actions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attachments_signal_id_fkey"
            columns: ["signal_id"]
            isOneToOne: false
            referencedRelation: "signals"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          company: string | null
          created_at: string
          deal_id: string | null
          end_time: string | null
          event_date: string
          id: string
          notes: string | null
          start_time: string | null
          status: string
          title: string
          type: Database["public"]["Enums"]["event_type"]
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          deal_id?: string | null
          end_time?: string | null
          event_date: string
          id?: string
          notes?: string | null
          start_time?: string | null
          status?: string
          title: string
          type?: Database["public"]["Enums"]["event_type"]
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          deal_id?: string | null
          end_time?: string | null
          event_date?: string
          id?: string
          notes?: string | null
          start_time?: string | null
          status?: string
          title?: string
          type?: Database["public"]["Enums"]["event_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          deal_id: string | null
          id: string
          role: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          deal_id?: string | null
          id?: string
          role: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          deal_id?: string | null
          id?: string
          role?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          alignment: number
          close_date: string | null
          company: string
          consensus: number
          created_at: string
          deal_start_date: string | null
          has_risk: boolean
          id: string
          industry: string | null
          logo: string | null
          sentiment: number
          stage: Database["public"]["Enums"]["deal_stage"]
          summary_action: string | null
          summary_context: string | null
          summary_headline: string | null
          summary_text: string | null
          updated_at: string
          value: string
          value_numeric: number
          win_probability: number
        }
        Insert: {
          alignment?: number
          close_date?: string | null
          company: string
          consensus?: number
          created_at?: string
          deal_start_date?: string | null
          has_risk?: boolean
          id?: string
          industry?: string | null
          logo?: string | null
          sentiment?: number
          stage?: Database["public"]["Enums"]["deal_stage"]
          summary_action?: string | null
          summary_context?: string | null
          summary_headline?: string | null
          summary_text?: string | null
          updated_at?: string
          value: string
          value_numeric?: number
          win_probability?: number
        }
        Update: {
          alignment?: number
          close_date?: string | null
          company?: string
          consensus?: number
          created_at?: string
          deal_start_date?: string | null
          has_risk?: boolean
          id?: string
          industry?: string | null
          logo?: string | null
          sentiment?: number
          stage?: Database["public"]["Enums"]["deal_stage"]
          summary_action?: string | null
          summary_context?: string | null
          summary_headline?: string | null
          summary_text?: string | null
          updated_at?: string
          value?: string
          value_numeric?: number
          win_probability?: number
        }
        Relationships: []
      }
      signal_actions: {
        Row: {
          action_id: string
          created_at: string
          id: string
          signal_id: string
        }
        Insert: {
          action_id: string
          created_at?: string
          id?: string
          signal_id: string
        }
        Update: {
          action_id?: string
          created_at?: string
          id?: string
          signal_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "signal_actions_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "actions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signal_actions_signal_id_fkey"
            columns: ["signal_id"]
            isOneToOne: false
            referencedRelation: "signals"
            referencedColumns: ["id"]
          },
        ]
      }
      signals: {
        Row: {
          channel: string | null
          confidence: number
          created_at: string
          deal_id: string
          detected_at: string
          evidence: string | null
          id: string
          is_urgent: boolean
          name: string
          priority: Database["public"]["Enums"]["action_priority"]
          processed_at: string | null
          sentiment: Database["public"]["Enums"]["stakeholder_status"] | null
          stakeholder_id: string | null
          status: Database["public"]["Enums"]["signal_status"]
          suggested_action: string | null
          trigger: string
          type: Database["public"]["Enums"]["signal_type"]
          updated_at: string
        }
        Insert: {
          channel?: string | null
          confidence?: number
          created_at?: string
          deal_id: string
          detected_at?: string
          evidence?: string | null
          id?: string
          is_urgent?: boolean
          name: string
          priority?: Database["public"]["Enums"]["action_priority"]
          processed_at?: string | null
          sentiment?: Database["public"]["Enums"]["stakeholder_status"] | null
          stakeholder_id?: string | null
          status?: Database["public"]["Enums"]["signal_status"]
          suggested_action?: string | null
          trigger: string
          type?: Database["public"]["Enums"]["signal_type"]
          updated_at?: string
        }
        Update: {
          channel?: string | null
          confidence?: number
          created_at?: string
          deal_id?: string
          detected_at?: string
          evidence?: string | null
          id?: string
          is_urgent?: boolean
          name?: string
          priority?: Database["public"]["Enums"]["action_priority"]
          processed_at?: string | null
          sentiment?: Database["public"]["Enums"]["stakeholder_status"] | null
          stakeholder_id?: string | null
          status?: Database["public"]["Enums"]["signal_status"]
          suggested_action?: string | null
          trigger?: string
          type?: Database["public"]["Enums"]["signal_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "signals_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signals_stakeholder_id_fkey"
            columns: ["stakeholder_id"]
            isOneToOne: false
            referencedRelation: "stakeholders"
            referencedColumns: ["id"]
          },
        ]
      }
      stakeholder_trends: {
        Row: {
          alignment: number
          created_at: string
          date: string
          id: string
          priority: number
          sentiment: number
          stakeholder_id: string
        }
        Insert: {
          alignment?: number
          created_at?: string
          date: string
          id?: string
          priority?: number
          sentiment?: number
          stakeholder_id: string
        }
        Update: {
          alignment?: number
          created_at?: string
          date?: string
          id?: string
          priority?: number
          sentiment?: number
          stakeholder_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stakeholder_trends_stakeholder_id_fkey"
            columns: ["stakeholder_id"]
            isOneToOne: false
            referencedRelation: "stakeholders"
            referencedColumns: ["id"]
          },
        ]
      }
      stakeholders: {
        Row: {
          alignment: number
          avatar: string | null
          cost_interest: boolean
          cost_reduction: number
          created_at: string
          deal_id: string
          engagement_category: Database["public"]["Enums"]["engagement_category"]
          id: string
          last_interaction_date: string | null
          last_interaction_summary: string | null
          name: string
          priority: number
          role: string
          sentiment: number
          speed_interest: boolean
          speed_to_value: number
          status: Database["public"]["Enums"]["stakeholder_status"]
          summary: string | null
          threat_interest: boolean
          threat_mitigation: number
          updated_at: string
        }
        Insert: {
          alignment?: number
          avatar?: string | null
          cost_interest?: boolean
          cost_reduction?: number
          created_at?: string
          deal_id: string
          engagement_category?: Database["public"]["Enums"]["engagement_category"]
          id?: string
          last_interaction_date?: string | null
          last_interaction_summary?: string | null
          name: string
          priority?: number
          role: string
          sentiment?: number
          speed_interest?: boolean
          speed_to_value?: number
          status?: Database["public"]["Enums"]["stakeholder_status"]
          summary?: string | null
          threat_interest?: boolean
          threat_mitigation?: number
          updated_at?: string
        }
        Update: {
          alignment?: number
          avatar?: string | null
          cost_interest?: boolean
          cost_reduction?: number
          created_at?: string
          deal_id?: string
          engagement_category?: Database["public"]["Enums"]["engagement_category"]
          id?: string
          last_interaction_date?: string | null
          last_interaction_summary?: string | null
          name?: string
          priority?: number
          role?: string
          sentiment?: number
          speed_interest?: boolean
          speed_to_value?: number
          status?: Database["public"]["Enums"]["stakeholder_status"]
          summary?: string | null
          threat_interest?: boolean
          threat_mitigation?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stakeholders_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
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
      action_priority: "high" | "medium" | "low"
      action_status: "pending" | "done" | "archived"
      action_type: "email" | "meeting"
      deal_stage: "diagnose" | "validate" | "align" | "commit"
      engagement_category: "engaged" | "silent" | "hidden"
      event_type: "call" | "meeting"
      signal_status: "pending" | "processed" | "ignored"
      signal_type: "signal" | "risk"
      stakeholder_status: "positive" | "neutral" | "negative"
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
    Enums: {
      action_priority: ["high", "medium", "low"],
      action_status: ["pending", "done", "archived"],
      action_type: ["email", "meeting"],
      deal_stage: ["diagnose", "validate", "align", "commit"],
      engagement_category: ["engaged", "silent", "hidden"],
      event_type: ["call", "meeting"],
      signal_status: ["pending", "processed", "ignored"],
      signal_type: ["signal", "risk"],
      stakeholder_status: ["positive", "neutral", "negative"],
    },
  },
} as const
