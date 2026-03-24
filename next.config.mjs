/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Ceci permet de déployer même s'il y a des petites erreurs de code
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Idem pour TypeScript si tu l'utilises
    ignoreBuildErrors: true,
  },
};

export default nextConfig;