
import type {NextConfig} from 'next';

// IMPORTANT: Replace 'your-repo-name' with the actual name of your GitHub repository
// If your GitHub Pages site is at the root (e.g., username.github.io),
// then set basePath to '' and assetPrefix to '/'.
const repoName = 'calistenia'; // <<<<====== UPDATED WITH YOUR REPO NAME

const nextConfig: NextConfig = {
  output: 'export', // Enables static HTML export
  basePath: process.env.NODE_ENV === 'production' ? `/${repoName}` : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? `/${repoName}/` : '',
  images: {
    unoptimized: true, // Necessary for static exports with next/image
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
