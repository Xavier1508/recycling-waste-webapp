/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        // Anda bisa menambahkan port dan pathname jika perlu, tapi untuk placehold.co biasanya tidak
        // port: '',
        // pathname: '/account123/**',
      },
      // Tambahkan hostname lain di sini jika ada
    ],
  },
};

module.exports = nextConfig;