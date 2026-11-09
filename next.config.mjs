/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Remotion and the queue libraries contain native code and must never be
  // bundled by Next.js. Only the worker process uses them.
  experimental: {
    serverComponentsExternalPackages: ["@remotion/renderer", "@remotion/bundler", "bullmq", "ioredis"],
  },
};
export default nextConfig;
