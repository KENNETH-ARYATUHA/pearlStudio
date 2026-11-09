import { createAdminClient } from "@/lib/db/supabase-worker";

/**
 * Thin TypeScript wrappers around the SQL functions you created in Stage 2.
 * The real logic lives in Postgres so check-and-reserve is ONE atomic
 * transaction (two simultaneous requests cannot both spend the same credits).
 *
 * Lifecycle of a paid job (used in later stages):
 *   reserveCredits -> credits held when the job is accepted
 *   settleCredits  -> output delivered, the charge is final
 *   releaseCredits -> job failed, credits go back
 *
 * No Next.js imports here, so the background worker can reuse this file.
 */
export class InsufficientCreditsError extends Error {
  name = "InsufficientCreditsError";
  constructor() { super("Not enough credits for this action."); }
}

export async function getBalance(workspaceId: string): Promise<number> {
  const { data, error } = await createAdminClient().rpc("credit_balance", { ws: workspaceId });
  if (error) throw error;
  return data as number;
}

export async function reserveCredits(workspaceId: string, amount: number, jobId: string) {
  const { error } = await createAdminClient().rpc("reserve_credits", {
    p_workspace: workspaceId, p_amount: amount, p_reference: jobId,
  });
  if (error?.message.includes("INSUFFICIENT_CREDITS")) throw new InsufficientCreditsError();
  if (error) throw error;
}

export async function settleCredits(workspaceId: string, jobId: string) {
  const { error } = await createAdminClient().rpc("settle_credits", { p_workspace: workspaceId, p_reference: jobId });
  if (error) throw error;
}

export async function releaseCredits(workspaceId: string, jobId: string) {
  const { error } = await createAdminClient().rpc("release_credits", { p_workspace: workspaceId, p_reference: jobId });
  if (error) throw error;
}