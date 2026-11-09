import "server-only";
import { createUserClient, createAdminClient } from "@/lib/db/supabase";
import { HttpError } from "@/lib/http/errors";

export type Role = "owner" | "admin" | "editor" | "reviewer" | "viewer";
export const EDIT_ROLES: Role[] = ["owner", "admin", "editor"];
export const BILLING_ROLES: Role[] = ["owner", "admin"];

/** Returns the signed-in user or throws 401. Call it first in every protected route. */
export async function requireUser() {
  // getUser() re-validates the login token with Supabase (more secure than trusting a cookie).
  const { data, error } = await createUserClient().auth.getUser();
  if (error || !data.user) throw new HttpError(401, "Please sign in.");
  return data.user;
}

/**
 * Confirms the user belongs to the workspace with an allowed role.
 * Returns 404 (not 403) to non-members so attackers cannot probe which IDs exist.
 */
export async function requireWorkspaceRole(userId: string, workspaceId: string, allowed: Role[]) {
  const { data } = await createAdminClient()
    .from("workspace_members").select("role")
    .eq("workspace_id", workspaceId).eq("user_id", userId).eq("status", "active").maybeSingle();
  if (!data) throw new HttpError(404, "Not found.");
  if (!allowed.includes(data.role as Role)) throw new HttpError(403, "You do not have permission to do that.");
  return data.role as Role;
}

/** Loads a project and verifies the caller may act on it. This blocks "IDOR" attacks (guessing other people's IDs). */
export async function requireProjectAccess(userId: string, projectId: string, allowed: Role[]) {
  const { data: project } = await createAdminClient().from("projects").select("*").eq("id", projectId).maybeSingle();
  if (!project) throw new HttpError(404, "Not found.");
  await requireWorkspaceRole(userId, project.workspace_id, allowed);
  return project;
}

/** Platform administrators only (used by the admin console later). */
export async function requirePlatformAdmin(userId: string) {
  const { data } = await createAdminClient().from("profiles").select("is_platform_admin").eq("id", userId).maybeSingle();
  if (!data?.is_platform_admin) throw new HttpError(404, "Not found.");
}