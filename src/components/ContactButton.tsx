"use client"; // Chạy trên trình duyệt để đọc được trạng thái đăng nhập
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Phone, Eye } from 'lucide-react';
import AuthModal from './AuthModal'; // Tận dụng lại cái Modal đăng nhập cũ

export default function ContactButton({ contact }: { contact: string }) {
  const [user, setUser] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Kiểm tra đăng nhập ngay lập tức
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  // Nếu ĐÃ ĐĂNG NHẬP -> Hiện SĐT màu xanh
  if (user) {
    return (
      <div className="flex items-center gap-2 text-sm font-bold text-green-400 bg-green-400/10 p-2 rounded-lg border border-green-400/20 select-all cursor-copy">
        <Phone size={14} /> 
        {contact}
      </div>
    );
  }

  // Nếu CHƯA ĐĂNG NHẬP -> Hiện nút mờ, bấm vào thì bắt đăng nhập
  return (
    <>
      <button 
        onClick={() => setShowModal(true)} // Bấm vào thì mở bảng đăng nhập
        className="w-full group relative cursor-pointer text-left"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500 bg-gray-800 p-2 rounded-lg blur-[3px] select-none">
          <Phone size={14} /> 
          0909xxxxxx
        </div>
        {/* Tooltip & Icon hiện ra khi rê chuột */}
        <div className="absolute inset-0 flex items-center justify-center gap-1 text-[10px] font-bold text-white uppercase opacity-0 group-hover:opacity-100 transition z-10 bg-black/50 rounded-lg">
          <Eye size={12} /> Bấm để xem
        </div>
      </button>

      {/* Modal đăng nhập (ẩn sẵn, bấm mới hiện) */}
      <AuthModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}