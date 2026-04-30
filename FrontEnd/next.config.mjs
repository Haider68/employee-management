/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
   
  reactStrictMode: false, 
  onDemandEntries: {
  
    maxInactiveAge: 25 * 1000,
     
    pagesBufferLength: 2,
  },
 
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
};

export default nextConfig;