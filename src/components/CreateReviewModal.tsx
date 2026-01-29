"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Loader2, Send, AlertTriangle, ShieldCheck, CheckCircle, BookOpen } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateReviewModal({ isOpen, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'chia_se' 
  });

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Logic tự động tạo Tiêu đề nếu đang ở chế độ "Bài Viết"
    let finalTitle = formData.title;
    
    if (formData.type === 'chia_se') {
        // Lấy 15 chữ đầu tiên làm tiêu đề, nếu không có thì để mặc định
        if (!formData.content.trim()) return alert("Vui lòng viết nội dung!");
        finalTitle = formData.content.split(' ').slice(0, 15).join(' ') + '...';
    } else {
        // Với Uy Tín/Phốt thì bắt buộc phải nhập tiêu đề (Tên quán/người)
        if (!formData.title.trim()) return alert("Vui lòng nhập tiêu đề (Tên địa điểm/người)!");
    }

    if (!formData.content.trim()) return alert("Nội dung không được để trống!");

    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        setLoading(false);
        return alert("Bạn cần đăng nhập để đăng bài!");
    }

    const { error } = await supabase.from('reviews').insert({
      title: finalTitle, // Sử dụng tiêu đề đã xử lý
      content: formData.content,
      type: formData.type,
      user_id: user.id,
      is_approved: false 
    });

    setLoading(false);

    if (error) {
      alert("Lỗi: " + error.message);
    } else {
      setShowSuccessMessage(true);
      setFormData({ title: '', content: '', type: 'chia_se' });
      setTimeout(() => {
        setShowSuccessMessage(false);
        onSuccess(); 
        onClose();
      }, 2000);
    }
  };

  if (showSuccessMessage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-[#18181b] w-full max-w-sm rounded-2xl border border-green-500/30 p-8 text-center animate-in zoom-in-95 shadow-2xl">
          <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
            <CheckCircle size={32} />
          </div>
          <h3 className="text-xl font-black text-white mb-2">Đã gửi thành công!</h3>
          <p className="text-gray-400 text-sm">
            Bài viết đang chờ <b>Admin duyệt</b> và sẽ sớm xuất hiện.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#18181b] w-full max-w-lg rounded-3xl border border-gray-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-white/5">
          <h3 className="font-black text-lg text-white uppercase tracking-tight">
             {formData.type === 'chia_se' ? 'Tạo Bài Viết Mới' : 'Viết Review / Bóc Phốt'} ✍️
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition bg-black/20 p-2 rounded-full hover:bg-white/10">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* CÁC NÚT CHỌN */}
          <div className="grid grid-cols-3 gap-3">
            <button type="button" onClick={() => setFormData({ ...formData, type: 'chia_se' })} className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition ${formData.type === 'chia_se' ? 'bg-blue-500/10 border-blue-500 text-blue-500 font-bold' : 'border-gray-800 text-gray-500 hover:bg-white/5 hover:border-gray-600'}`}>
              <BookOpen size={20} /> 
              <span className="text-[10px] uppercase font-black text-center">Bài Viết 📖</span>
            </button>

            <button type="button" onClick={() => setFormData({ ...formData, type: 'uy_tin' })} className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition ${formData.type === 'uy_tin' ? 'bg-green-500/10 border-green-500 text-green-500 font-bold' : 'border-gray-800 text-gray-500 hover:bg-white/5 hover:border-gray-600'}`}>
              <ShieldCheck size={20} /> 
              <span className="text-[10px] uppercase font-black text-center">Uy Tín ✅</span>
            </button>

            <button type="button" onClick={() => setFormData({ ...formData, type: 'boc_phot' })} className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition ${formData.type === 'boc_phot' ? 'bg-red-500/10 border-red-500 text-red-500 font-bold' : 'border-gray-800 text-gray-500 hover:bg-white/5 hover:border-gray-600'}`}>
              <AlertTriangle size={20} /> 
              <span className="text-[10px] uppercase font-black text-center">Bóc Phốt 😡</span>
            </button>
          </div>

          {/* Ô NHẬP TIÊU ĐỀ (CHỈ HIỆN KHI KHÔNG PHẢI LÀ BÀI VIẾT) */}
          {formData.type !== 'chia_se' && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">
                {formData.type === 'boc_phot' ? 'Phốt ai / Phốt quán nào?' : 'Tên quán / Địa điểm uy tín'}
              </label>
              <input type="text" placeholder="Ví dụ: Quán cơm A, Trọ hẻm B..." className="w-full bg-black/50 border border-gray-800 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500 transition text-sm font-bold" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            </div>
          )}

          {/* Ô NHẬP NỘI DUNG (ĐÃ CHỈNH SỬA CHO TO VÀ RÕ) */}
          <div className="relative">
            {formData.type === 'chia_se' && <label className="block text-[10px] font-black text-blue-500 mb-2 uppercase tracking-widest">Nội dung chia sẻ</label>}
            
            <textarea 
              rows={formData.type === 'chia_se' ? 8 : 5} // Bài viết thì ô to hơn
              placeholder={formData.type === 'chia_se' ? "Bạn đang nghĩ gì? Chia sẻ ngay..." : "Kể chi tiết trải nghiệm của bạn..."} 
              // 👇 CSS ĐÃ CHỈNH: text-lg (chữ to), font-medium (đậm vừa), leading-relaxed (giãn dòng)
              className={`w-full bg-black/50 border border-gray-800 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500 transition resize-none placeholder:text-gray-600 ${formData.type === 'chia_se' ? 'text-lg font-medium leading-relaxed' : 'text-sm'}`} 
              value={formData.content} 
              onChange={(e) => setFormData({ ...formData, content: e.target.value })} 
            />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110 text-white font-black py-4 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 uppercase tracking-widest text-xs shadow-lg shadow-purple-500/20 active:scale-95">
            {loading ? <Loader2 className="animate-spin" /> : <><Send size={16} /> Đăng ngay</>}
          </button>
        </form>
      </div>
    </div>
  );
}