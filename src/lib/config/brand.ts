/**
 * Single source of truth for brand constants.
 * Colour codes are PLACEHOLDERS: verify against the approved logo.
 * Change them here and both the web UI and the rendered videos follow.
 */
export const BRAND = {
  name: "PearlVector Studio",
  tagline: "Turn Ideas Into Impactful Stories.",
  colours: {
    navy: "#0B1F3A",
    green: "#1FA37A",
    background: "#FFFFFF",
    mist: "#F5F8FB",
  },
} as const;