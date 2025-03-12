import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: { /* add these image domains to resolve image unconfigured host error */
    domains: 
      [
        'upload.wikimedia.org', 
        'res.cloudinary.com', 
        'm.media-amazon.com',
        'encrypted-tbn0.gstatic.com', 
      ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb'
    }
  }
};

export default nextConfig;
