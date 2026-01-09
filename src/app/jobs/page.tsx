"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Briefcase, Search, Plus, MapPin, DollarSign, Clock, Zap, X, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation'; // 👈 Import router
import CreateJobModal from '@/components/CreateJobModal';

export default function JobsPage() {
  const router = useRouter(); // 👈 Khởi tạo router
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState<any>(null); // 👈 Thêm state user
  
  const [paymentModal, setPaymentModal] = useState<any>(null);
  const [vipEnabled, setVipEnabled] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
    fetchJobs();
    checkVipSetting();
  }, [searchTerm]);

  const checkVipSetting = async () => {
     const { data } = await supabase.from('app_settings').select('enable_market_vip').eq('id', 1).single();
     if (data) setVipEnabled(data.enable_market_vip);
  };

  const fetchJobs = async () => {
    setLoading(true);
    let query = supabase.from('jobs').select('*').eq('is_approved', true).order('is_pinned', { ascending: false }).order('created_at', { ascending: false });
    if (searchTerm) query = query.ilike('title', `%${searchTerm}%`);
    const { data } = await query;
    if (data) setJobs(data);
    setLoading(false);
  };

  // ✅ HÀM KIỂM TRA ĐĂNG NHẬP TRƯỚC KHI MỞ FORM
  const handleOpenCreateModal = () => {
    if (!user) {
      // Đẩy thẳng sang login, không hiện alert thông báo
      router.push("/login"); 
      return;
    }
    setIsModalOpen(true);
  };

  const PaymentModal = () => {
    if (!paymentModal) return null;
    const BANK_ID = "MB"; 
    const ACCOUNT_NO = "0335626607"; 
    const AMOUNT = "20000"; 
    const INFO = `GHIM JOB ${paymentModal.id}`; 
    const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact.png?amount=${AMOUNT}&addInfo=${INFO}`;

    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in">
        <div className="bg-white text-black w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl relative">
           <button onClick={() => setPaymentModal(null)} className="absolute top-2 right-2 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"><X size={20}/></button>
           <div className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3"><Zap size={24} fill="currentColor"/></div>
              <h3 className="text-xl font-black text-gray-900 mb-1">GHIM TIN TUYỂN DỤNG 🔥</h3>
              <p className="text-sm text-gray-500 mb-4">Tuyển nhân viên nhanh gấp 3 lần!</p>
              <div className="bg-gray-100 p-4 rounded-xl mb-4 border-2 border-dashed border-gray-300">
                 <img src={qrUrl} alt="QR" className="w-full h-auto rounded-lg mix-blend-multiply" />
              </div>
              <div className="text-left bg-blue-50 p-3 rounded-lg text-sm space-y-2 mb-4">
                 <p className="flex justify-between"><span>💰 Phí dịch vụ:</span> <span className="font-bold text-blue-700">20.000đ</span></p>
                 <p className="flex justify-between"><span>📝 Nội dung:</span> <span className="font-bold text-red-500">GHIM JOB {paymentModal.id}</span></p>
              </div>
              <a href="https://zalo.me/0335626607" target="_blank" className="block w-full bg-blue-600 text-white font-bold py-3 rounded-xl mt-4 hover:bg-blue-700 transition">Gửi bill cho Admin</a>
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-4 md:p-8 pt-24">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
          <div>
             <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600 mb-2">
               Việc Làm Sinh Viên 💼
             </h1>
             <p className="text-gray-400">Việc nhẹ lương ổn, không đa cấp!</p>
          </div>
          {/* ✅ SỬA NÚT BẤM GỌI HÀM KIỂM TRA */}
          <button 
            onClick={handleOpenCreateModal} 
            className="bg-white text-black hover:bg-gray-200 px-6 py-3 rounded-full font-bold transition flex items-center gap-2 shadow-lg"
          >
            <Plus size={18} /> Đăng Tuyển
          </button>
        </div>

        <div className="relative mb-8">
           <Search className="absolute left-4 top-3.5 text-gray-500" size={20} />
           <input type="text" placeholder="Tìm việc làm (Pha chế, Gia sư...)" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-[#18181b] border border-gray-800 rounded-2xl py-3 pl-12 text-white focus:outline-none focus:border-blue-500 transition shadow-xl" />
        </div>

        <div className="space-y-4">
           {loading ? <p className="text-gray-500 text-center">Đang tải...</p> : jobs.map((job) => (
             <div key={job.id} className={`bg-[#18181b] p-6 rounded-2xl border transition group relative ${job.is_pinned && vipEnabled ? 'border-yellow-500/50 shadow-lg shadow-yellow-500/10' : 'border-[#27272a] hover:border-blue-500/50'}`}>
                
                {vipEnabled && job.is_pinned && (
                   <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[10px] font-black px-3 py-1 rounded-bl-xl rounded-tr-xl flex items-center gap-1 animate-pulse">
                     <Zap size={12} fill="currentColor"/> TIN HOT
                   </div>
                )}

                {vipEnabled && !job.is_pinned && (
                   <button onClick={(e) => { e.stopPropagation(); setPaymentModal(job); }} className="absolute top-4 right-4 bg-black/50 hover:bg-yellow-500 hover:text-black text-white p-2 rounded-lg transition opacity-0 group-hover:opacity-100" title="Ghim tin này (20k)">
                     <Zap size={18} />
                   </button>
                )}

                <div className="flex flex-col md:flex-row justify-between gap-4">
                   <div>
                      <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition">{job.title}</h3>
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                         <span className="font-bold text-blue-300">{job.employer}</span>
                         <span>•</span>
                         <span className="flex items-center gap-1"><MapPin size={14}/> {job.location}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                         <span className="px-3 py-1 rounded-lg bg-green-500/10 text-green-500 text-xs font-bold flex items-center gap-1"><DollarSign size={14}/> {job.salary}</span>
                         <span className="px-3 py-1 rounded-lg bg-gray-800 text-gray-400 text-xs font-bold flex items-center gap-1"><Clock size={14}/> {job.type === 'part_time' ? 'Part-time' : job.type === 'full_time' ? 'Full-time' : 'Freelance'}</span>
                      </div>
                   </div>
                   
                   <div className="flex items-center">
                      <a href={`tel:${job.contact}`} className="bg-white text-black px-5 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition flex items-center gap-2 w-full md:w-auto justify-center">
                         <Phone size={18} /> Ứng tuyển
                      </a>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>
      
      {/* ✅ CHỈ RENDER MODAL KHI ĐÃ ĐĂNG NHẬP */}
      {isModalOpen && user && (
        <CreateJobModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchJobs} />
      )}
      
      <PaymentModal />
    </div>
  );
}