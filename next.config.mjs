/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [],
  },
  async rewrites() {
    return [
      {
        source: "/astelpo_26",
        destination: `${process.env.ASTELPO_URL}/astelpo_26`,
      },
      {
        source: "/astelpo_26/:path*",
        destination: `${process.env.ASTELPO_URL}/astelpo_26/:path*`,
      },
    ];
  },
};

export default nextConfig;
