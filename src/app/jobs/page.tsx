"use client";
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  Search, Briefcase, MapPin, DollarSign, 
  Phone, Plus, Star, Zap, Trash2, X, Crown, Building2,
  Lock, LogIn, Loader2
} from 'lucide-react';
import CreateJobModal from '@/components/CreateJobModal';

// 1. Hàm định dạng tiền tệ VNĐ
const formatPrice = (price: number | string) => {
  if (!price || price === 0 || price === "0") return "Thỏa thuận";
  return new Intl.NumberFormat('vi-VN').format(Number(price)) + "K/ 1 Giờ";
};

// 2. Hàm tính thời gian đăng bài
const timeAgo = (dateString: string) => {
  const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
  let interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " ngày trước";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " giờ trước";
  return "Vừa xong";
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);
  const [showLoginRequest, setShowLoginRequest] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isVipSystemActive, setIsVipSystemActive] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkUser();
    fetchSettings();
    fetchJobs();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchSettings = async () => {
    const { data } = await supabase.from('app_settings').select('enable_market_vip').eq('id', 1).single();
    if (data) setIsVipSystemActive(data.enable_market_vip);
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('jobs')
        .select(`
          *,
          profiles:user_id (username, avatar_url, is_verified)
        `)
        .eq('is_approved', true);

      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }

      // Sắp xếp VIP lên đầu, sau đó đến tin mới nhất
      const { data, error } = await query
        .order('is_vip', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (err: any) {
      console.error("Lỗi fetch Jobs:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (id: number) => {
    if (!confirm("Xóa tin tuyển dụng này?")) return;
    const { error } = await supabase.from('jobs').delete().eq('id', id);
    if (!error) {
      setJobs(prev => prev.filter(j => j.id !== id));
    }
  };

  const toggleVip = async (job: any) => {
    const newStatus = !job.is_vip;
    const { error } = await supabase.from('jobs').update({ is_vip: newStatus }).eq('id', job.id);
    if (!error) {
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, is_vip: newStatus } : j));
    }
  };

  const isAdmin = user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-4 md:p-8 pt-24">
      
      {/* HEADER SECTION */}
      <div className="text-center mb-10 animate-in slide-in-from-top-4 duration-500">
        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 mb-4 tracking-tighter">
          VIỆC LÀM SINH VIÊN
        </h1>
        <p className="text-gray-400 text-sm md:text-base font-medium max-w-2xl mx-auto">
          Tìm việc nhanh, uy tín gần trường bạn. Né "red flag" tuyển dụng cùng cộng đồng Gen Z.
        </p>

        {user && (
          <div className="flex flex-wrap justify-center gap-4 mt-8 animate-in fade-in zoom-in duration-700">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-white text-black hover:bg-gray-200 px-8 py-3.5 rounded-full font-black uppercase tracking-widest transition shadow-xl flex items-center gap-2 active:scale-95"
            >
              <Plus className="bg-black text-white rounded-full p-0.5" size={18} />
              Đăng Tin Tuyển Dụng
            </button>

            {isVipSystemActive && (
              <button 
                onClick={() => setIsVipModalOpen(true)}
                className="bg-gradient-to-r from-yellow-600 to-yellow-400 text-black px-8 py-3.5 rounded-full font-black uppercase tracking-widest transition shadow-lg hover:brightness-110 flex items-center gap-2 active:scale-95"
              >
                <Zap size={18} fill="black" /> Đẩy Tin VIP
              </button>
            )}
          </div>
        )}
      </div>

      {/* SEARCH BOX */}
      <div className="sticky top-20 z-30 max-w-4xl mx-auto mb-12">
        <div className="bg-[#18181b]/80 backdrop-blur-xl rounded-2xl flex items-center border border-white/5 p-1 shadow-2xl">
           <Search className="text-gray-500 ml-4" size={20} />
           <input 
             type="text" 
             placeholder="Tìm kiếm công việc (Gia sư, Phục vụ...)" 
             value={searchTerm} 
             onChange={(e) => setSearchTerm(e.target.value)}
             onKeyDown={(e) => e.key === 'Enter' && fetchJobs()}
             className="w-full bg-transparent border-none text-white p-4 focus:outline-none font-medium placeholder:text-gray-600" 
           />
           <button onClick={fetchJobs} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold mr-1 hover:bg-blue-500 transition">Tìm</button>
        </div>
      </div>

      {/* JOBS LIST */}
      {/* JOBS LIST */}
