import { NextResponse } from "next/server";
import { route } from "@/lib/http/errors";
import { requireUser, requireWorkspaceRole, EDIT_ROLES } from "@/lib/auth/guard";
import { createUserClient } from "@/lib/db/supabase";
import { createProjectSchema } from "@/lib/validation/schemas";

/** GET /api/projects - list the user's projects. Row Level Security does the filtering. */
export const GET = route(async () => {
  await requireUser();
  const { data, error } = await createUserClient()
    .from("projects").select("id, title, status, aspect_ratio, workspace_id, updated_at")
    .is("archived_at", null).order("updated_at", { ascending: false });
  if (error) throw error;
  return NextResponse.json({ projects: data });
});

/** POST /api/projects - create a project from a brief. */
export const POST = route(async (req: Request) => {
  const user = await requireUser();
  const body = createProjectSchema.parse(await req.json()); // throws -> 400 if invalid
  await requireWorkspaceRole(user.id, body.workspaceId, EDIT_ROLES); // explicit check; RLS is the safety net

  const { data, error } = await createUserClient().from("projects").insert({
    workspace_id: body.workspaceId, owner_id: user.id, title: body.title,
    brief: body.brief, aspect_ratio: body.aspectRatio,
  }).select("id").single();
  if (error) throw error;
  return NextResponse.json({ id: data.id }, { status: 201 });
});