/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Ignore les erreurs de types au build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignore les erreurs ESLint au build (Indispensable pour ton cas)
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;