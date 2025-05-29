
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  // assetPrefix: './', // Removido/Comentado para compatibilidade com next/font e custom protocol no Electron
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true, // Adicionado para `next export`
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'acesso.siprov.com.br',
        port: '',
        pathname: '/siprov-web/imagem',
      }
    ],
  },
};

export default nextConfig;
