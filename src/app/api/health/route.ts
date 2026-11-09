import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/db/supabase-worker";

/**
 * GET /api/health - confirms the app can reach the database.
 * Handy for monitoring later, and for debugging setup problems now.
 */
export async function GET() {
  const { error, count } = await createAdminClient()
    .from("workspaces")
    .select("id", { count: "exact", head: true });

  if (error) {
    return NextResponse.json({ ok: false, problem: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, workspaces: count });
}