import { NextResponse } from "next/server";
import { route, HttpError } from "@/lib/http/errors";
import { requireUser, requireProjectAccess, EDIT_ROLES } from "@/lib/auth/guard";
import { createAdminClient } from "@/lib/db/supabase";
import { updateProjectSchema } from "@/lib/validation/schemas";
import { LIMITS } from "@/lib/credits/pricing";

type Ctx = { params: { id: string } };

/** GET /api/projects/:id - the project plus its ordered scenes. */
export const GET = route<Ctx>(async (_req, { params }) => {
  const user = await requireUser();
  const project = await requireProjectAccess(user.id, params.id, ["owner", "admin", "editor", "reviewer", "viewer"]);
  const { data: scenes } = await createAdminClient().from("scenes").select("*").eq("project_id", params.id).order("scene_number");
  return NextResponse.json({ project, scenes: scenes ?? [] });
});

/** PATCH /api/projects/:id - rename, archive, change ratio, or save edited scenes. */
export const PATCH = route<Ctx>(async (req, { params }) => {
  const user = await requireUser();
  const project = await requireProjectAccess(user.id, params.id, EDIT_ROLES);
  const body = updateProjectSchema.parse(await req.json());
  const db = createAdminClient();

  if (body.scenes) {
    // Enforce the total-length cap so users cannot dodge cost limits by editing.
    const total = body.scenes.reduce((n, s) => n + s.durationSec, 0);
    if (total > LIMITS.maxTotalDurationSec) throw new HttpError(400, `Total video length cannot exceed ${LIMITS.maxTotalDurationSec}s.`);

    // Replace the storyboard, but keep image/voice links for scenes whose number still exists.
    const { data: old } = await db.from("scenes").select("scene_number, image_asset_id, voice_asset_id").eq("project_id", params.id);
    const keep = new Map((old ?? []).map((o) => [o.scene_number, o]));
    await db.from("scenes").delete().eq("project_id", params.id);
    const { error } = await db.from("scenes").insert(body.scenes.map((s) => ({
      project_id: params.id, scene_number: s.sceneNumber, narration: s.narration,
      visual_prompt: s.visualPrompt, duration: s.durationSec,
      image_asset_id: keep.get(s.sceneNumber)?.image_asset_id ?? null,
      voice_asset_id: keep.get(s.sceneNumber)?.voice_asset_id ?? null,
    })));
    if (error) throw error;
  }

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.title) patch.title = body.title;
  if (body.aspectRatio) patch.aspect_ratio = body.aspectRatio;
  if (body.archived !== undefined) patch.archived_at = body.archived ? new Date().toISOString() : null;
  await db.from("projects").update(patch).eq("id", project.id);
  return NextResponse.json({ ok: true });
});