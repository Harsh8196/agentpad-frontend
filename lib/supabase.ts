import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      flows: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          flow_data: any;
          user_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          flow_data: any;
          user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          flow_data?: any;
          user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      templates: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category: string;
          flow_data: any;
          is_official: boolean | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          category: string;
          flow_data: any;
          is_official?: boolean | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          category?: string;
          flow_data?: any;
          is_official?: boolean | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      flow_executions: {
        Row: {
          id: string;
          flow_id: string | null;
          user_id: string | null;
          status: string | null;
          started_at: string | null;
          completed_at: string | null;
          execution_time_ms: number | null;
          result_summary: any | null;
          error_details: string | null;
          report_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          flow_id?: string | null;
          user_id?: string | null;
          status?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          execution_time_ms?: number | null;
          result_summary?: any | null;
          error_details?: string | null;
          report_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          flow_id?: string | null;
          user_id?: string | null;
          status?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          execution_time_ms?: number | null;
          result_summary?: any | null;
          error_details?: string | null;
          report_url?: string | null;
          created_at?: string;
        };
      };
    };
  };
}

// Server-side client (with service role key)
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseAnonKey
); 