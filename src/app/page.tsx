"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/db/supabase-browser";

/**
 * Sign in / sign up / password recovery using Supabase Auth.
 * "use client" at the top means this page runs in the browser, which it needs
 * for typing into forms and reacting to clicks.
 */
export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); // stop the browser's default page reload
    setBusy(true);
    setMessage(null);
    const supabase = createBrowserSupabase();

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return setMessage(error.message);
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      setBusy(false);
      if (error) return setMessage(error.message);
      // With "Confirm email" ON there is no session yet: ask the user to check their inbox.
      if (!data.session) return setMessage("Check your email to confirm your account, then sign in.");
    }
    router.push("/dashboard");
    router.refresh(); // makes server pages notice the new login cookie
  }

  async function recover() {
    if (!email) return setMessage("Enter your email first.");
    const { error } = await createBrowserSupabase().auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/dashboard`,
    });
    // Same message either way, so attackers cannot discover which emails have accounts.
    setMessage(error ? error.message : "If that account exists, a reset link is on its way.");
  }

  return (
    <main className="mx-auto mt-20 max-w-sm px-4">
      <form onSubmit={submit} className="card space-y-4">
        <h1 className="text-xl font-semibold text-pearl-navy">
          {mode === "signin" ? "Sign in" : "Create account"}
        </h1>

        <label className="block text-sm">
          Email
          <input className="input mt-1" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>

        <label className="block text-sm">
          Password
          <input className="input mt-1" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>

        {message && <p role="status" className="text-sm text-slate-700">{message}</p>}

        <button className="btn-primary w-full" disabled={busy}>
          {busy ? "Please wait..." : mode === "signin" ? "Sign in" : "Sign up"}
        </button>

        <div className="flex justify-between text-sm text-pearl-navy">
          <button type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
            {mode === "signin" ? "Need an account?" : "Have an account?"}
          </button>
          <button type="button" onClick={recover}>Forgot password?</button>
        </div>
      </form>
    </main>
  );
}