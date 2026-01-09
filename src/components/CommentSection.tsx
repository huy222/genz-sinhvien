"use client";
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Send, UserCircle, Loader2, Heart, Trash2 } from 'lucide-react';
import { timeAgo } from '@/lib/utils'; 

export default function CommentSection({ reviewId }: { reviewId: number }) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // Ref để tự động cuộn xuống cuối
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUser();
    fetchComments();

    // Lắng nghe Realtime
    const channel = supabase
      .channel('realtime-comments')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'comments', filter: `review_id=eq.${reviewId}` }, 
        (payload) => {
           // Có thay đổi là tải lại ngay
           fetchComments();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [reviewId]);

  // Tự động cuộn xuống khi có comment mới
  useEffect(() => {
    scrollToBottom();
  }, [comments]);

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*, profiles(username, avatar_url)') 
      .eq('review_id', reviewId)
      .order('created_at', { ascending: true }); // Cũ nhất lên trên, mới nhất dưới cùng
    if (data) setComments(data);
  };

  // ❤️ HÀM XỬ LÝ LIKE
  const toggleLike = async (commentId: number, currentLikes: string[] | null) => {
    if (!user) return alert("Đăng nhập để thả tim nha!");
    
    const userId = user.id;
    const likesArray = currentLikes || [];
    let newLikes;

    if (likesArray.includes(userId)) {
      newLikes = likesArray.filter(id => id !== userId);
    } else {
      newLikes = [...likesArray, userId];
    }

    // Optimistic Update (Cập nhật giao diện trước)
    setComments(prev => prev.map(c => c.id === commentId ? { ...c, liked_by: newLikes } : c));

    // Update Server
    await supabase.from('comments').update({ liked_by: newLikes }).eq('id', commentId);
  };

  // 💬 HÀM GỬI BÌNH LUẬN
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    setLoading(true);

    const { error } = await supabase.from('comments').insert({
      content: newComment,
      review_id: reviewId,
      user_id: user.id
    });

    if (!error) {
      setNewComment('');
      // Gọi fetch ngay để người dùng thấy cmt của mình liền (đề phòng Realtime chậm)
      await fetchComments(); 
      scrollToBottom();
    } else {
        alert("Lỗi gửi: " + error.message);
    }
    setLoading(false);
  };

  // 🗑️ HÀM XÓA BÌNH LUẬN
  const handleDelete = async (id: number) => {
    if(!confirm("Xóa bình luận này?")) return;
    
    // Xóa giao diện trước
    setComments(prev => prev.filter(c => c.id !== id));
    
    await supabase.from('comments').delete().eq('id', id);
  };

  return (
    <div className="mt-6 pt-6 border-t border-gray-800">
      <h4 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2">
        Bình luận <span className="bg-gray-800 text-white px-2 py-0.5 rounded-full text-xs">{comments.length}</span>
      </h4>
      
      {/* DANH SÁCH BÌNH LUẬN */}
      <div className="space-y-4 max-h-80 overflow-y-auto mb-6 custom-scrollbar pr-2">
        {comments.map((cmt) => {
          const isLiked = cmt.liked_by?.includes(user?.id);
          const isOwner = user?.id === cmt.user_id;
          
          return (
            <div key={cmt.id} className="group flex gap-3 items-start text-sm animate-in fade-in slide-in-from-bottom-2">
               {/* Avatar */}
               <div className="mt-1 flex-shrink-0">
                  {cmt.profiles?.avatar_url ? (
                    <img src={cmt.profiles.avatar_url} alt="avt" className="w-8 h-8 rounded-full object-cover border border-gray-700"/>
                  ) : (
                    <UserCircle size={32} className="text-gray-600" />
                  )}
               </div>

               <div className="flex-1">
                  <div className="bg-[#27272a] p-3 rounded-2xl rounded-tl-none border border-gray-800 relative hover:border-gray-600 transition">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-xs text-purple-400">
                          {cmt.profiles?.username || "Người dùng ẩn danh"}
                        </span>
                        <span className="text-[10px] text-gray-500">{timeAgo(cmt.created_at)}</span>
                      </div>
                      <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{cmt.content}</p>
                  </div>
                  
                  {/* Action Bar */}
                  <div className="flex items-center gap-4 mt-1 ml-2">
                    <button 
                      onClick={() => toggleLike(cmt.id, cmt.liked_by)}
                      className={`text-[10px] font-bold flex items-center gap-1 transition ${isLiked ? 'text-pink-500' : 'text-gray-500 hover:text-pink-500'}`}
                    >
                      <Heart size={12} fill={isLiked ? "currentColor" : "none"} /> 
                      {cmt.liked_by?.length > 0 ? cmt.liked_by.length : 'Thích'}
                    </button>

                    {(isOwner || user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) && (
                       <button onClick={() => handleDelete(cmt.id)} className="text-[10px] font-bold text-gray-600 hover:text-red-500 transition flex items-center gap-1">
                         <Trash2 size={12} /> Xóa
                       </button>
                    )}
                  </div>
               </div>
            </div>
          );
        })}
        {/* Điểm neo để cuộn xuống */}
        <div ref={commentsEndRef} />
      </div>

      {/* Ô NHẬP LIỆU */}
      {user ? (
        <form onSubmit={handleSend} className="relative group">
          <input
            type="text"
            placeholder="Viết bình luận..."
            className="w-full bg-[#18181b] border border-gray-700 rounded-full py-3 px-5 pr-12 text-sm text-white focus:outline-none focus:border-purple-500 focus:bg-black transition placeholder:text-gray-600"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={loading}
          />
          <button type="submit" disabled={loading || !newComment.trim()} className="absolute right-2 top-2 p-1.5 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:opacity-50 disabled:bg-gray-700 transition">
            {loading ? <Loader2 size={16} className="animate-spin"/> : <Send size={16} />}
          </button>
        </form>
      ) : (
        <div className="text-center p-4 bg-[#18181b] rounded-xl border border-gray-800">
            <p className="text-xs text-gray-500">Bạn cần đăng nhập để bình luận</p>
        </div>
      )}
    </div>
  );
}