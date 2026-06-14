type ServerEnvKey =
  | "NEXT_PUBLIC_SUPABASE_URL"
  | "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  | "SUPABASE_SERVICE_ROLE_KEY"
  | "SUPABASE_VAULT_KEY_ID";

export function readServerEnv(key: ServerEnvKey): string | undefined {
  return process.env[key];
}
