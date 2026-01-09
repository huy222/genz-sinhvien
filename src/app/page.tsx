"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ReviewMarquee from '@/components/ReviewMarquee';
import { supabase } from '@/lib/supabase';
import { ShieldCheck, FileText, ShoppingBag, Briefcase, Gift, Zap, ArrowUpRight, Megaphone } from 'lucide-react';

export default function Home() {
  const [banners, setBanners] = useState<any[]>([]);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    // Chỉ lấy banner đang BẬT (is_active = true)
    const { data } = await supabase
      .from('banner_config')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (data) setBanners(data);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-purple-500 selection:text-white">
      <main className="max-w-6xl mx-auto pt-12 pb-12 px-6">
        
        {/* HERO SECTION */}
        <div className="text-center mb-16 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs font-bold uppercase tracking-wide mb-2">
            <Zap size={14} fill="currentColor" /> Beta Version 1.0
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white">
            Cộng Đồng Sinh Viên <br/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500">
              Chuẩn Hệ Gen Z
            </span>
          </h1>

          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Nền tảng All-in-one: Né "red flag" nhà trọ, pass đồ giá rẻ, tìm việc uy tín và kho tài liệu mật.
          </p>
        </div>

        {/* BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-3 gap-4 h-auto md:h-[600px]">
          
          {/* Ô 1: REVIEW */}
          <Link href="/review" className="col-span-1 md:col-span-2 md:row-span-2 bg-[#18181b] rounded-3xl p-6 border border-[#27272a] hover:border-purple-500/50 transition duration-300 relative overflow-hidden group cursor-pointer flex flex-col">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 blur-[80px] rounded-full pointer-events-none"></div>
            <div className="relative z-10 flex-shrink-0">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Góc Check VAR 🧐</h3>
              <p className="text-gray-400 text-sm">
                Soi review thật về trọ, quán ăn. Nói không với seeding, 100% ẩn danh.
              </p>
            </div>
            <ReviewMarquee />
          </Link>

          {/* Ô 2: CHỢ PASS */}
          <Link href="/market" className="col-span-1 md:col-span-1 md:row-span-2 bg-[#18181b] rounded-3xl p-6 border border-[#27272a] hover:border-pink-500/50 transition duration-300 flex flex-col justify-between cursor-pointer group">
            <div>
               <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-500 group-hover:scale-110 transition">
                  <ShoppingBag size={20} />
                </div>
                <ArrowUpRight className="text-gray-500 group-hover:text-pink-500 transition" />
              </div>
              <h3 className="text-xl font-bold mb-1">Chợ Pass</h3>
              <p className="text-xs text-gray-400">Giáo trình, đồ cũ.</p>
            </div>
            <div className="w-full h-24 bg-white/5 rounded-lg border border-dashed border-gray-700 flex items-center justify-center text-xs text-gray-500 mt-4 group-hover:border-pink-500/30 transition">
              Ảnh sản phẩm
            </div>
          </Link>

          {/* Ô 3: TÀI LIỆU */}
          <Link href="/docs" className="col-span-1 md:col-span-1 md:row-span-1 bg-[#18181b] rounded-3xl p-6 border border-[#27272a] hover:border-green-500/50 transition duration-300 cursor-pointer group">
             <div className="w-8 h-8 rounded bg-green-500/20 flex items-center justify-center text-green-500 mb-2 group-hover:scale-110 transition">
                <FileText size={18} />
             </div>
            <h3 className="text-lg font-bold">Kho Tài Liệu</h3>
            <p className="text-xs text-gray-400">Đề thi, slide.</p>
          </Link>

          {/* Ô 4: VIỆC LÀM */}
           <Link href="/jobs" className="col-span-1 md:col-span-1 md:row-span-1 bg-[#18181b] rounded-3xl p-6 border border-[#27272a] hover:border-blue-500/50 transition duration-300 cursor-pointer group">
             <div className="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center text-blue-500 mb-2 group-hover:scale-110 transition">
                <Briefcase size={18} />
             </div>
            <h3 className="text-lg font-bold">Việc làm</h3>
            <p className="text-xs text-gray-400">Part-time uy tín.</p>
          </Link>

          {/* --- KHU VỰC HIỂN THỊ BANNER (ĐÃ NÂNG CẤP) --- */}
          {banners.map((banner) => (
            <div 
              key={banner.id} 
              className="col-span-1 md:col-span-2 md:row-span-1 rounded-3xl border border-[#27272a] transition duration-500 relative overflow-hidden group cursor-pointer"
            >
              {/* TRƯỜNG HỢP A: CÓ ẢNH */}
              {banner.image_url ? (
                <>
                  {/* Ảnh nền */}
                  <img 
                    src={banner.image_url} 
                    alt={banner.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Lớp phủ đen để chữ dễ đọc */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                  
                  {/* Nội dung chữ đè lên ảnh */}
                  <div className="absolute bottom-0 left-0 p-6 w-full">
                    <div className="inline-flex items-center gap-1 bg-orange-500 text-black text-[10px] font-black uppercase px-2 py-0.5 rounded mb-2">
                       <Megaphone size={10} /> Hot
                    </div>
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-1 drop-shadow-md">
                      {banner.title}
                    </h3>
                    <p className="text-xs text-gray-200 line-clamp-1 font-medium drop-shadow-sm opacity-90">
                      {banner.description}
                    </p>
                  </div>
                </>
              ) : (
                /* TRƯỜNG HỢP B: KHÔNG CÓ ẢNH (Dùng giao diện cũ) */
                <div className="bg-[#18181b] w-full h-full p-6 flex items-center gap-4 hover:bg-[#202023] transition">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 flex-shrink-0 group-hover:scale-110 transition">
                    <Gift size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold group-hover:text-yellow-500 transition">{banner.title}</h3>
                    <p className="text-xs text-gray-400 line-clamp-2">{banner.description}</p>
                  </div>
                </div>
              )}
            </div>
          ))}

        </div>
      </main>
    </div>
  );
}