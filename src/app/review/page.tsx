"use client";
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
// 👇 Đã thêm BookOpen vào import
import { 
  ArrowLeft, ShieldCheck, AlertTriangle, Search, Heart, Plus, Flame, 
  MessageSquare, Trash2, Loader2, BookOpen 
} from 'lucide-react'; 
import CreateReviewModal from '@/components/CreateReviewModal';
import CommentSection from '@/components/CommentSection';

const timeAgo = (dateString: string) => {
  if (!dateString) return "Vừa xong";
  const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " năm trước";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " tháng trước";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " ngày trước";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " giờ trước";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " phút trước";
  return "Vừa xong";
};

export default function ReviewPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null); 
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); 

  // --- 1. KIỂM TRA USER ---
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);

  // --- 2. FETCH DATA ---
  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('reviews')
        .select('*, profiles(username, avatar_url, is_verified)')
        .eq('is_approved', true) // Chỉ lấy bài đã duyệt
        .order('created_at', { ascending: false });

      if (searchTerm.trim()) {
        query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
      }
      
      if (filterType !== 'all') {
        query = query.eq('type', filterType);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      console.error("Lỗi fetch reviews:", err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterType]);

  useEffect(() => {
    const delaySearch = setTimeout(() => { fetchReviews(); }, 500);
    return () => clearTimeout(delaySearch);
  }, [fetchReviews]);

  // --- 3. ACTIONS ---
  const toggleLikePost = async (reviewId: number, currentLikes: string[] | null) => {
    if (!user) return alert("Bạn cần đăng nhập để thả tim nhé!");
    const userId = user.id;
    const likesArray = currentLikes || [];
    const newLikes = likesArray.includes(userId) 
      ? likesArray.filter(id => id !== userId) 
      : [...likesArray, userId];
    
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, liked_by: newLikes } : r));
    await supabase.from('reviews').update({ liked_by: newLikes }).eq('id', reviewId);
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm("⚠️ Bạn có chắc muốn xóa bài viết này vĩnh viễn không?")) return;
    setReviews(prev => prev.filter(r => r.id !== reviewId));
    const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
    if (error) {
      alert("Lỗi khi xóa: " + error.message);
      fetchReviews();
    } else {
      alert("Đã xóa bài viết thành công.");
    }
  };

  const hotReviews = [...reviews].sort((a, b) => ((b.liked_by?.length || 0) - (a.liked_by?.length || 0))).slice(0, 5);

  // --- 4. HÀM RENDER BADGE (NHÃN) ---
  const renderBadge = (type: string) => {
    switch (type) {
      case 'boc_phot':
        return <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded border border-red-500/20 font-black uppercase flex items-center gap-1"><AlertTriangle size={10}/> Phốt</span>;
      case 'uy_tin':
        return <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded border border-green-500/20 font-black uppercase flex items-center gap-1"><ShieldCheck size={10}/> Uy Tín</span>;
      case 'chia_se':
        return <span className="text-[10px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded border border-blue-500/20 font-black uppercase flex items-center gap-1"><BookOpen size={10}/> Chia sẻ</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-4 md:p-8 pt-24">
      <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-all group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
        <span className="text-sm font-bold uppercase tracking-widest">Trang chủ</span>
      </Link>
      
      <div className="mb-12 text-center animate-in slide-in-from-top-5 duration-700">
        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 mb-4 tracking-tighter italic">
          GÓC CHECK VAR 🕵️
        </h1>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.3em]">Review thật - Trải nghiệm thật - Vĩnh Long City</p>
        
        <button onClick={() => user ? setIsModalOpen(true) : alert("Vui lòng đăng nhập để đăng bài!")} 
          className="bg-white text-black hover:bg-orange-500 hover:text-white px-8 py-3 rounded-full font-black transition-all flex items-center gap-3 mx-auto mt-8 shadow-xl active:scale-95 uppercase text-xs tracking-widest">
          <Plus size={18} /> Viết Bài Ngay
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
        
        {/* CỘT TRÁI: DANH SÁCH BÀI VIẾT */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* BỘ LỌC & TÌM KIẾM */}
          <div className="bg-[#18181b]/80 backdrop-blur-xl p-3 rounded-3xl border border-white/5 sticky top-24 z-30 shadow-2xl">
              <div className="relative mb-3">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input type="text" placeholder="Tìm kiếm địa điểm, nội dung..." className="w-full bg-black border border-white/5 rounded-2xl py-4 pl-12 text-sm focus:border-purple-500 transition outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              
              {/* 👇 CẬP NHẬT BỘ LỌC: BÀI VIẾT -> UY TÍN -> PHỐT */}
              <div className="flex gap-2 bg-black p-1.5 rounded-2xl overflow-x-auto">
                 {[
                   { id: 'all', label: 'Tất cả', icon: null },
                   { id: 'chia_se', label: 'Bài Viết', icon: BookOpen, color: 'text-blue-500' }, // Mới
                   { id: 'uy_tin', label: 'Uy tín', icon: ShieldCheck, color: 'text-green-500' },
                   { id: 'boc_phot', label: 'Phốt', icon: AlertTriangle, color: 'text-red-500' }
                 ].map((tab) => (
                   <button key={tab.id} onClick={() => setFilterType(tab.id)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 min-w-[90px] ${filterType === tab.id ? 'bg-white/10 text-white shadow-inner' : 'text-gray-500 hover:text-gray-300'}`}>
                     {tab.icon && <tab.icon size={14} className={tab.color} />} {tab.label}
                   </button>
                 ))}
              </div>
          </div>

          {/* LIST BÀI VIẾT */}
          {loading ? (
             <div className="flex flex-col items-center py-20 gap-4">
                <Loader2 className="animate-spin text-purple-500" size={32} />
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Đang quét dữ liệu...</p>
             </div>
          ) : reviews.length === 0 ? (
            <div className="bg-[#18181b] rounded-3xl p-20 text-center border border-dashed border-gray-800">
               <p className="text-gray-500 font-bold italic">Chưa có bài viết nào ở mục này.</p>
               <p className="text-xs text-gray-600 mt-2">Hãy là người đầu tiên chia sẻ!</p>
            </div>
          ) : (
            reviews.map((review) => {
              const isLiked = review.liked_by?.includes(user?.id);
              const isOwner = user?.id === review.user_id;

              return (
                <div key={review.id} className="bg-[#18181b] p-6 md:p-8 rounded-[2.5rem] border border-white/5 hover:border-white/10 transition-all group relative overflow-hidden shadow-lg">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 p-[2px] shadow-lg">
                          <img src={review.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${review.profiles?.username || 'U'}&background=random`} className="w-full h-full rounded-2xl object-cover border-4 border-[#18181b]" alt="avatar"/>
                       </div>
                       <div>
                          <div className="flex items-center gap-3">
                            <h3 className="font-black text-sm uppercase tracking-tighter">{review.profiles?.username || "Ẩn danh"}</h3>
                            {/* 👇 RENDER BADGE THEO TYPE */}
                            {renderBadge(review.type)}
                          </div>
                          <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase italic opacity-60">{timeAgo(review.created_at)}</p>
                       </div>
                    </div>
                  </div>

                  <h3 className="font-black text-2xl text-white mb-4 leading-tight uppercase tracking-tighter">{review.title}</h3>
                  <p className="text-gray-400 leading-relaxed mb-6 whitespace-pre-line text-sm md:text-base">{review.content}</p>

                  {review.image_url && (
                    <div className="mb-6 rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
                      <img src={review.image_url} alt="Review" className="w-full object-cover max-h-[500px] hover:scale-105 transition-transform duration-700" />
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="flex items-center gap-2 md:gap-6">
                        <button onClick={() => toggleLikePost(review.id, review.liked_by)} className={`flex items-center gap-2 px-4 py-2 rounded-2xl transition-all ${isLiked ? 'text-pink-500 bg-pink-500/10' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
                            <Heart size={20} fill={isLiked ? "currentColor" : "none"} className={isLiked ? "animate-pulse" : ""} />
                            <span className="text-sm font-black">{review.liked_by?.length || 0}</span>
                        </button>
                        <div className="flex items-center gap-2 text-gray-500 px-4 py-2 rounded-2xl hover:bg-white/5 transition-all cursor-pointer">
                            <MessageSquare size={20} />
                            <span className="text-sm font-black">Phản hồi</span>
                        </div>
                    </div>

                    {isOwner && (
                        <button onClick={() => handleDeleteReview(review.id)} className="p-3 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all shadow-sm" title="Xóa bài viết">
                            <Trash2 size={20} />
                        </button>
                    )}
                  </div>
                  
                  <div className="mt-6">
                    <CommentSection reviewId={review.id} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* CỘT PHẢI: XU HƯỚNG */}
        <div className="lg:col-span-1 hidden lg:block">
          <div className="bg-[#18181b] rounded-[2.5rem] border border-white/5 p-8 sticky top-24 shadow-2xl">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-3 mb-8">
              <Flame size={18} className="text-orange-500 animate-pulse"/> Xu hướng hóng hớt
            </h3>
            <div className="space-y-8">
              {hotReviews.length === 0 ? <p className="text-gray-600 text-xs italic">Chưa có bài nào hot...</p> : 
               hotReviews.map((hot, idx) => (
                <div key={hot.id} className="flex gap-5 items-start group cursor-pointer">
                  <span className={`text-4xl font-black italic opacity-20 group-hover:opacity-100 transition-opacity ${idx === 0 ? 'text-orange-500' : 'text-gray-500'}`}>{idx + 1}</span>
                  <div>
                    <p className="text-sm font-black text-white line-clamp-2 group-hover:text-purple-400 transition-all leading-tight uppercase tracking-tighter">{hot.title}</p>
                    <div className="flex items-center gap-3 mt-2 text-[9px] text-gray-500 font-black uppercase tracking-widest">
                      <span className="flex items-center gap-1"><Heart size={10} fill="currentColor"/> {hot.liked_by?.length || 0}</span>
                      <span>•</span>
                      <span>{timeAgo(hot.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <CreateReviewModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={() => fetchReviews()} />
    </div>
  );
}