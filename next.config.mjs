/** @type {import('next').NextConfig} */
const nextConfig = {
  // PDFKit এবং Fontkit-কে Turbopack বান্ডলার থেকে বাদ দিয়ে সার্ভারে রান করার জন্য
  serverExternalPackages: ["pdfkit", "fontkit"],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Google Profile Photos
      },
      {
        protocol: "https",
        hostname: "*.fbcdn.net", // Facebook CDN Images
      },
      {
        protocol: "https",
        hostname: "platform-lookaside.fbsbx.com", // Facebook Profile Pictures
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
};

export default nextConfig;