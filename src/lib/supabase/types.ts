export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AppRole = "owner" | "admin" | "editor" | "viewer";
export type AiProvider = "openai" | "gemini";
export type SocialPlatform = "linkedin" | "instagram" | "facebook" | "x";
export type OutputLanguage = "ar" | "en" | "ar_en";
export type GenerationStatus = "pending" | "completed" | "failed";

type TableDefinition<Row, Insert = Row, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

type TimestampColumns = {
  created_at: string;
};

type UpdatableTimestampColumns = TimestampColumns & {
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: TableDefinition<
        {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          is_super_admin: boolean;
          locale: OutputLanguage;
        } & UpdatableTimestampColumns,
        {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          is_super_admin?: boolean;
          locale?: OutputLanguage;
          created_at?: string;
          updated_at?: string;
        }
      >;
      brands: TableDefinition<
        {
          id: string;
          name: string;
          slug: string;
          industry: string | null;
          website_url: string | null;
          default_language: OutputLanguage;
          created_by: string;
        } & UpdatableTimestampColumns,
        {
          id?: string;
          name: string;
          slug: string;
          industry?: string | null;
          website_url?: string | null;
          default_language?: OutputLanguage;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        }
      >;
      brand_members: TableDefinition<
        {
          brand_id: string;
          user_id: string;
          role: AppRole;
          invited_by: string | null;
        } & TimestampColumns,
        {
          brand_id: string;
          user_id: string;
          role?: AppRole;
          invited_by?: string | null;
          created_at?: string;
        }
      >;
      brand_kits: TableDefinition<
        {
          id: string;
          brand_id: string;
          name: string;
          is_default: boolean;
          voice: string | null;
          audience: string | null;
          value_props: string | null;
          banned_terms: string | null;
          guidelines: Json;
          created_by: string;
        } & UpdatableTimestampColumns,
        {
          id?: string;
          brand_id: string;
          name?: string;
          is_default?: boolean;
          voice?: string | null;
          audience?: string | null;
          value_props?: string | null;
          banned_terms?: string | null;
          guidelines?: Json;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        }
      >;
      brand_provider_keys: TableDefinition<
        {
          id: string;
          brand_id: string;
          provider: AiProvider;
          vault_secret_id: string;
          masked_key: string;
          is_active: boolean;
          last_tested_at: string | null;
          last_test_status: string | null;
          created_by: string;
        } & UpdatableTimestampColumns
      >;
      generation_history: TableDefinition<
        {
          id: string;
          brand_id: string;
          user_id: string;
          provider: AiProvider;
          model: string;
          platform: SocialPlatform;
          language: OutputLanguage;
          status: GenerationStatus;
          prompt_snapshot: Json;
          input_payload: Json;
          output: Json;
          tokens: number;
          latency_ms: number | null;
          error_message: string | null;
          completed_at: string | null;
        } & TimestampColumns
      >;
      usage_events: TableDefinition<
        {
          id: string;
          brand_id: string;
          user_id: string | null;
          generation_id: string | null;
          event_type: string;
          provider: AiProvider | null;
          model: string | null;
          platform: SocialPlatform | null;
          language: OutputLanguage | null;
          tokens: number;
          metadata: Json;
        } & TimestampColumns
      >;
      admin_audit_logs: TableDefinition<
        {
          id: string;
          actor_user_id: string | null;
          brand_id: string | null;
          action: string;
          target_table: string | null;
          target_id: string | null;
          metadata: Json;
        } & TimestampColumns
      >;
    };
    Views: Record<string, never>;
    Functions: {
      find_profile_id_by_email_for_brand_admin: {
        Args: {
          target_brand_id: string;
          target_email: string;
        };
        Returns: string | null;
      };
    };
    Enums: {
      app_role: AppRole;
      ai_provider: AiProvider;
      social_platform: SocialPlatform;
      output_language: OutputLanguage;
      generation_status: GenerationStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
