import { z } from "zod";

/**
 * Validated environment variables.
 * Failing fast with a clear message beats a mysterious crash deep in a request.
 * Read lazily through getEnv() so `next build` does not need secrets.
 */
const schema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_STORAGE_BUCKET: z.string().default("media"),
  REDIS_URL: z.string().default("redis://127.0.0.1:6379"),
  TEXT_PROVIDER: z.enum(["mock", "anthropic"]).default("mock"),
  IMAGE_PROVIDER: z.enum(["mock"]).default("mock"),
  VOICE_PROVIDER: z.enum(["mock"]).default("mock"),
  VIDEO_PROVIDER: z.enum(["mock"]).default("mock"),
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_MODEL: z.string().default("claude-sonnet-4-6"),
  WEBHOOK_SIGNING_SECRET: z.string().min(8),
});

export type Env = z.infer<typeof schema>;
let cached: Env | undefined;

export function getEnv(): Env {
  if (!cached) {
    const parsed = schema.safeParse(process.env);
    if (!parsed.success) {
      // Print WHICH variables are wrong, never their values (they may be secrets).
      const names = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
      throw new Error(`Invalid or missing environment variables: ${names}`);
    }
    cached = parsed.data;
  }
  return cached;
}