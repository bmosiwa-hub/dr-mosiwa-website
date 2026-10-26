/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [],
  },
  async redirects() {
    return [
      // AstelPO moved to its own origin. Invite and view links already sent by
      // email point here, so these must keep working. sw.js is deliberately
      // excluded: that path still serves the kill switch that retires the old
      // service worker, and redirecting it would leave it registered forever.
      {
        source: "/astelpo_26",
        destination: "https://astelpo.astellic.com/today",
        permanent: true,
      },
      {
        source: "/astelpo_26/:path((?!sw\.js$).*)",
        destination: "https://astelpo.astellic.com/:path",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      // Standalone static prototype in public/; serve it at the clean URL.
      {
        source: "/fp-financing-prototype",
        destination: "/fp-financing-prototype/index.html",
      },
    ];
  },
};

export default nextConfig;
