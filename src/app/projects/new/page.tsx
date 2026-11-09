"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/db/supabase-browser";

/**
 * New-project wizard: collects the "brief" that will drive script generation.
 * The form data goes to POST /api/projects, which validates it again on the
 * server (never trust the browser).
 */
export default function NewProject() {
  const router = useRouter();
  const [workspaceId, setWorkspaceId] = useState<string>();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({
    title: "",
    topic: "",
    audience: "",
    goal: "",
    language: "English",
    tone: "Professional, confident, accessible",
    durationSeconds: 45,
    callToAction: "",
    aspectRatio: "16:9",
  });

  // One handler for every field: `k` is the field name, so we don't write 8 separate handlers.
  const set = (k: keyof typeof f) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setF({ ...f, [k]: k === "durationSeconds" ? Number(e.target.value) : e.target.value });

  // Look up the user's workspace once, when the page opens (Row Level Security limits it to theirs).
  useEffect(() => {
    createBrowserSupabase()
      .from("workspaces")
      .select("id")
      .limit(1)
      .then(({ data }) => setWorkspaceId(data?.[0]?.id));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        workspaceId,
        title: f.title || f.topic.slice(0, 60),
        aspectRatio: f.aspectRatio,
        brief: {
          topic: f.topic,
          audience: f.audience,
          goal: f.goal,
          language: f.language,
          tone: f.tone,
          durationSeconds: f.durationSeconds,
          callToAction: f.callToAction || undefined, // omit if empty
        },
      }),
    });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) return setError(json.error ?? "Could not create project.");
    router.push(`/projects/${json.id}`);
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-2xl font-bold text-pearl-navy">New video</h1>
      <form onSubmit={submit} className="card space-y-4">
        <label className="block text-sm">
          What is the video about?
          <textarea className="input mt-1" required rows={3} value={f.topic} onChange={set("topic")}
            placeholder="e.g. Introducing PearlVector: software, AI and cybersecurity services" />
        </label>

        <label className="block text-sm">
          Who is it for?
          <input className="input mt-1" required value={f.audience} onChange={set("audience")} />
        </label>

        <label className="block text-sm">
          What should viewers do or understand?
          <input className="input mt-1" required value={f.goal} onChange={set("goal")} />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm">
            Language
            <input className="input mt-1" value={f.language} onChange={set("language")} />
          </label>
          <label className="block text-sm">
            Length (seconds)
            <input className="input mt-1" type="number" min={15} max={180} value={f.durationSeconds} onChange={set("durationSeconds")} />
          </label>
          <label className="block text-sm">
            Tone
            <input className="input mt-1" value={f.tone} onChange={set("tone")} />
          </label>
          <label className="block text-sm">
            Format
            <select className="input mt-1" value={f.aspectRatio} onChange={set("aspectRatio")}>
              <option value="16:9">16:9 landscape</option>
              <option value="9:16">9:16 vertical</option>
              <option value="1:1">1:1 square</option>
            </select>
          </label>
        </div>

        <label className="block text-sm">
          Call to action (optional)
          <input className="input mt-1" value={f.callToAction} onChange={set("callToAction")} />
        </label>

        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

        <button className="btn-primary" disabled={busy || !workspaceId}>
          {busy ? "Creating..." : "Create project"}
        </button>
      </form>
    </main>
  );
}