/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Cloudinary (production uploads)
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      // Unsplash (placeholder images trong seed data)
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // Pravatar (avatar placeholder trong seed data)
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
    ],
  },
}

export default nextConfig
