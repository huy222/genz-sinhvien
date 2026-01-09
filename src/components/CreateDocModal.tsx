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
  const [showSuccess, setShowSuccess] = useState(false);
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
    
    // Lấy User mới nhất để chắc chắn ID chuẩn
    const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();

    if (!currentUser || userError) {
      return alert("Bạn cần đăng nhập để thực hiện tác vụ này!");
    }

    if (!form.title.trim() || !form.file_url.trim()) {
      return alert("Vui lòng dán link tài liệu và nhập tiêu đề!");
    }

    setLoading(true);

    try {
      const isAdmin = currentUser.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

      // Thực hiện gửi dữ liệu
      const { error } = await supabase.from('documents').insert([
        {
          title: form.title.trim(),
          school: form.school.trim(),
          subject: form.subject.trim(),
          file_url: form.file_url.trim(),
          user_id: currentUser.id, // ID này bắt buộc phải có trong bảng profiles
          is_approved: isAdmin ? true : false,
        }
      ]);

      if (error) {
        // Xử lý lỗi 23503: Chưa có profile
        if (error.code === '23503') {
          throw new Error("Tài khoản của bạn chưa được xác thực trong hệ thống profiles. Vui lòng đăng xuất và đăng nhập lại!");
        }
        // Xử lý lỗi 23505/409: Trùng dữ liệu
        if (error.code === '23505' || error.code === '409') {
          throw new Error("Tài liệu này đã tồn tại (Trùng link hoặc tiêu đề)!");
        }
        throw error;
      }

      // THÀNH CÔNG
      setShowSuccess(true);
      onSuccess();
      
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
        setForm({ title: '', school: '', subject: '', file_url: '' });
      }, 2000);

    } catch (err: any) {
      console.error("Lỗi gửi tài liệu:", err.message);
      alert("⚠️ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#18181b] w-full max-w-md rounded-3xl border border-gray-800 shadow-2xl p-8 relative overflow-hidden">
        
        {/* TOAST UI THÀNH CÔNG */}
        {showSuccess && (
          <div className="absolute inset-0 bg-green-500 z-10 flex flex-col items-center justify-center text-black animate-in fade-in zoom-in duration-300 text-center">
            <div className="bg-black text-green-500 p-4 rounded-full mb-4 shadow-xl animate-bounce">
              <CheckCircle2 size={48} />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tighter">Gửi thành công!</h3>
            <p className="font-bold text-sm opacity-90 px-6 mt-2">
              {user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL 
                ? "Tài liệu của Admin đã được cập nhật ngay." 
                : "Tài liệu đang được đưa vào hàng chờ kiểm duyệt."}
            </p>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col">
            <h3 className="font-black text-white text-xl flex items-center gap-2 uppercase tracking-tighter">
              <FileText className="text-green-500" size={24}/> Chia sẻ Tài liệu
            </h3>
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1">Hệ thống kho lưu trữ học thuật</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition">
            <X className="text-gray-400 hover:text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 ml-1 tracking-widest">Tên tài liệu</label>
            <input 
              required
              type="text" 
              placeholder="VD: Đề thi Kỹ thuật lập trình 2024" 
              value={form.title} 
              onChange={e => setForm({...form, title: e.target.value})} 
              className="w-full bg-black border border-gray-800 rounded-2xl p-4 text-white focus:border-green-500 outline-none transition" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 ml-1 tracking-widest">Trường học</label>
                <input 
                  type="text" 
                  placeholder="HUST, UEH..." 
                  value={form.school} 
                  onChange={e => setForm({...form, school: e.target.value})} 
                  className="w-full bg-black border border-gray-800 rounded-2xl p-4 text-white focus:border-green-500 outline-none transition" 
                />
             </div>
             <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 ml-1 tracking-widest">Môn học</label>
                <input 
                  type="text" 
                  placeholder="Giải tích 1..." 
                  value={form.subject} 
                  onChange={e => setForm({...form, subject: e.target.value})} 
                  className="w-full bg-black border border-gray-800 rounded-2xl p-4 text-white focus:border-green-500 outline-none transition" 
                />
             </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 ml-1 tracking-widest">Đường dẫn tài liệu (Google Drive)</label>
            <div className="relative">
                <LinkIcon size={18} className="absolute left-4 top-4 text-gray-600" />
                <input 
                  required
                  type="url" 
                  placeholder="Dán link Drive công khai..." 
                  value={form.file_url} 
                  onChange={e => setForm({...form, file_url: e.target.value})} 
                  className="w-full bg-black border border-gray-800 rounded-2xl p-4 pl-12 text-white focus:border-green-500 outline-none transition" 
                />
            </div>
            <p className="text-[9px] text-gray-600 mt-3 italic px-1 leading-relaxed">
              * Vui lòng đảm bảo link Drive đã được bật quyền "Người xem công khai".
            </p>
          </div>

          <button 
            disabled={loading} 
            type="submit"
            className="w-full bg-green-500 text-black font-black py-5 rounded-2xl hover:bg-green-400 transition flex items-center justify-center gap-2 uppercase text-xs shadow-xl active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Xác nhận gửi tài liệu"}
          </button>
        </form>
      </div>
    </div>
  );
}