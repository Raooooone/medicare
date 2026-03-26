/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // On ne met PLUS de bloc eslint ici pour Next.js 16
};

export default nextConfig;
// Build forced for JS mode - 2026