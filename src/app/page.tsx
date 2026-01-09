"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ReviewMarquee from '@/components/ReviewMarquee';
import { supabase } from '@/lib/supabase';
import { ShieldCheck, FileText, ShoppingBag, Briefcase, Gift, Zap, ArrowUpRight, Megaphone, Loader2 } from 'lucide-react';

export default function Home() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('banner_config')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setBanners(data || []);
    } catch (err) {
      console.error("Lỗi tải banner:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-purple-500 selection:text-white pb-20">
      <main className="max-w-6xl mx-auto pt-24 px-6">
        
        {/* HERO SECTION */}
        <div className="text-center mb-16 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs font-bold uppercase tracking-wide mb-2">
            <Zap size={14} fill="currentColor" /> Beta Version 2.0
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white leading-tight">
            Cộng Đồng Sinh Viên <br/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500">
              Chuẩn Hệ Gen Z
            </span>
          </h1>

          <p className="text-gray-400 max-w-2xl mx-auto text-base md:text-lg">
            Nền tảng All-in-one: Né "red flag" nhà trọ, pass đồ giá rẻ, tìm việc uy tín và kho tài liệu mật.
          </p>
        </div>

        {/* BENTO GRID SYSTEM */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-min">
          
          {/* Ô 1: REVIEW (To nhất) */}
          <Link href="/review" className="md:col-span-2 md:row-span-2 bg-[#18181b] rounded-3xl p-8 border border-[#27272a] hover:border-purple-500/50 transition duration-500 relative overflow-hidden group flex flex-col min-h-[300px]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 blur-[80px] rounded-full pointer-events-none"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition duration-500">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-2xl font-black text-white mb-2 uppercase italic tracking-tighter">Góc Check VAR 🧐</h3>
              <p className="text-gray-400 text-sm leading-relaxed max-w-[250px]">
                Soi review thật về trọ, quán ăn. Nói không với seeding, 100% ẩn danh.
              </p>
            </div>
            <div className="mt-auto pt-8">
               <ReviewMarquee />
            </div>
          </Link>

          {/* Ô 2: CHỢ PASS */}
          <Link href="/market" className="md:col-span-1 md:row-span-2 bg-[#18181b] rounded-3xl p-8 border border-[#27272a] hover:border-pink-500/50 transition duration-500 flex flex-col justify-between group min-h-[300px]">
            <div>
               <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-pink-500/20 flex items-center justify-center text-pink-500 group-hover:rotate-12 transition duration-500">
                  <ShoppingBag size={24} />
                </div>
                <ArrowUpRight className="text-gray-600 group-hover:text-pink-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition duration-500" />
              </div>
              <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Chợ Pass</h3>
              <p className="text-sm text-gray-400 mt-2">Săn giáo trình, đồ cũ giá "hạt dẻ".</p>
            </div>
            <div className="w-full h-32 bg-gradient-to-br from-white/5 to-transparent rounded-2xl border border-dashed border-gray-800 flex items-center justify-center text-[10px] uppercase font-black tracking-widest text-gray-600 mt-6 group-hover:border-pink-500/30 transition">
              Sản phẩm mới hôm nay
            </div>
          </Link>

          {/* Ô 3: TÀI LIỆU */}
          <Link href="/docs" className="md:col-span-1 bg-[#18181b] rounded-3xl p-6 border border-[#27272a] hover:border-green-500/50 transition duration-500 group">
             <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-green-500 mb-4 group-hover:scale-110 transition">
                <FileText size={20} />
             </div>
            <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Kho Tài Liệu</h3>
            <p className="text-xs text-gray-500 mt-1">Đề thi, Slide, Tài liệu mật.</p>
          </Link>

          {/* Ô 4: VIỆC LÀM */}
          <Link href="/jobs" className="md:col-span-1 bg-[#18181b] rounded-3xl p-6 border border-[#27272a] hover:border-blue-500/50 transition duration-500 group">
             <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500 mb-4 group-hover:scale-110 transition">
                <Briefcase size={20} />
             </div>
            <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Việc làm</h3>
            <p className="text-xs text-gray-500 mt-1">Part-time uy tín cho Gen Z.</p>
          </Link>

          {/* --- KHU VỰC BANNER DYNAMIC --- */}
          {loading ? (
            <div className="md:col-span-4 h-32 flex items-center justify-center text-gray-600 italic text-xs tracking-widest">
              <Loader2 className="animate-spin mr-2" size={14} /> LOADING HOT NEWS...
            </div>
          ) : (
            banners.map((banner) => (
              <div 
                key={banner.id} 
                className="md:col-span-2 h-[180px] rounded-3xl border border-[#27272a] transition duration-500 relative overflow-hidden group cursor-pointer"
              >
                {banner.image_url ? (
                  <>
                    <img 
                      src={banner.image_url} 
                      alt={banner.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-6 w-full">
                      <div className="inline-flex items-center gap-1 bg-yellow-500 text-black text-[10px] font-black uppercase px-2 py-0.5 rounded mb-2 shadow-lg">
                         <Megaphone size={10} /> Ưu đãi hot
                      </div>
                      <h3 className="text-xl font-black text-white uppercase italic tracking-tighter drop-shadow-lg">
                        {banner.title}
                      </h3>
                      <p className="text-xs text-gray-300 line-clamp-1 font-medium mt-1">
                        {banner.description}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="bg-[#18181b] w-full h-full p-8 flex items-center gap-6 hover:bg-[#1c1c20] transition">
                    <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 flex-shrink-0 group-hover:rotate-6 transition">
                      <Gift size={32} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">{banner.title}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{banner.description}</p>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}

        </div>
      </main>
    </div>
  );
}