import { describe, expect, it } from "vitest";
import { briefSchema, createProjectSchema, sceneSchema } from "@/lib/validation/schemas";
import { estimateRenderCost } from "@/lib/credits/pricing";

describe("input validation", () => {
  it("applies sensible defaults to a minimal brief", () => {
    const b = briefSchema.parse({ topic: "Intro to PearlVector", audience: "Startups", goal: "Get contacted" });
    expect(b.language).toBe("English");
    expect(b.durationSeconds).toBe(45);
  });

  it("rejects videos longer than the cost-control cap", () => {
    expect(() => briefSchema.parse({ topic: "abc", audience: "xx", goal: "xx", durationSeconds: 999 })).toThrow();
  });

  it("rejects a project for a malformed workspace id", () => {
    expect(() => createProjectSchema.parse({ workspaceId: "not-a-uuid", title: "x", brief: { topic: "abc", audience: "xx", goal: "xx" } })).toThrow();
  });

  it("caps scene length", () => {
    expect(() => sceneSchema.parse({ sceneNumber: 1, narration: "", visualPrompt: "", durationSec: 31 })).toThrow();
  });
});

describe("pricing estimates", () => {
  it("charges more for 1080p than 720p", () => {
    expect(estimateRenderCost("1080p")).toBeGreaterThan(estimateRenderCost("720p"));
  });
});