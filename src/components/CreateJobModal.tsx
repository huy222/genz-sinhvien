"use client";
import { useState } from 'react';
import { X, Loader2, Briefcase, MapPin, DollarSign, Phone } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateJobModal({ isOpen, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', employer: '', salary: '', location: '', contact: '', description: '', type: 'part_time'
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.contact) return alert("Vui lòng nhập đủ thông tin!");

    setLoading(true);
    const { error } = await supabase.from('jobs').insert([form]);
    setLoading(false);

    if (error) {
      alert("Lỗi: " + error.message);
    } else {
      alert("✅ Đã đăng tin tuyển dụng! Chờ Admin duyệt nhé.");
      onSuccess();
      onClose();
      setForm({ title: '', employer: '', salary: '', location: '', contact: '', description: '', type: 'part_time' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#18181b] w-full max-w-lg rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900">
          <h3 className="font-bold text-white flex items-center gap-2"><Briefcase className="text-blue-500"/> Đăng Tin Tuyển Dụng</h3>
          <button onClick={onClose}><X className="text-gray-400 hover:text-white" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-xs font-bold text-gray-400 mb-1">Vị trí tuyển</label>
               <input type="text" placeholder="VD: Phục vụ bàn" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none" />
             </div>
             <div>
               <label className="block text-xs font-bold text-gray-400 mb-1">Tên quán/Shop</label>
               <input type="text" placeholder="VD: Highland Coffee" value={form.employer} onChange={e => setForm({...form, employer: e.target.value})} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none" />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Mức lương</label>
                <div className="relative">
                   <DollarSign size={14} className="absolute left-3 top-3.5 text-gray-500" />
                   <input type="text" placeholder="VD: 25k/h" value={form.salary} onChange={e => setForm({...form, salary: e.target.value})} className="w-full bg-black border border-gray-700 rounded-lg p-3 pl-9 text-white focus:border-blue-500 outline-none" />
                </div>
             </div>
             <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Hình thức</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none">
                   <option value="part_time">Part-time</option>
                   <option value="full_time">Full-time</option>
                   <option value="freelance">Freelance</option>
                </select>
             </div>
          </div>

          <div>
             <label className="block text-xs font-bold text-gray-400 mb-1">Địa điểm làm việc</label>
             <div className="relative">
                <MapPin size={14} className="absolute left-3 top-3.5 text-gray-500" />
                <input type="text" placeholder="VD: Quận 1, TP.HCM" value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="w-full bg-black border border-gray-700 rounded-lg p-3 pl-9 text-white focus:border-blue-500 outline-none" />
             </div>
          </div>

          <div>
             <label className="block text-xs font-bold text-gray-400 mb-1">Liên hệ (Zalo/SĐT)</label>
             <div className="relative">
                <Phone size={14} className="absolute left-3 top-3.5 text-gray-500" />
                <input type="text" placeholder="0987..." value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} className="w-full bg-black border border-gray-700 rounded-lg p-3 pl-9 text-white focus:border-blue-500 outline-none" />
             </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">Mô tả công việc</label>
            <textarea rows={3} placeholder="Yêu cầu: Nhanh nhẹn, trung thực..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none" />
          </div>

          <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : "Đăng tin tuyển dụng"}
          </button>
        </form>
      </div>
    </div>
  );
}