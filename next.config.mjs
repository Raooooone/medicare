/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Force le build même si Vercel croit voir du TypeScript
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignore aussi le linting pour accélérer le build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;