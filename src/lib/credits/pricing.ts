/**
 * Credit pricing and limits. EVERY NUMBER IS A PLACEHOLDER.
 * Set real prices only after measuring actual provider costs.
 */
export const CREDIT_COSTS = {
  script: 1,
  imagePerScene: 1,
  voicePerScene: 1,
  clipPerSecond: 2,
  render720p: 2,
  render1080p: 4,
} as const;

/** Guard rails against runaway cost. */
export const LIMITS = {
  maxTotalDurationSec: 180,
  maxSceneDurationSec: 30,
  maxConcurrentJobsPerWorkspace: 3,
} as const;

export function estimateScriptCost() { return CREDIT_COSTS.script; }

export function estimateAssetCost(kind: "image" | "voice", sceneCount: number) {
  return (kind === "image" ? CREDIT_COSTS.imagePerScene : CREDIT_COSTS.voicePerScene) * sceneCount;
}

export function estimateRenderCost(resolution: "720p" | "1080p") {
  return resolution === "1080p" ? CREDIT_COSTS.render1080p : CREDIT_COSTS.render720p;
}