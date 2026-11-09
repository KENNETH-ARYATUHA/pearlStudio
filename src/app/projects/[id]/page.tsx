import Link from "next/link";
import { notFound } from "next/navigation";
import { createUserClient } from "@/lib/db/supabase";

/**
 * Project page (server component). We read through Row Level Security, so if
 * the project belongs to someone else the query returns nothing and we show 404.
 */
export default async function ProjectPage({ params }: { params: { id: string } }) {
  const { data: project } = await createUserClient()
    .from("projects")
    .select("id, title, status, aspect_ratio, brief")
    .eq("id", params.id)
    .maybeSingle();

  if (!project) notFound();

  const brief = project.brief as {
    topic: string; audience: string; goal: string; language: string;
    tone: string; durationSeconds: number; callToAction?: string;
  };

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <Link href="/dashboard" className="text-sm text-pearl-navy">&larr; Back to projects</Link>

      <header>
        <h1 className="text-2xl font-bold text-pearl-navy">{project.title}</h1>
        <span className="mt-2 inline-block rounded bg-white px-2 py-1 text-xs uppercase text-slate-600">
          {project.status} &middot; {project.aspect_ratio}
        </span>
      </header>

      <section className="card space-y-2 text-sm">
        <h2 className="font-semibold text-pearl-navy">Your brief</h2>
        <p><b>Topic:</b> {brief.topic}</p>
        <p><b>Audience:</b> {brief.audience}</p>
        <p><b>Goal:</b> {brief.goal}</p>
        <p><b>Language / tone:</b> {brief.language} / {brief.tone}</p>
        <p><b>Length:</b> {brief.durationSeconds} seconds</p>
        {brief.callToAction && <p><b>Call to action:</b> {brief.callToAction}</p>}
      </section>

      <p className="card text-sm text-slate-600">
        Script generation arrives in Stage 5. For now, your project is safely stored.
      </p>
    </main>
  );
}