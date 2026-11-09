"use client";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/db/supabase-browser";

/** Small client component: signing out must happen in the browser to clear the cookie. */
export default function SignOutButton() {
  const router = useRouter();
  async function signOut() {
    await createBrowserSupabase().auth.signOut();
    router.push("/");
    router.refresh();
  }
  return <button onClick={signOut} className="btn-ghost">Sign out</button>;
}