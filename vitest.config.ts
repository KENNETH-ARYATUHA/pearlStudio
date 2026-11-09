import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: { environment: "node", include: ["tests/**/*.test.ts"] },
  // Lets tests use the same "@/..." import shortcut as the app.
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
});