import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Lint is clean (0 errors); let the build enforce it. Warnings don't fail builds.
    ignoreDuringBuilds: false,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
};

export default nextConfig;
