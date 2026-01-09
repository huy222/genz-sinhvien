"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Download, Lock, Loader2 } from 'lucide-react';
import AuthModal from './AuthModal';

export default function DownloadButton({ fileUrl }: { fileUrl: string }) {
  const [user, setUser] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();
  }, []);

  if (loading) return <div className="p-2"><Loader2 className="animate-spin" size={16} /></div>;

  // TRƯỜNG HỢP 1: ĐÃ ĐĂNG NHẬP -> Hiện nút tải xịn
  if (user) {
    return (
      <a 
        href={fileUrl} 
        target="_blank" // Mở tab mới
        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-sm transition shadow-lg shadow-green-500/20"
      >
        <Download size={16} /> Tải về ngay
      </a>
    );
  }

  // TRƯỜNG HỢP 2: CHƯA ĐĂNG NHẬP -> Hiện nút khóa
  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-400 rounded-lg font-bold text-sm hover:bg-gray-700 hover:text-white transition cursor-pointer"
      >
        <Lock size={14} /> Đăng nhập để tải
      </button>

      {/* Modal đăng nhập */}
      <AuthModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}