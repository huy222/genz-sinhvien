"use client";
import { useState, useEffect } from 'react';
import { X, Loader2, Link as LinkIcon, FileText, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateDocModal({ isOpen, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false); // ✅ State cho thông báo đẹp
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({ 
    title: '', 
    school: '', 
    subject: '', 
    file_url: '' 
  });

  useEffect(() => {
    if (isOpen) {
      const getUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      };
      getUser();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title || !form.file_url) return;
    if (!user) return;

    setLoading(true);

    try {
      // ✅ LOGIC TỰ ĐỘNG DUYỆT CHO ADMIN
      const isAdmin = user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

      const { error } = await supabase.from('documents').insert([
        {
          ...form,
          user_id: user.id,
          is_approved: isAdmin, // Admin đăng là hiện ngay
        }
      ]);

      if (error) throw error;

      // ✅ HIỆN TOAST THÀNH CÔNG ĐẸP
      setShowSuccess(true);
      onSuccess();
      
      // Tự động đóng modal sau 2 giây
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
        setForm({ title: '', school: '', subject: '', file_url: '' });
      }, 2000);

    } catch (err: any) {
      console.error("Lỗi gửi tài liệu:", err);
      alert("Lỗi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#18181b] w-full max-w-md rounded-3xl border border-gray-800 shadow-2xl p-8 relative overflow-hidden">
        
        {/* ✅ LỚP PHỦ THÔNG BÁO THÀNH CÔNG (TOAST UI) */}
        {showSuccess && (
          <div className="absolute inset-0 bg-green-500 z-10 flex flex-col items-center justify-center text-black animate-in fade-in zoom-in duration-300">
            <div className="bg-black text-green-500 p-4 rounded-full mb-4 shadow-xl animate-bounce">
              <CheckCircle2 size={48} />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tighter">Thành công!</h3>
            <p className="font-bold text-sm opacity-80 text-center px-6">
              {user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL 
                ? "Bài viết đã được hiển thị ngay lập tức." 
                : "Tài liệu đã được gửi, đang chờ phê duyệt."}
            </p>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col">
            <h3 className="font-black text-white text-xl flex items-center gap-2 uppercase tracking-tighter">
              <FileText className="text-green-500" size={24}/> Chia sẻ Tài liệu
            </h3>
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1">Hệ thống kho lưu trữ mật</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition">
            <X className="text-gray-400 hover:text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 ml-1 tracking-widest">Tên tài liệu</label>
            <input 
              type="text" 
              placeholder="VD: Đề thi Kỹ thuật lập trình 2024" 
              value={form.title} 
              onChange={e => setForm({...form, title: e.target.value})} 
              className="w-full bg-black border border-gray-800 rounded-2xl p-4 text-white focus:border-green-500 outline-none transition shadow-inner" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 ml-1 tracking-widest">Trường học</label>
                <input 
                  type="text" 
                  placeholder="VD: HUST, UEH..." 
                  value={form.school} 
                  onChange={e => setForm({...form, school: e.target.value})} 
                  className="w-full bg-black border border-gray-800 rounded-2xl p-4 text-white focus:border-green-500 outline-none transition" 
                />
             </div>
             <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 ml-1 tracking-widest">Môn học</label>
                <input 
                  type="text" 
                  placeholder="VD: Giải tích 1" 
                  value={form.subject} 
                  onChange={e => setForm({...form, subject: e.target.value})} 
                  className="w-full bg-black border border-gray-800 rounded-2xl p-4 text-white focus:border-green-500 outline-none transition" 
                />
             </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 ml-1 tracking-widest">Đường dẫn tài liệu (Link Drive/PDF)</label>
            <div className="relative">
                <LinkIcon size={18} className="absolute left-4 top-4 text-gray-600" />
                <input 
                  type="text" 
                  placeholder="Dán link Drive công khai tại đây..." 
                  value={form.file_url} 
                  onChange={e => setForm({...form, file_url: e.target.value})} 
                  className="w-full bg-black border border-gray-800 rounded-2xl p-4 pl-12 text-white focus:border-green-500 outline-none transition" 
                />
            </div>
            <p className="text-[9px] text-gray-600 mt-3 italic px-1 leading-relaxed">
              * Hệ thống tự động ghi nhận danh tính người đóng góp để tích điểm sinh viên ưu tú.
            </p>
          </div>

          <button 
            disabled={loading} 
            className="w-full bg-green-500 text-black font-black py-5 rounded-2xl hover:bg-green-400 transition flex items-center justify-center gap-2 uppercase text-xs shadow-xl shadow-green-500/10 active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Xác nhận chia sẻ ngay"}
          </button>
        </form>
      </div>
    </div>
  );
}