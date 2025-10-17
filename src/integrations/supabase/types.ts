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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          created_by: string
          email_sent: boolean | null
          id: string
          message: string
          recipients_count: number | null
          sent_at: string
          target_audience: string
          title: string
        }
        Insert: {
          created_by: string
          email_sent?: boolean | null
          id?: string
          message: string
          recipients_count?: number | null
          sent_at?: string
          target_audience: string
          title: string
        }
        Update: {
          created_by?: string
          email_sent?: boolean | null
          id?: string
          message?: string
          recipients_count?: number | null
          sent_at?: string
          target_audience?: string
          title?: string
        }
        Relationships: []
      }
      assessments: {
        Row: {
          a1: number | null
          a2: number | null
          a3: number | null
          a4: number | null
          a5: number | null
          a6: number | null
          accountability_mean: number | null
          b1: number | null
          b2: number | null
          b3: number | null
          b4: number | null
          b5: number | null
          b6: number | null
          belonging_mean: number | null
          classification:
            | Database["public"]["Enums"]["leadership_classification"]
            | null
          coach_adjusted_composite: number | null
          coach_modifier: number | null
          coaching_insights: Json | null
          composite_mean: number | null
          created_at: string
          d1: number | null
          d2: number | null
          d3: number | null
          d4: number | null
          d5: number | null
          d6: number | null
          discipline_mean: number | null
          e1: number | null
          e2: number | null
          e3: number | null
          e4: number | null
          e5: number | null
          e6: number | null
          edition: Database["public"]["Enums"]["assessment_edition"] | null
          excellence_mean: number | null
          final_composite_mean: number | null
          id: string
          l1: number | null
          l2: number | null
          l3: number | null
          l4: number | null
          l5: number | null
          l6: number | null
          leadership_dna_mean: number | null
          notes_private: string | null
          peer_adjusted_composite: number | null
          peer_modifier: number | null
          reflections: Json | null
          risk_flags: string[] | null
          semester_label: string
          share_reflections: boolean | null
          timepoint: Database["public"]["Enums"]["assessment_timepoint"]
          updated_at: string
          user_id: string
        }
        Insert: {
          a1?: number | null
          a2?: number | null
          a3?: number | null
          a4?: number | null
          a5?: number | null
          a6?: number | null
          accountability_mean?: number | null
          b1?: number | null
          b2?: number | null
          b3?: number | null
          b4?: number | null
          b5?: number | null
          b6?: number | null
          belonging_mean?: number | null
          classification?:
            | Database["public"]["Enums"]["leadership_classification"]
            | null
          coach_adjusted_composite?: number | null
          coach_modifier?: number | null
          coaching_insights?: Json | null
          composite_mean?: number | null
          created_at?: string
          d1?: number | null
          d2?: number | null
          d3?: number | null
          d4?: number | null
          d5?: number | null
          d6?: number | null
          discipline_mean?: number | null
          e1?: number | null
          e2?: number | null
          e3?: number | null
          e4?: number | null
          e5?: number | null
          e6?: number | null
          edition?: Database["public"]["Enums"]["assessment_edition"] | null
          excellence_mean?: number | null
          final_composite_mean?: number | null
          id?: string
          l1?: number | null
          l2?: number | null
          l3?: number | null
          l4?: number | null
          l5?: number | null
          l6?: number | null
          leadership_dna_mean?: number | null
          notes_private?: string | null
          peer_adjusted_composite?: number | null
          peer_modifier?: number | null
          reflections?: Json | null
          risk_flags?: string[] | null
          semester_label: string
          share_reflections?: boolean | null
          timepoint: Database["public"]["Enums"]["assessment_timepoint"]
          updated_at?: string
          user_id: string
        }
        Update: {
          a1?: number | null
          a2?: number | null
          a3?: number | null
          a4?: number | null
          a5?: number | null
          a6?: number | null
          accountability_mean?: number | null
          b1?: number | null
          b2?: number | null
          b3?: number | null
          b4?: number | null
          b5?: number | null
          b6?: number | null
          belonging_mean?: number | null
          classification?:
            | Database["public"]["Enums"]["leadership_classification"]
            | null
          coach_adjusted_composite?: number | null
          coach_modifier?: number | null
          coaching_insights?: Json | null
          composite_mean?: number | null
          created_at?: string
          d1?: number | null
          d2?: number | null
          d3?: number | null
          d4?: number | null
          d5?: number | null
          d6?: number | null
          discipline_mean?: number | null
          e1?: number | null
          e2?: number | null
          e3?: number | null
          e4?: number | null
          e5?: number | null
          e6?: number | null
          edition?: Database["public"]["Enums"]["assessment_edition"] | null
          excellence_mean?: number | null
          final_composite_mean?: number | null
          id?: string
          l1?: number | null
          l2?: number | null
          l3?: number | null
          l4?: number | null
          l5?: number | null
          l6?: number | null
          leadership_dna_mean?: number | null
          notes_private?: string | null
          peer_adjusted_composite?: number | null
          peer_modifier?: number | null
          reflections?: Json | null
          risk_flags?: string[] | null
          semester_label?: string
          share_reflections?: boolean | null
          timepoint?: Database["public"]["Enums"]["assessment_timepoint"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_secure"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_assessments: {
        Row: {
          a1: number | null
          a2: number | null
          a3: number | null
          accountability_mean: number | null
          athlete_id: string
          b1: number | null
          b2: number | null
          b3: number | null
          belonging_mean: number | null
          classification:
            | Database["public"]["Enums"]["leadership_classification"]
            | null
          coach_id: string
          composite_mean: number | null
          created_at: string
          d1: number | null
          d2: number | null
          d3: number | null
          discipline_mean: number | null
          e1: number | null
          e2: number | null
          e3: number | null
          excellence_mean: number | null
          id: string
          l1: number | null
          l2: number | null
          l3: number | null
          leadership_dna_mean: number | null
          reflection_greatest_impact: string | null
          reflection_growth_area: string | null
          reflection_voluntary_followership: string | null
          semester_label: string
          timepoint: Database["public"]["Enums"]["assessment_timepoint"]
          updated_at: string
        }
        Insert: {
          a1?: number | null
          a2?: number | null
          a3?: number | null
          accountability_mean?: number | null
          athlete_id: string
          b1?: number | null
          b2?: number | null
          b3?: number | null
          belonging_mean?: number | null
          classification?:
            | Database["public"]["Enums"]["leadership_classification"]
            | null
          coach_id: string
          composite_mean?: number | null
          created_at?: string
          d1?: number | null
          d2?: number | null
          d3?: number | null
          discipline_mean?: number | null
          e1?: number | null
          e2?: number | null
          e3?: number | null
          excellence_mean?: number | null
          id?: string
          l1?: number | null
          l2?: number | null
          l3?: number | null
          leadership_dna_mean?: number | null
          reflection_greatest_impact?: string | null
          reflection_growth_area?: string | null
          reflection_voluntary_followership?: string | null
          semester_label: string
          timepoint: Database["public"]["Enums"]["assessment_timepoint"]
          updated_at?: string
        }
        Update: {
          a1?: number | null
          a2?: number | null
          a3?: number | null
          accountability_mean?: number | null
          athlete_id?: string
          b1?: number | null
          b2?: number | null
          b3?: number | null
          belonging_mean?: number | null
          classification?:
            | Database["public"]["Enums"]["leadership_classification"]
            | null
          coach_id?: string
          composite_mean?: number | null
          created_at?: string
          d1?: number | null
          d2?: number | null
          d3?: number | null
          discipline_mean?: number | null
          e1?: number | null
          e2?: number | null
          e3?: number | null
          excellence_mean?: number | null
          id?: string
          l1?: number | null
          l2?: number | null
          l3?: number | null
          leadership_dna_mean?: number | null
          reflection_greatest_impact?: string | null
          reflection_growth_area?: string | null
          reflection_voluntary_followership?: string | null
          semester_label?: string
          timepoint?: Database["public"]["Enums"]["assessment_timepoint"]
          updated_at?: string
        }
        Relationships: []
      }
      growth_plans: {
        Row: {
          created_at: string
          goals: Json | null
          id: string
          semester_label: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          goals?: Json | null
          id?: string
          semester_label: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          goals?: Json | null
          id?: string
          semester_label?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "growth_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "growth_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_secure"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          announcement_id: string | null
          created_at: string
          id: string
          message: string
          read: boolean | null
          title: string
          user_id: string
        }
        Insert: {
          announcement_id?: string | null
          created_at?: string
          id?: string
          message: string
          read?: boolean | null
          title: string
          user_id: string
        }
        Update: {
          announcement_id?: string | null
          created_at?: string
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      nudges: {
        Row: {
          body: string
          created_at: string
          domain: string
          frequency: Database["public"]["Enums"]["nudge_frequency"]
          id: string
          status: Database["public"]["Enums"]["nudge_status"]
          title: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          domain: string
          frequency: Database["public"]["Enums"]["nudge_frequency"]
          id?: string
          status?: Database["public"]["Enums"]["nudge_status"]
          title: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          domain?: string
          frequency?: Database["public"]["Enums"]["nudge_frequency"]
          id?: string
          status?: Database["public"]["Enums"]["nudge_status"]
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      peer_assessments: {
        Row: {
          a1: number | null
          a2: number | null
          a3: number | null
          accountability_mean: number | null
          assessed_user_id: string
          assessor_id: string
          b1: number | null
          b2: number | null
          b3: number | null
          belonging_mean: number | null
          classification:
            | Database["public"]["Enums"]["leadership_classification"]
            | null
          composite_mean: number | null
          created_at: string
          d1: number | null
          d2: number | null
          d3: number | null
          discipline_mean: number | null
          e1: number | null
          e2: number | null
          e3: number | null
          excellence_mean: number | null
          id: string
          l1: number | null
          l2: number | null
          l3: number | null
          leadership_dna_mean: number | null
          optional_comment: string | null
          semester_label: string
          timepoint: Database["public"]["Enums"]["assessment_timepoint"]
          updated_at: string
        }
        Insert: {
          a1?: number | null
          a2?: number | null
          a3?: number | null
          accountability_mean?: number | null
          assessed_user_id: string
          assessor_id: string
          b1?: number | null
          b2?: number | null
          b3?: number | null
          belonging_mean?: number | null
          classification?:
            | Database["public"]["Enums"]["leadership_classification"]
            | null
          composite_mean?: number | null
          created_at?: string
          d1?: number | null
          d2?: number | null
          d3?: number | null
          discipline_mean?: number | null
          e1?: number | null
          e2?: number | null
          e3?: number | null
          excellence_mean?: number | null
          id?: string
          l1?: number | null
          l2?: number | null
          l3?: number | null
          leadership_dna_mean?: number | null
          optional_comment?: string | null
          semester_label: string
          timepoint: Database["public"]["Enums"]["assessment_timepoint"]
          updated_at?: string
        }
        Update: {
          a1?: number | null
          a2?: number | null
          a3?: number | null
          accountability_mean?: number | null
          assessed_user_id?: string
          assessor_id?: string
          b1?: number | null
          b2?: number | null
          b3?: number | null
          belonging_mean?: number | null
          classification?:
            | Database["public"]["Enums"]["leadership_classification"]
            | null
          composite_mean?: number | null
          created_at?: string
          d1?: number | null
          d2?: number | null
          d3?: number | null
          discipline_mean?: number | null
          e1?: number | null
          e2?: number | null
          e3?: number | null
          excellence_mean?: number | null
          id?: string
          l1?: number | null
          l2?: number | null
          l3?: number | null
          leadership_dna_mean?: number | null
          optional_comment?: string | null
          semester_label?: string
          timepoint?: Database["public"]["Enums"]["assessment_timepoint"]
          updated_at?: string
        }
        Relationships: []
      }
      pending_role_requests: {
        Row: {
          created_at: string
          id: string
          reason: string | null
          requested_role: Database["public"]["Enums"]["user_role"]
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason?: string | null
          requested_role: Database["public"]["Enums"]["user_role"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string | null
          requested_role?: Database["public"]["Enums"]["user_role"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          sport: string | null
          team_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id: string
          last_name: string
          sport?: string | null
          team_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          sport?: string | null
          team_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_team"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          coach_ids: string[] | null
          created_at: string
          id: string
          institution: string | null
          name: string
          primary_color: string | null
          secondary_color: string | null
          sport: string
        }
        Insert: {
          coach_ids?: string[] | null
          created_at?: string
          id?: string
          institution?: string | null
          name: string
          primary_color?: string | null
          secondary_color?: string | null
          sport: string
        }
        Update: {
          coach_ids?: string[] | null
          created_at?: string
          id?: string
          institution?: string | null
          name?: string
          primary_color?: string | null
          secondary_color?: string | null
          sport?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      peer_feedback_aggregated: {
        Row: {
          assessed_user_id: string | null
          avg_accountability: number | null
          avg_belonging: number | null
          avg_composite: number | null
          avg_discipline: number | null
          avg_excellence: number | null
          avg_leadership_dna: number | null
          comments: string[] | null
          response_count: number | null
          semester_label: string | null
          timepoint: Database["public"]["Enums"]["assessment_timepoint"] | null
        }
        Relationships: []
      }
      profiles_secure: {
        Row: {
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string | null
          last_name: string | null
          sport: string | null
          team_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: never
          first_name?: string | null
          id?: string | null
          last_name?: string | null
          sport?: string | null
          team_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: never
          first_name?: string | null
          id?: string | null
          last_name?: string | null
          sport?: string | null
          team_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_team"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      are_teammates: {
        Args: { _user_id1: string; _user_id2: string }
        Returns: boolean
      }
      calculate_adjusted_composite: {
        Args: { _assessment_id: string }
        Returns: undefined
      }
      get_teammates_for_peer_assessment: {
        Args: {
          _semester_label: string
          _timepoint: Database["public"]["Enums"]["assessment_timepoint"]
        }
        Returns: {
          first_name: string
          has_completed_self_assessment: boolean
          last_name: string
          user_id: string
        }[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_coach_for_team: {
        Args: { _coach_id: string; _team_id: string }
        Returns: boolean
      }
      mask_email: {
        Args: {
          profile_email: string
          profile_id: string
          profile_team_id: string
        }
        Returns: string
      }
      process_role_request: {
        Args: {
          approve: boolean
          rejection_reason?: string
          request_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      assessment_edition: "standard" | "transformational"
      assessment_timepoint: "pre" | "mid" | "end"
      goal_status: "planned" | "in_progress" | "completed"
      leadership_classification:
        | "Foundational"
        | "Developing"
        | "Emerging"
        | "Transformational"
        | "Unanchored"
      nudge_frequency: "daily" | "weekly"
      nudge_status: "scheduled" | "sent" | "snoozed" | "completed"
      user_role: "student" | "coach" | "admin"
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
      assessment_edition: ["standard", "transformational"],
      assessment_timepoint: ["pre", "mid", "end"],
      goal_status: ["planned", "in_progress", "completed"],
      leadership_classification: [
        "Foundational",
        "Developing",
        "Emerging",
        "Transformational",
        "Unanchored",
      ],
      nudge_frequency: ["daily", "weekly"],
      nudge_status: ["scheduled", "sent", "snoozed", "completed"],
      user_role: ["student", "coach", "admin"],
    },
  },
} as const
