"use client"; // Bắt buộc vì có bấm nút, nhập liệu
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Mail, Lock, Loader2 } from 'lucide-react';

export default function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [isSignUp, setIsSignUp] = useState(false); // Chế độ Đăng nhập hay Đăng ký
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!isOpen) return null; // Nếu không mở thì ẩn đi

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isSignUp) {
        // ĐĂNG KÝ
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('✅ Đăng ký thành công! Hãy kiểm tra Email để xác nhận.');
      } else {
        // ĐĂNG NHẬP
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onClose(); // Đóng bảng
        window.location.reload(); // Tải lại trang để cập nhật giao diện
      }
    } catch (error: any) {
      setMessage(`❌ Lỗi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#18181b] border border-[#27272a] p-8 rounded-3xl w-full max-w-md relative shadow-2xl animate-in fade-in zoom-in duration-300">
        
        {/* Nút tắt */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={24} />
        </button>

        <h2 className="text-3xl font-black text-white mb-2 text-center">
          {isSignUp ? 'Đăng Ký 🚀' : 'Đăng Nhập 👋'}
        </h2>
        <p className="text-gray-400 text-center mb-6 text-sm">
          {isSignUp ? 'Tạo tài khoản để tham gia cộng đồng Gen Z.' : 'Chào mừng bạn quay trở lại!'}
        </p>

        {/* Form nhập liệu */}
        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-gray-500" size={20} />
              <input 
                type="email" 
                required
                placeholder="sinhvien@example.com"
                className="w-full bg-black/50 border border-gray-800 rounded-xl py-3 pl-12 text-white focus:outline-none focus:border-purple-500 transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
             <label className="text-xs font-bold text-gray-500 uppercase ml-1">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-gray-500" size={20} />
              <input 
                type="password" 
                required
                placeholder="••••••••"
                className="w-full bg-black/50 border border-gray-800 rounded-xl py-3 pl-12 text-white focus:outline-none focus:border-purple-500 transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Thông báo lỗi/thành công */}
          {message && (
            <div className={`p-3 rounded-lg text-sm font-medium ${message.includes('✅') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
              {message}
            </div>
          )}

          <button 
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 py-3 rounded-xl font-bold text-white shadow-lg shadow-purple-500/20 transition flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="animate-spin" size={20} />}
            {isSignUp ? 'Tạo tài khoản' : 'Vào ngay'}
          </button>
        </form>

        {/* Chuyển đổi Đăng ký/Đăng nhập */}
        <div className="mt-6 text-center text-sm text-gray-400">
          {isSignUp ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'} 
          <button 
            onClick={() => { setIsSignUp(!isSignUp); setMessage(''); }} 
            className="ml-2 text-purple-400 font-bold hover:underline"
          >
            {isSignUp ? 'Đăng nhập' : 'Đăng ký ngay'}
          </button>
        </div>
      </div>
    </div>
  );
}