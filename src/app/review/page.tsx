"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
// 👇 Đã thêm Trash2 (Thùng rác)
import { ArrowLeft, ShieldCheck, AlertTriangle, Search, Heart, Plus, Flame, MessageCircle, Trash2 } from 'lucide-react'; 
import CreateReviewModal from '@/components/CreateReviewModal';
import CommentSection from '@/components/CommentSection';

const timeAgo = (dateString: string) => {
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
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null); 
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); 

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);

  useEffect(() => {
    const delaySearch = setTimeout(() => { fetchReviews(); }, 500);
    return () => clearTimeout(delaySearch);
  }, [searchTerm, filterType]);

  const fetchReviews = async () => {
    setLoading(true);
    let query = supabase
      .from('reviews')
      .select('*, profiles(username, avatar_url, is_verified)')
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (searchTerm.trim()) query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
    if (filterType !== 'all') query = query.eq('type', filterType);
    
    const { data } = await query;
    if (data) setReviews(data);
    setLoading(false);
  };

  const toggleLikePost = async (reviewId: number, currentLikes: string[] | null) => {
    if (!user) return alert("Đăng nhập để thả tim nhé!");
    const userId = user.id;
    const likesArray = currentLikes || [];
    const newLikes = likesArray.includes(userId) 
      ? likesArray.filter(id => id !== userId) 
      : [...likesArray, userId];
    
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, liked_by: newLikes } : r));
    await supabase.from('reviews').update({ liked_by: newLikes }).eq('id', reviewId);
  };

  // 🗑️ HÀM XÓA BÀI VIẾT
  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm("Bạn có chắc muốn xóa bài viết này không? Hành động này không thể hoàn tác.")) return;

    // 1. Xóa trên giao diện trước (Optimistic)
    setReviews(prev => prev.filter(r => r.id !== reviewId));

    // 2. Gửi lệnh xóa lên server
    const { error } = await supabase.from('reviews').delete().eq('id', reviewId);

    if (error) {
      alert("Lỗi khi xóa: " + error.message);
      fetchReviews(); // Tải lại nếu xóa lỗi
    }
  };

  const hotReviews = [...reviews].sort((a, b) => ((b.liked_by?.length || 0) - (a.liked_by?.length || 0))).slice(0, 5);

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-4 md:p-8 pt-24">
      <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition">
        <ArrowLeft size={20} /> Quay lại trang chủ
      </Link>
      
      <div className="mb-8 text-center animate-in slide-in-from-top-4 duration-700">
        <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 mb-2 tracking-tighter">
          GÓC CHECK VAR 🕵️
        </h1>
        <p className="text-gray-400 text-sm">Review thật - Trải nghiệm thật - Không seeding</p>
        
        <button onClick={() => {
            if(!user) return alert("Vui lòng đăng nhập để viết bài!");
            setIsModalOpen(true);
          }} 
          className="bg-white text-black hover:bg-gray-200 px-6 py-3 rounded-full font-bold transition flex items-center gap-2 mx-auto mt-6 shadow-lg shadow-white/10 group active:scale-95">
          <div className="bg-black text-white rounded-full p-1 group-hover:rotate-90 transition"><Plus size={14} /></div>
          Viết Review Mới
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        
        {/* CỘT TRÁI: FEED */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#18181b] p-2 rounded-2xl border border-[#27272a] shadow-xl sticky top-24 z-20 backdrop-blur-md bg-opacity-80">
             <div className="relative mb-2">
               <Search className="absolute left-3 top-3.5 text-gray-500" size={18} />
               <input type="text" placeholder="Tìm kiếm địa điểm, tên quán..." className="w-full bg-[#09090b] border border-gray-800 rounded-xl py-3 pl-10 text-white focus:outline-none focus:border-purple-500 transition" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
             </div>
             <div className="grid grid-cols-3 gap-1 bg-[#09090b] p-1 rounded-xl border border-gray-800">
                <button onClick={() => setFilterType('all')} className={`py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${filterType === 'all' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}>Tất cả</button>
                <button onClick={() => setFilterType('hen_ho')} className={`py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 ${filterType === 'hen_ho' ? 'bg-green-600 text-white' : 'text-gray-500 hover:text-green-500'}`}><ShieldCheck size={14} /> Uy tín</button>
                <button onClick={() => setFilterType('boc_phot')} className={`py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 ${filterType === 'boc_phot' ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-red-500'}`}><AlertTriangle size={14} /> Phốt</button>
             </div>
          </div>

          {loading ? [1,2].map(i => <div key={i} className="h-40 bg-[#18181b] rounded-2xl animate-pulse"></div>) 
          : reviews.length === 0 ? (
            <div className="text-center py-20 text-gray-500 italic">Chưa có bài review nào.</div>
          ) : (
            reviews.map((review) => {
            const isLiked = review.liked_by?.includes(user?.id);
            // 👇 Kiểm tra xem user hiện tại có phải chủ bài viết không
            const isOwner = user?.id === review.user_id;

            return (
            <div key={review.id} className="bg-[#18181b] p-6 rounded-3xl border border-[#27272a] hover:border-gray-700 transition duration-300 group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-[2px]">
                      <img src={review.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${review.profiles?.username || 'U'}&background=random`} className="w-full h-full rounded-full object-cover border-2 border-[#18181b]" alt="user"/>
                   </div>
                   <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-white">{review.profiles?.username || "Ẩn danh"}</h3>
                        {review.type === 'boc_phot' ? (
                          <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded border border-red-500/20 font-black uppercase">Phốt</span>
                        ) : (
                          <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded border border-green-500/20 font-black uppercase">Uy tín</span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500">{timeAgo(review.created_at)}</p>
                   </div>
                </div>
              </div>

              <h3 className="font-black text-xl text-white mb-2 leading-tight">{review.title}</h3>
              <p className="text-gray-300 leading-relaxed mb-4 whitespace-pre-line text-sm">{review.content}</p>

              {review.image_url && (
                <div className="mb-4 rounded-xl overflow-hidden border border-gray-800">
                  <img src={review.image_url} alt="Review" className="w-full object-cover max-h-[400px]" />
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                <div className="flex items-center gap-4">
                    {/* Nút Like */}
                    <button onClick={() => toggleLikePost(review.id, review.liked_by || [])} className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition ${isLiked ? 'text-pink-500 bg-pink-500/10' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
                        <Heart size={18} fill={isLiked ? "currentColor" : "none"} className={isLiked ? "animate-bounce" : ""} />
                        <span className="text-xs font-bold">{review.liked_by?.length || 0}</span>
                    </button>

                    {/* Nút Bình luận */}
                    <div className="flex items-center gap-2 text-gray-500 px-3 py-1.5 cursor-pointer hover:text-white transition">
                        <MessageCircle size={18} />
                        <span className="text-xs font-bold">Bình luận</span>
                    </div>
                </div>

                {/* 👇 NÚT XÓA BÀI (Chỉ hiện nếu là chủ bài viết) */}
                {isOwner && (
                    <button 
                        onClick={() => handleDeleteReview(review.id)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition text-xs font-bold"
                    >
                        <Trash2 size={16} /> Xóa bài
                    </button>
                )}
              </div>

              <CommentSection reviewId={review.id} />
            </div>
          )}))}
        </div>

        {/* CỘT PHẢI (SIDEBAR) */}
        <div className="lg:col-span-1 hidden lg:block">
          <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6 sticky top-24">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-6">
              <Flame size={16} className="text-orange-500"/> Chủ đề Nóng
            </h3>
            <div className="space-y-5">
              {hotReviews.length === 0 ? <p className="text-gray-500 text-xs italic">Chưa có bài nào hot.</p> : 
               hotReviews.map((hot, idx) => (
                <div key={hot.id} className="flex gap-4 items-start group cursor-pointer">
                  <span className={`text-3xl font-black opacity-50 ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-400' : 'text-orange-800'}`}>{idx + 1}</span>
                  <div>
                    <p className="text-sm font-bold text-white line-clamp-2 group-hover:text-purple-400 transition leading-snug">{hot.title}</p>
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-500 font-bold uppercase tracking-wide">
                      <span className="flex items-center gap-1"><Heart size={10} /> {hot.liked_by?.length || 0} Likes</span>
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