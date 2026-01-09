/** @type {import('next').NextConfig} */
const nextConfig = {
  // 👇 Chỉ giữ lại phần này để ảnh hoạt động
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'naxqiycyohltyvhxbrig.supabase.co', // Supabase của bạn
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
    ],
  },
  // ❌ ĐÃ XÓA PHẦN REWRITES/REDIRECTS GÂY LỖI
};

export default nextConfig;