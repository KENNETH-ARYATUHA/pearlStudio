import type { Metadata } from "next";
import "./globals.css";
import { BRAND } from "@/lib/config/brand";

export const metadata: Metadata = {
  title: BRAND.name,
  description: BRAND.tagline,
};

// The layout wraps EVERY page. `children` is whichever page is being shown.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-pearl-mist text-slate-900 antialiased">{children}</body>
    </html>
  );
}