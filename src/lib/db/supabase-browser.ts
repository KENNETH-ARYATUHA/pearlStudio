"use client";
import { createBrowserClient } from "@supabase/ssr";

/** Browser client: uses the PUBLIC anon key only. Row Level Security protects the data. */
export const createBrowserSupabase = () =>
  createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);