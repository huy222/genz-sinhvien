const fs = require('fs');
const path = require('path');

// Hàm lấy nội dung file
const getFileContent = (key) => {
  switch (key) {
    case 'tailwind.config.ts':
      return `import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
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
      fontFamily: { sans: ['var(--font-geist-sans)'] },
    },
  },
  plugins: [],
};
export default config;`;

    case 'src/app/globals.css':
      return `@tailwind base;
@tailwind components;
@tailwind utilities;

:root { --foreground-rgb: 255, 255, 255; --background-start-rgb: 0, 0, 0; --background-end-rgb: 0, 0, 0; }
body { color: rgb(var(--foreground-rgb)); background: #09090b; }
.glass-effect { background: rgba(24, 24, 27, 0.6); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.1); }
.bento-card { @apply bg-genz-card rounded-3xl p-6 border border-genz-border transition-all duration-300 hover:border-gray-500 relative overflow-hidden group; }`;

    case 'src/components/Header.tsx':
      return `import Link from 'next/link';
import { Search } from 'lucide-react';

export default function Header() {
  return (
    <header className="fixed top-0 w-full z-50 glass-effect border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-black tracking-tighter hover:scale-105 transition">
          GENZ<span className="text-neon-purple">SINHVIEN</span>.
        </Link>
        <div className="hidden md:flex gap-8 font-medium text-gray-400 text-sm">
          <Link href="#" className="hover:text-white transition">Review</Link>
          <Link href="#" className="hover:text-white transition">Tài liệu</Link>
          <Link href="#" className="hover:text-white transition">Chợ Pass</Link>
          <Link href="#" className="hover:text-white transition">Tuyển dụng</Link>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 cursor-pointer">
            <Search size={18} />
          </div>
          <button className="bg-white text-black px-5 py-2 rounded-full font-bold text-sm hover:bg-gray-200 transition">
            Đăng nhập
          </button>
        </div>
      </div>
    </header>
  );
}`;

    case 'src/app/page.tsx':
      return `import Header from '@/components/Header';
import { ShieldCheck, FileText, ShoppingBag, Briefcase, Gift, ArrowUpRight, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <Header />
      <main className="max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neon-purple/30 bg-neon-purple/10 text-neon-purple text-xs font-bold uppercase tracking-wide mb-2">
            <Zap size={14} fill="currentColor" /> Beta Version 1.0
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white">
            Sống sót đại học <br/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple via-neon-pink to-neon-yellow">
              Theo hệ Gen Z
            </span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Nền tảng All-in-one: Né "red flag" nhà trọ, pass đồ giá rẻ, tìm việc uy tín và kho tài liệu mật.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-3 gap-4 h-auto md:h-[600px]">
          
          <div className="col-span-1 md:col-span-2 md:row-span-2 bento-card flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-neon-purple/20 blur-[80px] rounded-full pointer-events-none"></div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-neon-purple/20 flex items-center justify-center text-neon-purple mb-4">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Review "Chống Hớ"</h3>
              <p className="text-gray-400 text-sm">Xem review thật về trọ, quán ăn, giảng viên. Không seeding, 100% ẩn danh.</p>
            </div>
            <div className="mt-6 space-y-3">
              <div className="bg-white/5 p-3 rounded-lg border border-white/5 text-sm">
                <span className="text-neon-green font-bold">@sv_nam1:</span> Trọ hẻm 51 giá rẻ nhưng điện nước ảo lắm nha...
              </div>
              <div className="bg-white/5 p-3 rounded-lg border border-white/5 text-sm">
                <span className="text-neon-pink font-bold">@k48_neu:</span> Thầy Tuấn dạy Triết siêu cuốn, điểm danh dễ...
              </div>
            </div>
          </div>

          <div className="col-span-1 md:col-span-1 md:row-span-2 bento-card bg-gradient-to-b from-genz-card to-neon-pink/5 hover:border-neon-pink/50">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-lg bg-neon-pink/20 flex items-center justify-center text-neon-pink mb-4">
                <ShoppingBag size={20} />
              </div>
              <ArrowUpRight className="text-gray-500 group-hover:text-white transition" />
            </div>
            <h3 className="text-xl font-bold mb-1">Chợ Edu Pass</h3>
            <p className="text-xs text-gray-400 mb-4">Mua bán giáo trình, đồ cũ an toàn.</p>
          </div>

          <div className="col-span-1 md:col-span-1 md:row-span-1 bento-card hover:border-neon-green/50">
             <div className="w-8 h-8 rounded bg-neon-green/20 flex items-center justify-center text-neon-green mb-2">
                <FileText size={18} />
              </div>
            <h3 className="text-lg font-bold">Kho Tài Liệu</h3>
            <p className="text-xs text-gray-400">Đề thi, slide môn học.</p>
          </div>

           <div className="col-span-1 md:col-span-1 md:row-span-1 bento-card hover:border-blue-500/50">
             <div className="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center text-blue-500 mb-2">
                <Briefcase size={18} />
              </div>
            <h3 className="text-lg font-bold">Việc làm</h3>
            <p className="text-xs text-gray-400">Part-time đã kiểm duyệt.</p>
          </div>

          <div className="col-span-1 md:col-span-2 md:row-span-1 bento-card flex items-center gap-6 hover:border-neon-yellow/50">
            <div className="w-16 h-16 rounded-2xl bg-neon-yellow/10 flex items-center justify-center text-neon-yellow flex-shrink-0">
              <Gift size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold">Đặc quyền Email Edu</h3>
              <p className="text-sm text-gray-400">Tổng hợp mã giảm giá Canva, Spotify, Apple Music dành riêng cho sinh viên.</p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );`;
  }
};

const files = [
  'tailwind.config.ts',
  'src/app/globals.css',
  'src/components/Header.tsx',
  'src/app/page.tsx'
];

// Chạy vòng lặp tạo file
files.forEach((filePath) => {
  const absolutePath = path.join(__dirname, filePath);
  const dir = path.dirname(absolutePath);
  
  // Tạo thư mục nếu chưa có
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  
  // Ghi file
  fs.writeFileSync(absolutePath, getFileContent(filePath).trim());
  
  // Log ra màn hình (đã sửa lỗi cú pháp)
  console.log(`✅ Created: ${filePath}`);
});

console.log("\n🎉 SUCCESS! Run 'npm run dev' to start.");