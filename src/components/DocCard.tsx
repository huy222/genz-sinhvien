"use client";
import { FileText, Download, Eye, GraduationCap, Share2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface DocProps {
  doc: {
    id: string;
    title: string;
    school: string;
    subject: string;
    file_url: string;
    view_count: number;
    download_count: number;
    created_at: string;
  };
}

export default function DocCard({ doc }: DocProps) {
  
  const handleDownload = async () => {
    try {
      // 1. Tăng lượt tải trong Database (Sử dụng RPC đã tạo ở bước trước)
      await supabase.rpc('increment_download', { doc_id: doc.id });
      
      // 2. Mở link tài liệu
      window.open(doc.file_url, '_blank');
    } catch (error) {
      console.error("Lỗi khi tải:", error);
    }
  };

  return (
    <div className="bg-[#18181b] border border-gray-800 rounded-3xl overflow-hidden hover:border-green-500/40 transition-all duration-300 group relative flex flex-col h-full shadow-xl">
      
      {/* HEADER: Icon và Chỉ số */}
      <div className="p-6 pb-0 flex justify-between items-start">
        <div className="p-4 bg-green-500/10 rounded-2xl text-green-500 group-hover:scale-110 transition-transform duration-300">
          <FileText size={28} />
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex gap-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">
            <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md">
              <Eye size={12} className="text-blue-400"/> {doc.view_count || 0}
            </span>
            <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md">
              <Download size={12} className="text-green-500"/> {doc.download_count || 0}
            </span>
          </div>
          <span className="text-[9px] text-gray-600 font-bold uppercase mt-1">
            {new Date(doc.created_at).toLocaleDateString('vi-VN')}
          </span>
        </div>
      </div>

      {/* CONTENT: Tiêu đề và Thông tin */}
      <div className="p-6 flex-grow">
        <h3 className="text-white font-black text-xl leading-tight mb-3 line-clamp-2 uppercase tracking-tighter group-hover:text-green-400 transition-colors">
          {doc.title}
        </h3>

        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-1.5 bg-white/5 text-gray-400 text-[10px] px-3 py-1.5 rounded-full font-black uppercase border border-white/5">
            <GraduationCap size={12} className="text-orange-500"/> {doc.school || "Học Viện Genz"}
          </div>
          <div className="flex items-center gap-1.5 bg-green-500/5 text-green-500 text-[10px] px-3 py-1.5 rounded-full font-black uppercase border border-green-500/10">
            {doc.subject || "Chung"}
          </div>
        </div>
      </div>

      {/* FOOTER: Nút tải bài */}
      <div className="p-6 pt-0 mt-auto">
        <button 
          onClick={handleDownload}
          className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-green-500 hover:text-black transition-all duration-300 flex items-center justify-center gap-3 uppercase text-xs shadow-lg shadow-white/5 active:scale-95"
        >
          <Download size={18} />
          Tải tài liệu ngay
        </button>
      </div>

      {/* Trang trí góc card */}
      <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-green-500/10 blur-[40px] rounded-full group-hover:bg-green-500/20 transition-all"></div>
    </div>
  );
}