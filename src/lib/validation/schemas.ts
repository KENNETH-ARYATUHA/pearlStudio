import { z } from "zod";

/**
 * Input validation. Every API route parses its request body through one of
 * these BEFORE touching the database. Never trust data from a browser.
 */

// The brief collected by the new-project wizard.
export const briefSchema = z.object({
  topic: z.string().min(3).max(500),
  audience: z.string().min(2).max(300),
  goal: z.string().min(2).max(500),
  language: z.string().min(2).max(40).default("English"),
  tone: z.string().min(2).max(60).default("Professional, confident, accessible"),
  durationSeconds: z.number().int().min(15).max(180).default(45), // cap = cost control
  callToAction: z.string().max(300).optional(),
});
export type Brief = z.infer<typeof briefSchema>;

export const aspectRatioSchema = z.enum(["16:9", "9:16", "1:1"]);

export const createProjectSchema = z.object({
  workspaceId: z.string().uuid(), // rejects anything that isn't a real UUID
  title: z.string().min(1).max(120),
  brief: briefSchema,
  aspectRatio: aspectRatioSchema.default("16:9"),
});

export const sceneSchema = z.object({
  sceneNumber: z.number().int().min(1),
  narration: z.string().max(2000),
  visualPrompt: z.string().max(1000),
  durationSec: z.number().min(1).max(30), // per-scene cap
});
export type SceneInput = z.infer<typeof sceneSchema>;

export const updateProjectSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  aspectRatio: aspectRatioSchema.optional(),
  archived: z.boolean().optional(),
  scenes: z.array(sceneSchema).max(30).optional(), // the user's edits to the storyboard
});

export const renderRequestSchema = z.object({
  resolution: z.enum(["720p", "1080p"]).default("720p"),
});

// What a text provider must return when generating a script + storyboard.
export const scriptOutputSchema = z.object({
  title: z.string(),
  scenes: z.array(sceneSchema).min(1).max(30),
});
export type ScriptOutput = z.infer<typeof scriptOutputSchema>;