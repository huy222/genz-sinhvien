"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { User, LogIn, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    getUser();

    // Lắng nghe thay đổi Login/Logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      getUser();
    });

    return () => subscription.unsubscribe();
  }, []);

  const getUser = async () => {
    // 1. Lấy User Auth
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (user) {
      // 2. QUAN TRỌNG: Lấy Username từ bảng profiles
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      
      if (data && data.username) {
        setUsername(data.username);
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUsername(null);
    router.refresh();
    window.location.reload();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center bg-[#09090b]/80 backdrop-blur-md border-b border-white/5 transition-all">
      {/* Logo */}
      <Link href="/" className="text-xl font-black tracking-tighter hover:opacity-80 transition group">
        GENZ<span className="text-purple-500 group-hover:text-pink-500 transition">SINHVIEN</span>
      </Link>

      {/* Cụm nút bên phải */}
      <div className="flex items-center gap-4">
        {user ? (
          <>
             {/* Nút vào Profile */}
             <Link 
               href="/profile" 
               className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 pr-4 pl-1 py-1 rounded-full transition text-sm font-bold text-gray-200 group"
             >
               <div className="bg-gradient-to-tr from-purple-500 to-pink-500 p-1.5 rounded-full shadow-lg shadow-purple-500/20 group-hover:scale-110 transition">
                  <User size={14} className="text-white" />
               </div>
               <span className="group-hover:text-white transition max-w-[100px] truncate">
                 {/* Ưu tiên hiện Username -> Email cắt gọn */}
                 {username || user.email?.split('@')[0]}
               </span>
             </Link>

             {/* Nút Đăng xuất */}
             <button 
               onClick={handleLogout} 
               className="text-gray-500 hover:text-red-500 transition p-2 hover:bg-white/5 rounded-full"
               title="Đăng xuất"
             >
               <LogOut size={20} />
             </button>
          </>
        ) : (
          <Link 
            href="/login" 
            className="bg-white text-black hover:bg-gray-200 px-5 py-2 rounded-full font-bold text-sm transition flex items-center gap-2"
          >
            <LogIn size={16} /> Đăng nhập
          </Link>
        )}
      </div>
    </header>
  );
}