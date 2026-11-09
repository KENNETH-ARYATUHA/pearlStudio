import type { Config } from "tailwindcss";

// Brand colours are PLACEHOLDERS. Verify against the approved PearlVector logo.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        pearl: { navy: "#0B1F3A", green: "#1FA37A", mist: "#F5F8FB" },
      },
    },
  },
  plugins: [],
};
export default config;