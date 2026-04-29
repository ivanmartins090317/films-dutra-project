/**
 * Tipos do schema `public` no Supabase (PRD §5).
 * Regenerar quando o schema mudar (com CLI logado):
 * `npx supabase gen types typescript --project-id <ref> --schema public > types/database.ts`
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/** Enum labels espelhando `public.*` no Postgres */
export interface PublicEnums {
  user_role: "admin" | "student";
  lesson_status: "scheduled" | "completed" | "cancelled" | "missed";
  financial_type: "monthly" | "package" | "single";
  financial_status: "pending" | "paid" | "overdue";
  trip_registration_status: "interested" | "confirmed" | "cancelled";
  surf_level: "beginner" | "intermediate" | "advanced";
  weekly_frequency: "1x" | "2x" | "3x" | "weekend";
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: PublicEnums["user_role"];
          full_name: string;
          birth_year: number | null;
          birth_date: string | null;
          phone: string | null;
          address: string | null;
          sexual_orientation: string | null;
          height_cm: number | null;
          weight_kg: number | null;
          avatar_url: string | null;
          is_active: boolean;
          lgpd_accepted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: PublicEnums["user_role"];
          full_name?: string;
          birth_year?: number | null;
          birth_date?: string | null;
          phone?: string | null;
          address?: string | null;
          sexual_orientation?: string | null;
          height_cm?: number | null;
          weight_kg?: number | null;
          avatar_url?: string | null;
          is_active?: boolean;
          lgpd_accepted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: PublicEnums["user_role"];
          full_name?: string;
          birth_year?: number | null;
          birth_date?: string | null;
          phone?: string | null;
          address?: string | null;
          sexual_orientation?: string | null;
          height_cm?: number | null;
          weight_kg?: number | null;
          avatar_url?: string | null;
          is_active?: boolean;
          lgpd_accepted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      student_details: {
        Row: {
          id: string;
          student_id: string;
          surfs_already: boolean;
          surf_level: PublicEnums["surf_level"];
          surf_time_years: number;
          other_sports: string[];
          health_conditions: string;
          surgeries: string;
          menstrual_cycle: string | null;
          equipment_has: boolean;
          equipment_model: string;
          surf_goal: string;
          preferred_days: string[];
          weekly_frequency: PublicEnums["weekly_frequency"];
          suggestions: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          surfs_already?: boolean;
          surf_level?: PublicEnums["surf_level"];
          surf_time_years?: number;
          other_sports?: string[];
          health_conditions?: string;
          surgeries?: string;
          menstrual_cycle?: string | null;
          equipment_has?: boolean;
          equipment_model?: string;
          surf_goal?: string;
          preferred_days?: string[];
          weekly_frequency?: PublicEnums["weekly_frequency"];
          suggestions?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          surfs_already?: boolean;
          surf_level?: PublicEnums["surf_level"];
          surf_time_years?: number;
          other_sports?: string[];
          health_conditions?: string;
          surgeries?: string;
          menstrual_cycle?: string | null;
          equipment_has?: boolean;
          equipment_model?: string;
          surf_goal?: string;
          preferred_days?: string[];
          weekly_frequency?: PublicEnums["weekly_frequency"];
          suggestions?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "student_details_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      lessons: {
        Row: {
          id: string;
          student_id: string;
          scheduled_at: string;
          duration_min: number;
          status: PublicEnums["lesson_status"];
          cancel_reason: string;
          notes: string;
          skills_noted: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          scheduled_at: string;
          duration_min?: number;
          status?: PublicEnums["lesson_status"];
          cancel_reason?: string;
          notes?: string;
          skills_noted?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          scheduled_at?: string;
          duration_min?: number;
          status?: PublicEnums["lesson_status"];
          cancel_reason?: string;
          notes?: string;
          skills_noted?: string[];
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lessons_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      evolution_entries: {
        Row: {
          id: string;
          student_id: string;
          lesson_id: string | null;
          entry_date: string;
          content: string;
          skills: string[];
          media_urls: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          lesson_id?: string | null;
          entry_date: string;
          content?: string;
          skills?: string[];
          media_urls?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          lesson_id?: string | null;
          entry_date?: string;
          content?: string;
          skills?: string[];
          media_urls?: string[];
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "evolution_entries_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "evolution_entries_lesson_id_fkey";
            columns: ["lesson_id"];
            isOneToOne: false;
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          },
        ];
      };
      financials: {
        Row: {
          id: string;
          student_id: string;
          type: PublicEnums["financial_type"];
          amount: number;
          due_date: string;
          paid_at: string | null;
          status: PublicEnums["financial_status"];
          notes: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          type: PublicEnums["financial_type"];
          amount: number;
          due_date: string;
          paid_at?: string | null;
          status?: PublicEnums["financial_status"];
          notes?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          type?: PublicEnums["financial_type"];
          amount?: number;
          due_date?: string;
          paid_at?: string | null;
          status?: PublicEnums["financial_status"];
          notes?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "financials_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      surf_trips: {
        Row: {
          id: string;
          title: string;
          destination: string;
          trip_date: string;
          description: string;
          spots_total: number;
          spots_taken: number;
          cover_url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title?: string;
          destination?: string;
          trip_date: string;
          description?: string;
          spots_total?: number;
          spots_taken?: number;
          cover_url?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          destination?: string;
          trip_date?: string;
          description?: string;
          spots_total?: number;
          spots_taken?: number;
          cover_url?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      trip_registrations: {
        Row: {
          id: string;
          trip_id: string;
          student_id: string;
          status: PublicEnums["trip_registration_status"];
          created_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          student_id: string;
          status?: PublicEnums["trip_registration_status"];
          created_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          student_id?: string;
          status?: PublicEnums["trip_registration_status"];
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "trip_registrations_trip_id_fkey";
            columns: ["trip_id"];
            isOneToOne: false;
            referencedRelation: "surf_trips";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "trip_registrations_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      onboarding_tokens: {
        Row: {
          id: string;
          token: string;
          expires_at: string;
          used_at: string | null;
          notes: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          token: string;
          expires_at: string;
          used_at?: string | null;
          notes?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          token?: string;
          expires_at?: string;
          used_at?: string | null;
          notes?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "onboarding_tokens_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    /** Forma compatível com `GenericSchema` do supabase-js (evita inferência `never` em `.from()`). */
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: PublicEnums;
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

/** Linha da tabela `profiles` — uso onde o inferidor do Supabase client pode falhar. */
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
