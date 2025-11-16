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
      announcement_rate_limits: {
        Row: {
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
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
          {
            foreignKeyName: "assessments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_activity_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      coach_assessments: {
        Row: {
          a1: number | null
          a2: number | null
          a3: number | null
          accountability_mean: number | null
          ai_insights: Json | null
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
          ai_insights?: Json | null
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
          ai_insights?: Json | null
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
      coaches_inquiries: {
        Row: {
          assigned_to: string | null
          coach_email: string
          coach_name: string
          created_at: string | null
          estimated_value_cents: number | null
          id: string
          message: string | null
          organization_name: string
          phone_number: string | null
          program_type: string
          sport: string
          status: string | null
          team_size: number
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          coach_email: string
          coach_name: string
          created_at?: string | null
          estimated_value_cents?: number | null
          id?: string
          message?: string | null
          organization_name: string
          phone_number?: string | null
          program_type: string
          sport: string
          status?: string | null
          team_size: number
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          coach_email?: string
          coach_name?: string
          created_at?: string | null
          estimated_value_cents?: number | null
          id?: string
          message?: string | null
          organization_name?: string
          phone_number?: string | null
          program_type?: string
          sport?: string
          status?: string | null
          team_size?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coaches_inquiries_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coaches_inquiries_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coaches_inquiries_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "user_activity_summary"
            referencedColumns: ["user_id"]
          },
        ]
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
          {
            foreignKeyName: "growth_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_activity_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      guardian_assessments: {
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
          completed_at: string | null
          composite_mean: number | null
          created_at: string | null
          d1: number | null
          d2: number | null
          d3: number | null
          discipline_mean: number | null
          e1: number | null
          e2: number | null
          e3: number | null
          excellence_mean: number | null
          guardian_email: string
          guardian_name: string
          guardian_relationship: string
          id: string
          invitation_sent_at: string | null
          invitation_token: string | null
          invited_by: string
          l1: number | null
          l2: number | null
          l3: number | null
          leadership_dna_mean: number | null
          optional_comment: string | null
          semester_label: string
          timepoint: Database["public"]["Enums"]["assessment_timepoint"]
          updated_at: string | null
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
          completed_at?: string | null
          composite_mean?: number | null
          created_at?: string | null
          d1?: number | null
          d2?: number | null
          d3?: number | null
          discipline_mean?: number | null
          e1?: number | null
          e2?: number | null
          e3?: number | null
          excellence_mean?: number | null
          guardian_email: string
          guardian_name: string
          guardian_relationship: string
          id?: string
          invitation_sent_at?: string | null
          invitation_token?: string | null
          invited_by: string
          l1?: number | null
          l2?: number | null
          l3?: number | null
          leadership_dna_mean?: number | null
          optional_comment?: string | null
          semester_label: string
          timepoint: Database["public"]["Enums"]["assessment_timepoint"]
          updated_at?: string | null
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
          completed_at?: string | null
          composite_mean?: number | null
          created_at?: string | null
          d1?: number | null
          d2?: number | null
          d3?: number | null
          discipline_mean?: number | null
          e1?: number | null
          e2?: number | null
          e3?: number | null
          excellence_mean?: number | null
          guardian_email?: string
          guardian_name?: string
          guardian_relationship?: string
          id?: string
          invitation_sent_at?: string | null
          invitation_token?: string | null
          invited_by?: string
          l1?: number | null
          l2?: number | null
          l3?: number | null
          leadership_dna_mean?: number | null
          optional_comment?: string | null
          semester_label?: string
          timepoint?: Database["public"]["Enums"]["assessment_timepoint"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guardian_assessments_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guardian_assessments_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "profiles_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guardian_assessments_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "user_activity_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "guardian_assessments_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guardian_assessments_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guardian_assessments_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "user_activity_summary"
            referencedColumns: ["user_id"]
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
      organization_invitations: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          organization_id: string
          role: string
          status: string
          team_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          organization_id: string
          role: string
          status?: string
          team_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          organization_id?: string
          role?: string
          status?: string
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_invitations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_join_requests: {
        Row: {
          created_at: string
          id: string
          message: string | null
          organization_id: string
          requested_role: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          organization_id: string
          requested_role: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          organization_id?: string
          requested_role?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_join_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          id: string
          organization_id: string
          role: string
          status: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          organization_id: string
          role: string
          status?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          organization_id?: string
          role?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          email_domain: string | null
          id: string
          institution: string | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email_domain?: string | null
          id?: string
          institution?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email_domain?: string | null
          id?: string
          institution?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      package_access: {
        Row: {
          access_expires_at: string | null
          access_granted_at: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          package_id: string
          purchase_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_expires_at?: string | null
          access_granted_at?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          package_id: string
          purchase_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_expires_at?: string | null
          access_granted_at?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          package_id?: string
          purchase_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "package_access_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_access_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_access_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_access_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_access_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_activity_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      packages: {
        Row: {
          base_price_cents: number
          created_at: string | null
          description: string
          display_order: number | null
          features: Json | null
          has_payment_plan: boolean | null
          id: string
          includes_summer_program: boolean | null
          is_active: boolean | null
          name: string
          payment_plan_config: Json | null
          slug: string
          stripe_price_id: string | null
          stripe_product_id: string | null
          updated_at: string | null
        }
        Insert: {
          base_price_cents: number
          created_at?: string | null
          description: string
          display_order?: number | null
          features?: Json | null
          has_payment_plan?: boolean | null
          id?: string
          includes_summer_program?: boolean | null
          is_active?: boolean | null
          name: string
          payment_plan_config?: Json | null
          slug: string
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          updated_at?: string | null
        }
        Update: {
          base_price_cents?: number
          created_at?: string | null
          description?: string
          display_order?: number | null
          features?: Json | null
          has_payment_plan?: boolean | null
          id?: string
          includes_summer_program?: boolean | null
          is_active?: boolean | null
          name?: string
          payment_plan_config?: Json | null
          slug?: string
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_plan_installments: {
        Row: {
          amount_cents: number
          created_at: string | null
          due_date: string
          id: string
          installment_number: number
          paid_at: string | null
          purchase_id: string
          status: string | null
          stripe_payment_intent_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string | null
          due_date: string
          id?: string
          installment_number: number
          paid_at?: string | null
          purchase_id: string
          status?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string | null
          due_date?: string
          id?: string
          installment_number?: number
          paid_at?: string | null
          purchase_id?: string
          status?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_plan_installments_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
        ]
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
          date_of_birth: string | null
          email: string
          first_name: string
          id: string
          is_active: boolean | null
          last_login_at: string | null
          last_name: string
          login_count: number | null
          registration_type: string | null
          sport: string | null
          team_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          email: string
          first_name: string
          id: string
          is_active?: boolean | null
          last_login_at?: string | null
          last_name: string
          login_count?: number | null
          registration_type?: string | null
          sport?: string | null
          team_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          email?: string
          first_name?: string
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          last_name?: string
          login_count?: number | null
          registration_type?: string | null
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
      purchases: {
        Row: {
          amount_paid_cents: number | null
          created_at: string | null
          id: string
          membership_end_date: string | null
          membership_start_date: string | null
          metadata: Json | null
          package_id: string
          purchase_type: string
          purchased_at: string | null
          refund_eligible_until: string | null
          status: string | null
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          total_amount_cents: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_paid_cents?: number | null
          created_at?: string | null
          id?: string
          membership_end_date?: string | null
          membership_start_date?: string | null
          metadata?: Json | null
          package_id: string
          purchase_type: string
          purchased_at?: string | null
          refund_eligible_until?: string | null
          status?: string | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          total_amount_cents: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_paid_cents?: number | null
          created_at?: string | null
          id?: string
          membership_end_date?: string | null
          membership_start_date?: string | null
          metadata?: Json | null
          package_id?: string
          purchase_type?: string
          purchased_at?: string | null
          refund_eligible_until?: string | null
          status?: string | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          total_amount_cents?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_activity_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      refund_requests: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          id: string
          purchase_id: string
          reason: string | null
          requested_at: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          stripe_refund_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          id?: string
          purchase_id: string
          reason?: string | null
          requested_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          stripe_refund_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          id?: string
          purchase_id?: string
          reason?: string | null
          requested_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          stripe_refund_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "refund_requests_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refund_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refund_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refund_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "user_activity_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "refund_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refund_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refund_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_activity_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      renewal_reminders: {
        Row: {
          created_at: string | null
          id: string
          purchase_id: string
          reminder_type: string
          sent_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          purchase_id: string
          reminder_type: string
          sent_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          purchase_id?: string
          reminder_type?: string
          sent_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "renewal_reminders_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "renewal_reminders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "renewal_reminders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "renewal_reminders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_activity_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      summer_program_enrollments: {
        Row: {
          additional_notes: string | null
          athlete_id: string | null
          athlete_name: string
          created_at: string | null
          educational_preferences: Json | null
          educational_struggles: Json | null
          enrolled_at: string | null
          enrollment_status: string | null
          grade_level: string
          id: string
          parent_user_id: string
          purchase_id: string
          updated_at: string | null
        }
        Insert: {
          additional_notes?: string | null
          athlete_id?: string | null
          athlete_name: string
          created_at?: string | null
          educational_preferences?: Json | null
          educational_struggles?: Json | null
          enrolled_at?: string | null
          enrollment_status?: string | null
          grade_level: string
          id?: string
          parent_user_id: string
          purchase_id: string
          updated_at?: string | null
        }
        Update: {
          additional_notes?: string | null
          athlete_id?: string | null
          athlete_name?: string
          created_at?: string | null
          educational_preferences?: Json | null
          educational_struggles?: Json | null
          enrolled_at?: string | null
          enrollment_status?: string | null
          grade_level?: string
          id?: string
          parent_user_id?: string
          purchase_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "summer_program_enrollments_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "summer_program_enrollments_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "profiles_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "summer_program_enrollments_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "user_activity_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "summer_program_enrollments_parent_user_id_fkey"
            columns: ["parent_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "summer_program_enrollments_parent_user_id_fkey"
            columns: ["parent_user_id"]
            isOneToOne: false
            referencedRelation: "profiles_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "summer_program_enrollments_parent_user_id_fkey"
            columns: ["parent_user_id"]
            isOneToOne: false
            referencedRelation: "user_activity_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "summer_program_enrollments_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          sport?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_log: {
        Row: {
          activity_details: Json | null
          activity_type: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          activity_details?: Json | null
          activity_type: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          activity_details?: Json | null
          activity_type?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_activity_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_activity_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_activity_summary"
            referencedColumns: ["user_id"]
          },
        ]
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
      guardian_feedback_aggregated: {
        Row: {
          athlete_id: string | null
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
        Relationships: [
          {
            foreignKeyName: "guardian_assessments_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guardian_assessments_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "profiles_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guardian_assessments_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "user_activity_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
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
      user_activity_summary: {
        Row: {
          account_created_at: string | null
          coach_assessments_given: number | null
          email: string | null
          first_name: string | null
          growth_plans_count: number | null
          is_active: boolean | null
          last_assessment_date: string | null
          last_coach_assessment_date: string | null
          last_growth_plan_update: string | null
          last_login_at: string | null
          last_name: string | null
          last_peer_assessment_given: string | null
          login_count: number | null
          peer_assessments_given: number | null
          peer_assessments_received: number | null
          role: Database["public"]["Enums"]["user_role"] | null
          sport: string | null
          team_id: string | null
          team_name: string | null
          total_assessments: number | null
          user_id: string | null
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
      check_announcement_rate_limit: {
        Args: { _max_per_hour?: number; _user_id: string }
        Returns: Json
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
      get_user_organizations: { Args: { _user_id: string }; Returns: string[] }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_user_roles: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["user_role"][]
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
      is_org_admin: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      mask_email: {
        Args: {
          profile_email: string
          profile_id: string
          profile_team_id: string
        }
        Returns: string
      }
      process_join_request: {
        Args: { approve: boolean; assign_team_id?: string; request_id: string }
        Returns: Json
      }
      process_role_request: {
        Args: {
          approve: boolean
          rejection_reason?: string
          request_id: string
        }
        Returns: undefined
      }
      record_announcement_send: {
        Args: { _user_id: string }
        Returns: undefined
      }
      refresh_user_activity_summary: { Args: never; Returns: undefined }
      request_additional_role: {
        Args: { _requested_role: Database["public"]["Enums"]["user_role"] }
        Returns: Json
      }
      user_activity_summary_rls: {
        Args: never
        Returns: {
          account_created_at: string | null
          coach_assessments_given: number | null
          email: string | null
          first_name: string | null
          growth_plans_count: number | null
          is_active: boolean | null
          last_assessment_date: string | null
          last_coach_assessment_date: string | null
          last_growth_plan_update: string | null
          last_login_at: string | null
          last_name: string | null
          last_peer_assessment_given: string | null
          login_count: number | null
          peer_assessments_given: number | null
          peer_assessments_received: number | null
          role: Database["public"]["Enums"]["user_role"] | null
          sport: string | null
          team_id: string | null
          team_name: string | null
          total_assessments: number | null
          user_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "user_activity_summary"
          isOneToOne: false
          isSetofReturn: true
        }
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