<div className="max-w-4xl mx-auto space-y-4">
  {loading ? (
    // HIỆU ỨNG SKELETON KHI ĐANG TẢI
    <div className="space-y-4 animate-in fade-in duration-500">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-[#18181b] rounded-3xl p-6 border border-gray-800 flex flex-col md:flex-row gap-6">
          {/* Skeleton Icon Box */}
          <div className="w-16 h-16 rounded-2xl bg-gray-800/50 animate-pulse flex-shrink-0" />
          
          <div className="flex-1 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                {/* Skeleton Title */}
                <div className="h-6 w-48 md:w-64 bg-gray-800/50 rounded-lg animate-pulse" />
                {/* Skeleton Badges */}
                <div className="flex gap-4">
                  <div className="h-4 w-20 bg-gray-800/30 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-gray-800/30 rounded animate-pulse" />
                  <div className="h-4 w-16 bg-gray-800/30 rounded animate-pulse" />
                </div>
              </div>
            </div>
            {/* Skeleton Description */}
            <div className="space-y-2">
              <div className="h-3 w-full bg-gray-800/20 rounded animate-pulse" />
              <div className="h-3 w-3/4 bg-gray-800/20 rounded animate-pulse" />
            </div>
            {/* Skeleton Footer */}
            <div className="flex justify-between items-center pt-4 border-t border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-800/50 animate-pulse" />
                <div className="h-3 w-20 bg-gray-800/30 rounded animate-pulse" />
              </div>
              <div className="h-10 w-32 bg-gray-800/50 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  ) : jobs.length === 0 ? (
    // ... phần giữ nguyên cũ
           <div className="flex flex-col items-center py-20">
             <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
             <p className="text-gray-500 font-medium animate-pulse">Đang tải danh sách việc làm...</p>
           </div>
        ) : jobs.length === 0 ? (
           <div className="text-center py-20 bg-[#18181b] rounded-3xl border border-dashed border-gray-800">
             <Briefcase size={48} className="mx-auto text-gray-700 mb-4" />
             <p className="text-gray-500 font-bold">Chưa có tin tuyển dụng nào phù hợp.</p>
           </div>
        ) : (
          jobs.map((job) => {
            const isOwner = user?.id === job.user_id;
            const displayName = user ? (job.profiles?.username || 'Thành viên') : 'Người dùng ẩn';
            const displayAvatar = user ? (job.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${job.profiles?.username}&background=random`) : `https://ui-avatars.com/api/?name=?&background=333`;

            return (
              <div key={job.id} className={`group bg-[#18181b] rounded-3xl p-6 border transition-all duration-300 relative flex flex-col md:flex-row gap-6 ${job.is_vip ? 'border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.05)]' : 'border-gray-800 hover:border-blue-500/30'}`}>
                
                {/* ICON BOX */}
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 border ${job.is_vip ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-gray-900 border-gray-800'}`}>
                   <Briefcase size={32} className={job.is_vip ? "text-yellow-500" : "text-gray-500"} />
                </div>

                <div className="flex-1">
                   <div className="flex justify-between items-start mb-2">
                     <div>
                       <h3 className={`text-xl font-black tracking-tight ${job.is_vip ? 'text-yellow-500 uppercase italic' : 'text-white'}`}>
                         {job.title} {job.is_vip && <Zap size={16} fill="currentColor" className="inline ml-1 animate-pulse"/>}
                       </h3>
                       <div className="flex flex-wrap gap-4 text-xs font-bold text-gray-500 mt-2">
                         <span className="flex items-center gap-1.5"><Building2 size={14}/> {job.employer || "Cá nhân"}</span>
                         <span className="flex items-center gap-1.5"><MapPin size={14}/> {job.location}</span>
                         <span className="flex items-center gap-1.5 text-green-500"><DollarSign size={14} className="bg-green-500/10 rounded-full p-0.5"/> {formatPrice(job.salary)}</span>
                       </div>
                     </div>
                     {isAdmin && (
                        <button onClick={() => toggleVip(job)} className={`p-2 rounded-xl transition ${job.is_vip ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-500 hover:text-white'}`}><Star size={18} fill={job.is_vip ? "currentColor" : "none"}/></button>
                     )}
                   </div>

                   <p className="text-sm text-gray-400 line-clamp-2 mb-6 leading-relaxed">{job.description}</p>

                   <div className="flex items-center justify-between border-t border-white/5 pt-4">
                      <div className="flex items-center gap-2">
                        <img src={displayAvatar} className="w-6 h-6 rounded-full ring-2 ring-white/5" alt="avatar"/>
                        <span className="text-[11px] font-bold text-gray-400">{displayName}</span>
                        <span className="text-[10px] text-gray-600 font-medium tracking-tighter">/ {timeAgo(job.created_at)}</span>
                      </div>

                      <div className="flex gap-2">
                        {(isOwner || isAdmin) && (
                          <button onClick={() => handleDeleteJob(job.id)} className="p-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={16}/></button>
                        )}
                        
                        {user ? (
                          <a href={`tel:${job.contact}`} className="px-5 py-2.5 bg-white text-black rounded-xl font-black text-xs hover:bg-blue-500 hover:text-white transition-all flex items-center gap-2 shadow-lg active:scale-95">
                            <Phone size={14} fill="currentColor"/> GỌI NGAY: {job.contact}
                          </a>
                        ) : (
                          <button onClick={() => setShowLoginRequest(true)} className="px-5 py-2.5 bg-gray-800 text-gray-400 rounded-xl font-black text-xs flex items-center gap-2 hover:bg-gray-700 transition-all border border-white/5 italic">
                             <Lock size={12}/> {job.contact?.slice(0, 4)}*** (Ẩn)
                          </button>
                        )}
                      </div>
                   </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* MODALS */}
      <CreateJobModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={() => fetchJobs()} />
      
      {showLoginRequest && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
           <div className="bg-[#18181b] w-full max-w-xs rounded-3xl border border-white/10 shadow-2xl p-8 relative text-center">
             <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
               <Lock size={40} className="text-blue-500" />
             </div>
             <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Dừng lại tí!</h3>
             <p className="text-gray-400 text-xs mb-8 leading-relaxed">Bạn cần đăng nhập để xem thông tin liên hệ và kết nối với nhà tuyển dụng.</p>
             <div className="space-y-3">
               <button onClick={() => router.push('/login')} className="w-full py-4 rounded-2xl bg-blue-600 text-white font-black text-sm uppercase tracking-widest hover:bg-blue-500 transition shadow-xl active:scale-95 flex items-center justify-center gap-2">
                 <LogIn size={18} /> Đăng nhập ngay
               </button>
               <button onClick={() => setShowLoginRequest(false)} className="w-full py-4 rounded-2xl bg-white/5 text-gray-500 font-black text-xs uppercase tracking-widest hover:bg-white/10 transition">Để sau</button>
             </div>
           </div>
         </div>
      )}
    </div>
  );
}