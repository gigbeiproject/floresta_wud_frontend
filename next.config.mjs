/** @type {import('next').NextConfig} */
const nextConfig = {
  
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.florestawud.com",
      },
      {
        protocol: "https",
        hostname: "example.com",
      },
      {
        protocol: "https",
        hostname: "peoplehealthssolutions.s3.eu-north-1.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
