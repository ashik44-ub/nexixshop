/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Google/NextAuth ছবির জন্য
      },
      {
        protocol: "https",
        hostname: "**.fbcdn.net", // ফেসবুকের সকল CDN সাবডোমেন অ্যালাউ করার জন্য
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
};

export default nextConfig;