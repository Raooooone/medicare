/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // On ne met PLUS de bloc eslint ici pour Next.js 16
};

export default nextConfig;
// Nettoyage final TS - 2026