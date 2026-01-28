"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Loader2, Send, AlertTriangle, ShieldCheck, CheckCircle } from 'lucide-react';

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
    type: 'uy_tin' // ✅ Mặc định là Uy Tín
  });

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return alert("Vui lòng điền đủ thông tin!");

    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        setLoading(false);
        return alert("Bạn cần đăng nhập để đăng bài!");
    }

    const { error } = await supabase.from('reviews').insert({
      title: formData.title,
      content: formData.content,
      type: formData.type,
      user_id: user.id,
      is_approved: false // ✅ Bắt buộc duyệt
    });

    setLoading(false);

    if (error) {
      alert("Lỗi: " + error.message);
    } else {
      setShowSuccessMessage(true);
      setFormData({ title: '', content: '', type: 'uy_tin' });
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
          <h3 className="font-black text-lg text-white uppercase tracking-tight">Viết Review Mới ✍️</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition bg-black/20 p-2 rounded-full hover:bg-white/10">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            {/* ✅ Nút Uy Tín nằm trước */}
            <button type="button" onClick={() => setFormData({ ...formData, type: 'uy_tin' })} className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition ${formData.type === 'uy_tin' ? 'bg-green-500/10 border-green-500 text-green-500 font-bold' : 'border-gray-800 text-gray-500 hover:bg-white/5 hover:border-gray-600'}`}>
              <ShieldCheck size={24} /> <span className="text-xs uppercase font-black">Uy Tín ✅</span>
            </button>
            <button type="button" onClick={() => setFormData({ ...formData, type: 'boc_phot' })} className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition ${formData.type === 'boc_phot' ? 'bg-red-500/10 border-red-500 text-red-500 font-bold' : 'border-gray-800 text-gray-500 hover:bg-white/5 hover:border-gray-600'}`}>
              <AlertTriangle size={24} /> <span className="text-xs uppercase font-black">Bóc Phốt 😡</span>
            </button>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Tiêu đề</label>
            <input type="text" placeholder="Ví dụ: Review quán cơm ngon..." className="w-full bg-black/50 border border-gray-800 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500 transition text-sm font-bold" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Nội dung</label>
            <textarea rows={5} placeholder="Chia sẻ chi tiết..." className="w-full bg-black/50 border border-gray-800 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500 transition resize-none text-sm" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110 text-white font-black py-4 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 uppercase tracking-widest text-xs shadow-lg shadow-purple-500/20 active:scale-95">
            {loading ? <Loader2 className="animate-spin" /> : <><Send size={16} /> Gửi bài ngay</>}
          </button>
        </form>
      </div>
    </div>
  );
}