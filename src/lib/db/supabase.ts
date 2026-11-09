import "server-only";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getEnv } from "@/lib/config/env";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * User-scoped client: runs with the signed-in user's login token, so database
 * security rules apply. Use it for anything a user triggers directly.
 */
export function createUserClient() {
  const env = getEnv();
  const cookieStore = cookies();
  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list: CookieToSet[]) => {
        // Server Components cannot set cookies; middleware refreshes the session instead.
        try { list.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
      },
    },
  });
}

// Re-export so server code has one place to import both clients from.
export { createAdminClient } from "./supabase-worker";