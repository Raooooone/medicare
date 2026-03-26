/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Désactive Turbopack si nécessaire pour la compatibilité
  transpilePackages: ['@next-auth/prisma-adapter'],
};

export default nextConfig;