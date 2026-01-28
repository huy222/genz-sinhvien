"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, Mail, Lock, User, Loader2 } from 'lucide-react';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const lowerEmail = email.toLowerCase().trim();
    const cleanUsername = username.trim();
    const forbiddenKeywords = ['admin', 'quanly', 'admin1', 'admin2', 'root', 'support'];

const isForbidden = forbiddenKeywords.some(keyword => 
    username.toLowerCase().includes(keyword)
  );
  if (isForbidden) {
    alert("Tên đăng nhập không hợp lệ. Vui lòng chọn tên khác!");
    return;
  }
    setLoading(true);

    try {
      // 1. LẤY THÔNG TIN ĐỊNH DANH (IP & UserAgent)
      let ip = "Unknown";
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipRes.json();
        ip = ipData.ip;
      } catch (e) {
        console.error("Không lấy được IP");
      }
      const userAgent = typeof window !== 'undefined' ? navigator.userAgent : "Unknown";

      // 2. ĐĂNG KÝ TÀI KHOẢN AUTH
      // Lưu ý: Truyền luôn metadata vào đây để phòng hờ Trigger
      const { data, error: authError } = await supabase.auth.signUp({ 
        email: lowerEmail, 
        password,
        options: {
          data: {
            full_name: cleanUsername,
            avatar_url: `https://ui-avatars.com/api/?name=${cleanUsername}&background=random`
          }
        }
      });

      if (authError) throw authError;

      // 3. TẠO PROFILE (Upsert để an toàn nhất)
      if (data?.user?.id) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert([ 
            { 
              id: data.user.id, 
              username: cleanUsername, 
              email: lowerEmail,
              last_ip: ip,
              user_agent: userAgent,
              avatar_url: `https://ui-avatars.com/api/?name=${cleanUsername}&background=random`,
              is_verified: true
            }
          ], { onConflict: 'id' }); // Nếu ID đã tồn tại (do Trigger tạo) thì Update, chưa có thì Insert

        if (profileError) {
            // Nếu lỗi RLS (do chưa setup quyền), ta bỏ qua để user vẫn đăng ký được
            console.error("Lỗi tạo profile (có thể bỏ qua nếu Trigger đã chạy):", profileError);
        }
        
        alert("✅ Đăng ký thành công!");
        router.push('/login');
      }
      
    } catch (err: any) {
      console.error("Signup Error:", err);
      if (err.message.includes("already registered")) {
        alert("❌ Email này đã được đăng ký rồi!");
      } else if (err.message.includes("profiles_username_key")) {
        alert("⚠️ Tên hiển thị này đã có người dùng, hãy thêm số vào sau tên nhé!");
      } else {
        alert("🚀 Lỗi: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] p-4">
      <div className="w-full max-w-md space-y-8 bg-[#18181b] p-8 rounded-3xl border border-gray-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-50"></div>

        <div className="text-center">
          <div className="mx-auto w-14 h-14 bg-pink-500/10 rounded-2xl flex items-center justify-center mb-4 border border-pink-500/20">
            <UserPlus className="text-pink-500" size={32} />
          </div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Gia nhập GenZ!</h2>
          <p className="text-gray-500 mt-2 text-[10px] font-bold uppercase tracking-widest italic tracking-tighter">Mở cửa cho mọi sinh viên</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-500 uppercase ml-1 tracking-tighter">Tên hiển thị</label>
            <div className="relative group">
              <User className="absolute left-3 top-3.5 text-gray-600 group-focus-within:text-pink-500 transition-colors" size={18} />
              <input type="text" required placeholder="Tên của bạn" value={username} onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black border border-gray-800 rounded-xl p-4 pl-10 text-white outline-none focus:border-pink-500 transition shadow-inner placeholder:text-gray-700" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-500 uppercase ml-1 tracking-tighter">Email cá nhân hoặc SV</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-3.5 text-gray-600 group-focus-within:text-pink-500 transition-colors" size={18} />
              <input type="email" required placeholder="example@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black border border-gray-800 rounded-xl p-4 pl-10 text-white outline-none focus:border-pink-500 transition shadow-inner placeholder:text-gray-700" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-500 uppercase ml-1 tracking-tighter">Mật khẩu bảo mật</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-3.5 text-gray-600 group-focus-within:text-pink-500 transition-colors" size={18} />
              <input type="password" required placeholder="Ít nhất 6 ký tự" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-gray-800 rounded-xl p-4 pl-10 text-white outline-none focus:border-pink-500 transition shadow-inner placeholder:text-gray-700" />
            </div>
          </div>

          <button disabled={loading} className="w-full bg-white text-black font-black py-4 rounded-xl hover:bg-pink-500 hover:text-white transition flex items-center justify-center gap-2 uppercase text-xs shadow-lg active:scale-95 disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" /> : "Tạo tài khoản GenZ"}
          </button>
        </form>

        <p className="text-center text-gray-500 text-[11px] font-bold uppercase tracking-[0.2em] pt-4">
          Đã có tài khoản? <Link href="/login" className="text-pink-500 hover:underline hover:text-pink-400 transition">Đăng nhập ngay</Link>
        </p>
      </div>
    </div>
  );
}