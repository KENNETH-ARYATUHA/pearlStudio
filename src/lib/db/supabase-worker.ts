import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client: bypasses Row Level Security.
 * ONLY for trusted server code (credit ledger, job updates, worker).
 * Never import it into a browser component.
 * It reads env vars directly so the standalone worker can use it too.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars missing");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}