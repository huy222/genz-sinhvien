"use client";
import { useState } from 'react';
import { X, Save, Loader2, ShieldCheck, ShieldAlert } from 'lucide-react';

interface Props {
  user: any;
  onClose: () => void;
  onSave: (id: string, data: any) => void;
}

export default function EditUserModal({ user, onClose, onSave }: Props) {
  const [formData, setFormData] = useState({
    username: user.username || '',
    is_verified: user.is_verified || false,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Giả lập delay mạng
    await new Promise(r => setTimeout(r, 500));
    onSave(user.id, formData);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#18181b] w-full max-w-md rounded-3xl border border-gray-800 p-6 shadow-2xl relative animate-in zoom-in-95">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20}/></button>
        
        <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-6">Chỉnh sửa thành viên</h3>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Email (Không thể sửa)</label>
            <input disabled value={user.email} className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-gray-400 text-sm cursor-not-allowed"/>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Tên hiển thị</label>
            <input 
              value={formData.username} 
              onChange={e => setFormData({...formData, username: e.target.value})}
              className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white focus:border-orange-500 outline-none text-sm"
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 p-4 bg-white/5 rounded-xl cursor-pointer border border-transparent hover:border-gray-700 transition">
              <input 
                type="checkbox" 
                checked={formData.is_verified} 
                onChange={e => setFormData({...formData, is_verified: e.target.checked})}
                className="w-5 h-5 accent-orange-500"
              />
              <div>
                <span className="block text-sm font-bold text-white flex items-center gap-2">
                  {formData.is_verified ? <ShieldCheck size={16} className="text-green-500"/> : <ShieldAlert size={16} className="text-gray-500"/>}
                  Xác thực sinh viên
                </span>
                <span className="text-[10px] text-gray-500">Cấp tích xanh cho tài khoản này</span>
              </div>
            </label>
          </div>
        </div>

        <button onClick={handleSave} disabled={saving} className="w-full mt-6 bg-white text-black font-black py-3 rounded-xl hover:bg-gray-200 transition uppercase tracking-widest flex justify-center items-center gap-2">
          {saving ? <Loader2 className="animate-spin"/> : <><Save size={18}/> Lưu thay đổi</>}
        </button>
      </div>
    </div>
  );
}