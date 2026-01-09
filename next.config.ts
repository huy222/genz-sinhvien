/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/he-thong-mat-24',
        destination: '/admin',
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/404',
        permanent: true,
      },
    ]
  }
};
export default nextConfig;