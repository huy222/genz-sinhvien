import type { Config } from "tailwindcss";

const config: Config = {
  // QUAN TRỌNG: Dòng dưới đây bảo Tailwind quét mọi ngóc ngách
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}", 
  ],
  theme: {
    extend: {
      colors: {
        'genz-bg': '#09090b',
        'genz-card': '#18181b',
        'genz-border': '#27272a',
        'neon-purple': '#a855f7',
        'neon-green': '#22c55e',
        'neon-pink': '#ec4899',
        'neon-yellow': '#eab308',
      },
      // 👇 QUAN TRỌNG: Phải đặt animation VÀO TRONG "extend" 👇
      animation: {
        'scroll-up': 'scroll-up 3s linear infinite', // Mình chỉnh 15s cho nó nhanh hơn xíu cho mượt
      },
      keyframes: {
        'scroll-up': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-50%)' }, 
        },
      },
      // 👆 KẾT THÚC PHẦN EXTEND 👆
    },
  },
  plugins: [],
};
export default config;