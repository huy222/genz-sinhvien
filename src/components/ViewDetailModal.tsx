"use client";
import { Eye, X, Info, School, BookOpen, Link as LinkIcon, User } from 'lucide-react';

export default function ViewDetailModal({ isOpen, onClose, data, type }: any) {
  // Kiểm tra an toàn để tránh crash trang
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#121214] border border-gray-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* HEADER */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 text-orange-500 rounded-lg">
              <Info size={20} />
            </div>
            <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">
              Chi tiết <span className="text-orange-500">{type}</span>
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
          {/* 1. TÊN TÀI LIỆU */}
          <div>
            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block mb-2">
              {type === 'users' ? 'Tên thành viên' : 'Tên tài liệu / Tiêu đề'}
            </label>
            <p className="text-xl font-bold text-white leading-tight">
              {data.title || data.username || data.full_name || "Không có tiêu đề"}
            </p>
          </div>

          {/* 2. TRƯỜNG HỌC & MÔN HỌC (Chỉ hiện nếu không phải tab users) */}
          {type !== 'users' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-gray-800 flex items-center gap-3">
                <div className="text-blue-400"><School size={18} /></div>
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-500 block">Trường học</label>
                  <p className="text-sm font-bold text-gray-200">{data.school || "N/A"}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-gray-800 flex items-center gap-3">
                <div className="text-purple-400"><BookOpen size={18} /></div>
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-500 block">Môn học</label>
                  <p className="text-sm font-bold text-gray-200">{data.subject || "N/A"}</p>
                </div>
              </div>
            </div>
          )}

          {/* 3. NỘI DUNG MÔ TẢ */}
          <div>
            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block mb-2">
              {type === 'users' ? 'Giới thiệu / Bio' : 'Mô tả chi tiết'}
            </label>
            <div className="text-gray-400 leading-relaxed bg-black/40 p-5 rounded-2xl border border-gray-800 italic text-sm shadow-inner">
              {data.description || data.content || data.bio || "Không có phần nội dung mô tả thêm."}
            </div>
          </div>

          {/* 4. THÔNG TIN NGƯỜI ĐĂNG & TRẠNG THÁI */}
          <div className="flex flex-wrap gap-6 pt-4 border-t border-gray-800/50">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                  <User size={16} />
                </div>
                <div>
                   <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block mb-0.5">Liên hệ</label>
                   {/* Fallback an toàn để tránh lỗi 406 profiles */}
                   <p className="text-xs text-blue-400 font-medium">
                     {data.email || data.profiles?.email || "Chưa cập nhật"}
                   </p>
                </div>
             </div>
             
             <div>
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block mb-1">Trạng thái duyệt</label>
                <p className={`text-[10px] font-bold uppercase flex items-center gap-1 ${data.is_approved || data.is_verified ? 'text-green-500' : 'text-orange-500'}`}>
                  {data.is_approved || data.is_verified ? "● Đã xác thực/duyệt" : "○ Đang chờ kiểm duyệt"}
                </p>
             </div>
          </div>

          {/* 5. NÚT XEM TÀI LIỆU (Chỉ hiện cho docs) */}
          {type === 'docs' && (data.file_url || data.link_url) && (
            <div className="pt-4">
              <a 
                href={data.file_url || data.link_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-400 text-black px-6 py-4 rounded-2xl font-black uppercase text-xs transition-all shadow-[0_10px_20px_rgba(249,115,22,0.2)] active:scale-[0.98]"
              >
                <LinkIcon size={18} /> Mở Link tài liệu (Drive/PDF)
              </a>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-6 bg-black/40 border-t border-gray-800 flex justify-end">
          <button 
            onClick={onClose}
            className="px-10 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold uppercase text-[11px] tracking-widest transition shadow-md active:scale-95"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}