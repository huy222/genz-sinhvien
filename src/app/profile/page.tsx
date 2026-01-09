"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Save, Lock, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    // 1. Lấy User Auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUser(user);

    // 2. Lấy thông tin Profile
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) {
      setProfile(data);
      setUsername(data.username || ''); // Nếu có tên rồi thì điền vào
    }
  };

  const handleUpdate = async () => {
    // Logic chặn: Nếu đã đổi rồi (và không phải admin) thì chặn luôn
    if (profile.username_changed && user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      return alert("Bạn chỉ được đổi tên 1 lần duy nhất!");
    }

    if (!username.trim()) return setMessage({ type: 'error', text: "Tên không được để trống!" });
    if (username.length < 3) return setMessage({ type: 'error', text: "Tên phải dài hơn 3 ký tự!" });
    // Chỉ cho phép chữ cái, số và gạch dưới (tránh ký tự đặc biệt)
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return setMessage({ type: 'error', text: "Tên chỉ chứa chữ, số và gạch dưới (_)" });

    setLoading(true);
    setMessage(null);

    // Gửi lệnh Update
    const { error } = await supabase
      .from('profiles')
      .update({
        username: username,
        username_changed: true // 👈 CHỐT: Đánh dấu là đã đổi
      })
      .eq('id', user.id);

    if (error) {
      // Mã lỗi 23505 là trùng lặp (Unique Violation)
      if (error.code === '23505') {
        setMessage({ type: 'error', text: "Tên này đã có người dùng. Chọn tên khác nhé!" });
      } else {
        setMessage({ type: 'error', text: "Lỗi: " + error.message });
      }
    } else {
      setMessage({ type: 'success', text: "Đổi tên thành công! F5 để thấy thay đổi." });
      // Cập nhật lại state cục bộ để khóa nút ngay lập tức
      setProfile({ ...profile, username, username_changed: true });
    }
    setLoading(false);
  };

  if (!user) return <div className="text-white p-10 text-center">Đang tải...</div>;

  // Kiểm tra xem có được sửa không?
  // Được sửa nếu: (Chưa đổi lần nào) HOẶC (Là Admin)
  const canEdit = !profile?.username_changed || user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-6 flex flex-col items-center pt-20">
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-gray-400 hover:text-white transition">
        <ArrowLeft size={20} /> Trang chủ
      </Link>

      <div className="w-full max-w-md bg-[#18181b] border border-gray-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full mx-auto flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20">
            <User size={40} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold">Hồ Sơ Cá Nhân</h1>
          <p className="text-gray-500 text-sm mt-1">{user.email}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">
              Username (Hiển thị công khai)
            </label>
            <div className="relative">
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={!canEdit} // Khóa nếu không được sửa
                placeholder="Đặt tên thật ngầu..."
                className={`w-full bg-black border rounded-xl py-3 px-4 text-white focus:outline-none transition ${canEdit ? 'border-gray-700 focus:border-purple-500' : 'border-gray-800 text-gray-500 cursor-not-allowed opacity-50'}`}
              />
              {!canEdit && (
                <Lock size={16} className="absolute right-4 top-3.5 text-gray-500" />
              )}
            </div>
            
            {/* Ghi chú */}
            {canEdit ? (
              <p className="text-xs text-yellow-500 mt-2 flex items-center gap-1">
                <AlertCircle size={12} /> Lưu ý: Bạn chỉ được đổi tên 1 lần duy nhất!
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <CheckCircle size={12} /> Bạn đã đổi tên rồi. Liên hệ Admin nếu cần hỗ trợ.
              </p>
            )}
          </div>

          {/* Thông báo lỗi/thành công */}
          {message && (
            <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
              {message.type === 'success' ? <CheckCircle size={16}/> : <AlertCircle size={16}/>}
              {message.text}
            </div>
          )}

          {/* Nút Lưu */}
          {canEdit && (
            <button 
              onClick={handleUpdate}
              disabled={loading}
              className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Đang lưu..." : <><Save size={18} /> Lưu Thay Đổi</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}