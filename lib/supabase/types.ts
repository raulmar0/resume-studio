export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      profiles: {
        Row: {
          created_at: string;
          display_name: string | null;
          id: string;
          tier: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          display_name?: string | null;
          id: string;
          tier?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          display_name?: string | null;
          id?: string;
          tier?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      resume_snapshots: {
        Row: {
          created_at: string;
          document: Json;
          id: string;
          resume_id: string;
        };
        Insert: {
          created_at?: string;
          document: Json;
          id?: string;
          resume_id: string;
        };
        Update: {
          created_at?: string;
          document?: Json;
          id?: string;
          resume_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "resume_snapshots_resume_id_fkey";
            columns: ["resume_id"];
            isOneToOne: false;
            referencedRelation: "resumes";
            referencedColumns: ["id"];
          },
        ];
      };
      resumes: {
        Row: {
          created_at: string;
          document: Json;
          id: string;
          template_id: string;
          theme: Json;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          document?: Json;
          id?: string;
          template_id?: string;
          theme?: Json;
          title?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          document?: Json;
          id?: string;
          template_id?: string;
          theme?: Json;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
