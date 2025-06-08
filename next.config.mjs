/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fakestoreapi.com",
      },
    ],
    unoptimized: true,
  },
  experimental: {
    serverActions: true,
  
    skipTrailingSlashRedirect: true,
   
    serverComponentsExternalPackages: [],
   
    allowedRevalidateHeaderKeys: [],
    
    webVitalsAttribution: ['all']
  },
 
  onDemandEntries: {

    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 4,
  },
};

export default nextConfig;/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fakestoreapi.com",
      },
    ],
    unoptimized: true,
  },
  experimental: {
    serverActions: true,
    
    skipTrailingSlashRedirect: true,
   
    serverComponentsExternalPackages: [],
    
    allowedRevalidateHeaderKeys: [],
    
    webVitalsAttribution: ['all']
  },
 
  onDemandEntries: {
    
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 4,
  },
};

export default nextConfig;