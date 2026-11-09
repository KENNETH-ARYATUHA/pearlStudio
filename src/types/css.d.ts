/**
 * Tells TypeScript that importing a .css file for its side effects
 * (like `import "./globals.css"`) is valid. Next.js and Tailwind handle the
 * actual CSS at build time; TypeScript only needs to know the import is allowed.
 */
declare module "*.css";