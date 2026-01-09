"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Loader2, Send, AlertTriangle, ShieldCheck } from 'lucide-react';

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
    type: 'boc_phot' // Mặc định là Phốt
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return alert("Vui lòng điền đủ thông tin!");

    setLoading(true);
    
    // 1. Lấy User
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        setLoading(false);
        return alert("Bạn cần đăng nhập để đăng bài!");
    }

    // 2. Gửi dữ liệu vào bảng 'reviews'
    const { error } = await supabase.from('reviews').insert({
      title: formData.title,
      content: formData.content,
      type: formData.type,
      user_id: user.id,
      is_approved: true
    });

    setLoading(false);

    if (error) {
      alert("Lỗi: " + error.message);
    } else {
      setFormData({ title: '', content: '', type: 'boc_phot' });
      onSuccess(); 
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#18181b] w-full max-w-lg rounded-2xl border border-gray-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header Review */}
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
          <h3 className="font-bold text-lg text-white">Viết Review / Bóc Phốt ✍️</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        {/* Form Review */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setFormData({ ...formData, type: 'boc_phot' })} className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition ${formData.type === 'boc_phot' ? 'bg-red-500/20 border-red-500 text-red-500 font-bold' : 'border-gray-700 text-gray-400 hover:bg-gray-800'}`}>
              <AlertTriangle size={18} /> Bóc Phốt 😡
            </button>
            <button type="button" onClick={() => setFormData({ ...formData, type: 'hen_ho' })} className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition ${formData.type === 'hen_ho' ? 'bg-green-500/20 border-green-500 text-green-500 font-bold' : 'border-gray-700 text-gray-400 hover:bg-gray-800'}`}>
              <ShieldCheck size={18} /> Uy Tín ✅
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Tiêu đề</label>
            <input type="text" placeholder="Ví dụ: Cảnh báo trọ hẻm 51..." className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 transition" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Nội dung</label>
            <textarea rows={5} placeholder="Kể chi tiết trải nghiệm..." className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 transition resize-none" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Đăng Bài Ngay</>}
          </button>
        </form>
      </div>
    </div>
  );
}