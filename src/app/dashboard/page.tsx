import Link from "next/link";
import { createUserClient } from "@/lib/db/supabase";
import { getBalance } from "@/lib/credits/ledger";
import SignOutButton from "@/components/SignOutButton";

/**
 * Dashboard: your projects, credit balance, and a "New video" button.
 * This is a SERVER component: it queries the database on the server, so no
 * data-fetching code is sent to the browser.
 */
export default async function Dashboard() {
  const db = createUserClient(); // acts as the signed-in user, so Row Level Security applies

  // RLS means this only ever returns workspaces the user belongs to.
  const { data: workspaces } = await db.from("workspaces").select("id, name").limit(1);
  const workspace = workspaces?.[0];

  const { data: projects } = await db
    .from("projects")
    .select("id, title, status, updated_at")
    .is("archived_at", null)
    .order("updated_at", { ascending: false })
    .limit(20);

  const balance = workspace ? await getBalance(workspace.id) : 0;

  return (
    <main className="mx-auto max-w-4xl p-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-pearl-navy">Your projects</h1>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-white px-3 py-1 text-sm shadow-sm" title="Credits pay for AI generation and exports">
            {balance} credits
          </span>
          <Link href="/projects/new" className="btn-accent">New video</Link>
          <SignOutButton />
        </div>
      </header>

      {!workspace && (
        <p className="card mb-4 text-sm text-red-700">
          No workspace found for your account. The sign-up trigger from Stage 2 (SQL Part B) may not have run.
        </p>
      )}

      {!projects?.length && (
        <p className="card text-slate-600">
          No projects yet. Click <b>New video</b> to turn your first idea into a story.
        </p>
      )}

      <ul className="space-y-3">
        {projects?.map((p) => (
          <li key={p.id}>
            <Link href={`/projects/${p.id}`} className="card flex items-center justify-between hover:border-pearl-green">
              <span className="font-medium">{p.title}</span>
              <span className="rounded bg-pearl-mist px-2 py-1 text-xs uppercase text-slate-600">{p.status}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}