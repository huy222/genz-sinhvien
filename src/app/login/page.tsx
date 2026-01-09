"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Đăng nhập vào hệ thống Auth
      const { data, error: authError } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });

      if (authError) throw authError; // Nếu lỗi Auth thì nhảy xuống catch

      if (data?.user) {
        // 2. LẤY THÔNG TIN ĐỊNH DANH (IP & THIẾT BỊ)
        let ip = "Unknown";
        try {
          const ipRes = await fetch('https://api.ipify.org?format=json');
          const ipData = await ipRes.json();
          ip = ipData.ip;
        } catch (ipErr) {
          console.error("Không lấy được IP:", ipErr);
        }
        
        const userAgent = navigator.userAgent;

        // 3. CẬP NHẬT VÀO BẢNG PROFILES
        await supabase
          .from('profiles')
          .update({ 
            last_ip: ip, 
            user_agent: userAgent 
          })
          .eq('id', data.user.id);

        router.push('/');
        router.refresh();
      }
    } catch (err: any) {
      // ✅ ĐÃ SỬA LỖI ĐỎ: Dùng biến 'err' đồng nhất
      let msg = "❌ Lỗi đăng nhập!";
      
      if (err.message.includes("Invalid login credentials")) {
        msg = "📍 Tài khoản hoặc mật khẩu không chính xác!";
      } else if (err.message.includes("Email not confirmed")) {
        msg = "📧 Bạn chưa xác nhận email sinh viên!";
      }
      
      alert(msg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] p-4">
      <div className="w-full max-w-md space-y-8 bg-[#18181b] p-8 rounded-3xl border border-gray-800 shadow-2xl">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
            <LogIn className="text-blue-500" size={28} />
          </div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Chào bạn trở lại!</h2>
          <p className="text-gray-400 mt-2 text-sm">Hệ thống bảo mật bằng IP & Device</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-500 uppercase ml-1 tracking-widest">Email Sinh Viên</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-gray-600" size={18} />
              <input type="email" required placeholder="name@school.edu.vn" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black border border-gray-800 rounded-xl p-3 pl-10 text-white outline-none focus:border-blue-500 transition" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-500 uppercase ml-1 tracking-widest">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-600" size={18} />
              <input type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-gray-800 rounded-xl p-3 pl-10 text-white outline-none focus:border-blue-500 transition" />
            </div>
          </div>

          <button disabled={loading} className="w-full bg-white text-black font-black py-4 rounded-xl hover:bg-blue-400 transition flex items-center justify-center gap-2 uppercase text-sm shadow-lg shadow-white/5 active:scale-95">
            {loading ? <Loader2 className="animate-spin" /> : "Xác nhận vào web"}
          </button>
        </form>

        <p className="text-center text-gray-500 text-xs font-bold uppercase tracking-wider">
          Chưa có thẻ? <Link href="/signup" className="text-blue-500 hover:underline">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
}