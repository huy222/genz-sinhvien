"use client";
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Trash2, ShoppingBag, Briefcase, MessageSquare, 
  LayoutDashboard, Users, Megaphone, 
  Plus, Zap, FileText, Eye, CheckCircle, 
  UploadCloud, X, Star, ArrowLeft, LogOut, ShieldCheck, ShieldX
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import EditUserModal from '@/components/EditUserModal'; 
import ViewDetailModal from '@/components/ViewDetailModal';

// --- COMPONENT CON: THẺ THỐNG KÊ ---
const StatCard = ({ title, icon: Icon, color, data }: any) => (
  <div className="bg-[#18181b] rounded-2xl border border-gray-800 overflow-hidden hover:border-gray-700 transition relative group shadow-lg">
    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition ${color}`}>
      <Icon size={64} />
    </div>
    <div className="p-5">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${color} bg-opacity-20 text-white shadow-sm`}>
          <Icon size={20} />
        </div>
        <p className="text-gray-400 font-bold text-sm uppercase tracking-wider">{title}</p>
      </div>
      <p className="text-4xl font-black text-white mb-4">{data.total}</p>
      <div className="grid grid-cols-2 gap-2 border-t border-gray-800 pt-3">
        <div className="text-center">
          <p className="text-[10px] text-gray-500 uppercase font-bold">Hôm nay</p>
          <p className={`font-bold text-lg ${data.day > 0 ? 'text-green-400' : 'text-gray-600'}`}>+{data.day}</p>
        </div>
        <div className="text-center border-l border-gray-800">
          <p className="text-[10px] text-gray-500 uppercase font-bold">Tuần này</p>
          <p className={`font-bold text-lg ${data.week > 0 ? 'text-blue-400' : 'text-gray-600'}`}>+{data.week}</p>
        </div>
      </div>
    </div>
  </div>
);

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'products' | 'jobs' | 'reviews' | 'marketing' | 'docs'>('users'); 
  const [userSubTab, setUserSubTab] = useState<'verified' | 'unverified'>('verified'); 
  const [dataList, setDataList] = useState<any[]>([]);
  
  // Modal & Marketing State
  const [editingUser, setEditingUser] = useState<any>(null);
  const [viewingItem, setViewingItem] = useState<any>(null);
  const [vipEnabled, setVipEnabled] = useState(false);
  const [banners, setBanners] = useState<any[]>([]);
  const [newBanner, setNewBanner] = useState({ title: '', description: '' });
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [stats, setStats] = useState({
    users: { total: 0, day: 0, week: 0 },
    products: { total: 0, day: 0, week: 0 },
    jobs: { total: 0, day: 0, week: 0 },
    reviews: { total: 0, day: 0, week: 0 },
    docs: { total: 0, day: 0, week: 0 },
  });

  const router = useRouter();
  const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || ""; 

  // --- 1. TÍNH TOÁN THỐNG KÊ ---
  const calculateStats = useCallback(async () => {
    const countTime = (items: any[]) => {
      const now = new Date();
      const startOfDay = new Date(new Date().setHours(0,0,0,0));
      const startOfWeek = new Date(new Date().setDate(now.getDate() - now.getDay()));
      return {
        total: items.length,
        day: items.filter(i => new Date(i.created_at) >= startOfDay).length,
        week: items.filter(i => new Date(i.created_at) >= startOfWeek).length,
      };
    };

    const { data: u } = await supabase.from('profiles').select('created_at');
    const { data: p } = await supabase.from('products').select('created_at');
    const { data: j } = await supabase.from('jobs').select('created_at');
    const { data: r } = await supabase.from('reviews').select('created_at');
    const { data: d } = await supabase.from('documents').select('created_at');
    
    setStats({ 
      users: countTime(u||[]), 
      products: countTime(p||[]), 
      jobs: countTime(j||[]), 
      reviews: countTime(r||[]),
      docs: countTime(d||[]) 
    });
  }, []);

  // --- 2. LẤY DỮ LIỆU DANH SÁCH ---
  const fetchListContent = useCallback(async () => {
    setLoading(true);
    const tableMap: any = {
      'users': 'profiles', 
      'docs': 'documents',
      'products': 'products',
      'jobs': 'jobs',
      'reviews': 'reviews'
    };
    const targetTable = tableMap[activeTab];

    try {
      let query;
      if (activeTab === 'users') {
        query = supabase.from(targetTable).select('*');
      } else {
        // Tự động Join profile để lấy thông tin người đăng
        query = supabase.from(targetTable).select(`
          *,
          profiles:user_id (username, email)
        `);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      setDataList(data || []);
    } catch (err: any) {
      const { data: fallback } = await supabase.from(targetTable).select('*').order('created_at', { ascending: false });
      setDataList(fallback || []);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  // --- 3. KIỂM TRA QUYỀN ADMIN ---
  const checkAdmin = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      router.push("/");
    } else {
      setIsAdmin(true);
      calculateStats();
    }
    setLoading(false);
  }, [ADMIN_EMAIL, router, calculateStats]);

  useEffect(() => { checkAdmin(); }, [checkAdmin]);
  
  useEffect(() => { 
    if (isAdmin) {
      if (activeTab === 'marketing') {
        const fetchBanners = async () => {
          const { data } = await supabase.from('banner_config').select('*').order('created_at', { ascending: false });
          setBanners(data || []);
        };
        fetchBanners();
      } else {
        fetchListContent(); 
      }
      
      const fetchSettings = async () => {
        const { data } = await supabase.from('app_settings').select('enable_market_vip').eq('id', 1).single();
        if (data) setVipEnabled(data.enable_market_vip);
      };
      fetchSettings();
    }
  }, [activeTab, isAdmin, fetchListContent]);

  // --- 4. HÀM XỬ LÝ ---
  const handleApprove = async (id: any) => {
    const table = activeTab === 'docs' ? 'documents' : activeTab;
    const { error } = await supabase.from(table).update({ is_approved: true }).eq('id', id);
    if (!error) {
      setDataList(prev => prev.map(item => item.id === id ? { ...item, is_approved: true } : item));
      calculateStats();
    }
  };

  const handleDelete = async (id: any) => {
    if(!confirm("⚠️ Xóa vĩnh viễn dữ liệu này?")) return;
    const table = activeTab === 'users' ? 'profiles' : (activeTab === 'docs' ? 'documents' : activeTab);
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (!error) {
      setDataList(prev => prev.filter(item => item.id !== id));
      calculateStats();
    }
  };

  const handleToggleProductVip = async (id: number, currentStatus: boolean) => {
    const table = activeTab === 'jobs' ? 'jobs' : 'products';
    const { error } = await supabase.from(table).update({ is_vip: !currentStatus }).eq('id', id);
    if (!error) {
      setDataList(prev => prev.map(item => item.id === id ? { ...item, is_vip: !currentStatus } : item));
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setBannerImage(e.target.files[0]);
      setPreviewUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleAddBanner = async () => {
    if (!newBanner.title) return alert("Thiếu tiêu đề!");
    setIsUploading(true);
    let imageUrl = null;
    if (bannerImage) {
      const fileName = `banner-${Date.now()}`;
      const { error: upErr } = await supabase.storage.from('banners').upload(fileName, bannerImage);
      if (!upErr) {
        imageUrl = supabase.storage.from('banners').getPublicUrl(fileName).data.publicUrl;
      }
    }
    const { error } = await supabase.from('banner_config').insert({ ...newBanner, image_url: imageUrl, is_active: true });
    if (!error) {
      setNewBanner({ title: '', description: '' });
      setPreviewUrl(null);
      // Refresh banners...
    }
    setIsUploading(false);
  };

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-white italic animate-pulse">ADMIN LOADING...</div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-6 md:p-8 pt-24">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-orange-500/20 text-orange-500 rounded-2xl border border-orange-500/30">
            <LayoutDashboard size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter">Admin Center</h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Hệ thống Quản trị & Bảo mật</p>
          </div>
        </div>
        <div className="flex gap-2">
            <button onClick={() => router.push('/')} className="px-4 py-2 bg-gray-800 rounded-lg text-xs font-bold hover:bg-gray-700 flex items-center gap-2 transition">
                <ArrowLeft size={14}/> Trang Chủ
            </button>
            <button onClick={async () => { await supabase.auth.signOut(); router.push('/'); }} className="px-4 py-2 bg-red-600/20 text-red-500 border border-red-600/30 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white flex items-center gap-2 transition">
                <LogOut size={14}/> Thoát
            </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        <StatCard title="User" icon={Users} color="text-green-500" data={stats.users} />
        <StatCard title="Chợ" icon={ShoppingBag} color="text-pink-500" data={stats.products} />
        <StatCard title="Job" icon={Briefcase} color="text-blue-500" data={stats.jobs} />
        <StatCard title="Phốt" icon={MessageSquare} color="text-purple-500" data={stats.reviews} />
        <StatCard title="File" icon={FileText} color="text-emerald-500" data={stats.docs} />
      </div>

      <div className="bg-[#18181b] rounded-3xl border border-gray-800 overflow-hidden shadow-2xl">
        {/* TABS */}
        <div className="flex border-b border-gray-800 bg-white/5 overflow-x-auto">
          {[
            { id: 'users', label: 'Thành viên', icon: Users },
            { id: 'marketing', label: 'Marketing', icon: Megaphone },
            { id: 'reviews', label: 'Reviews/Phốt', icon: MessageSquare },
            { id: 'products', label: 'Chợ Đồ Cũ', icon: ShoppingBag },
            { id: 'jobs', label: 'Việc Làm', icon: Briefcase },
            { id: 'docs', label: 'Tài liệu', icon: FileText },
          ].map((tab: any) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 py-5 text-sm font-bold transition flex items-center justify-center gap-3 min-w-[150px] ${activeTab === tab.id ? 'bg-white/10 text-white border-b-2 border-orange-500' : 'text-gray-500 hover:text-gray-300'}`}>
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div className="p-0">
          {activeTab === 'marketing' ? (
              <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="bg-orange-500/10 p-6 rounded-3xl border border-orange-500/20">
                   <h3 className="text-white font-black uppercase italic mb-4">Tạo Banner mới</h3>
                   <div className="space-y-4">
                      <input type="text" placeholder="Tiêu đề" value={newBanner.title} onChange={e => setNewBanner({...newBanner, title: e.target.value})} className="w-full bg-black border border-gray-800 rounded-xl p-4 text-sm"/>
                      <textarea placeholder="Mô tả" value={newBanner.description} onChange={e => setNewBanner({...newBanner, description: e.target.value})} className="w-full bg-black border border-gray-800 rounded-xl p-4 text-sm h-20"/>
                      <label className="block w-full border-2 border-dashed border-gray-700 rounded-xl p-4 text-center cursor-pointer hover:border-orange-500">
                         {previewUrl ? <img src={previewUrl} className="h-20 mx-auto object-cover"/> : <span className="text-xs text-gray-500">Chọn ảnh Banner</span>}
                         <input type="file" className="hidden" onChange={handleImageSelect}/>
                      </label>
                      <button onClick={handleAddBanner} disabled={isUploading} className="w-full bg-orange-500 text-black font-black py-4 rounded-xl uppercase text-xs tracking-widest">
                        {isUploading ? "Đang tải..." : "Đăng Banner"}
                      </button>
                   </div>
                </div>
              </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-500 text-[10px] font-black uppercase tracking-widest border-b border-gray-800 bg-white/[0.01]">
                    <th className="p-6">Thông tin chi tiết</th>
                    <th className="p-6">Kiểm duyệt</th>
                    <th className="p-6 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-900/50">
                  {dataList
                    .filter(item => activeTab === 'users' ? (userSubTab === 'verified' ? item.is_verified : !item.is_verified) : true)
                    .map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02] group transition">
                      <td className="p-6">
                         <div className="font-black text-white text-sm uppercase tracking-tighter line-clamp-1">
                            {activeTab === 'reviews' ? item.content : (item.title || item.username || item.subject_name || "Nội dung trống")}
                         </div>
                         <div className="text-[10px] text-gray-500 font-bold uppercase mt-1">
                            {item.profiles ? `Bởi: ${item.profiles.username} (${item.profiles.email})` : item.email || "Ẩn danh"}
                         </div>
                      </td>
                      <td className="p-6">
                        {activeTab === 'users' ? (
                           item.is_verified ? <ShieldCheck className="text-green-500" size={20}/> : <ShieldX className="text-red-500" size={20}/>
                        ) : (
                          <div className="flex items-center gap-2">
                             {item.is_approved ? (
                               <span className="text-green-500 text-[10px] font-black uppercase flex items-center gap-1"><CheckCircle size={14}/> Sạch</span>
                             ) : (
                               <button onClick={() => handleApprove(item.id)} className="bg-orange-500 text-black text-[10px] font-black px-3 py-1.5 rounded-lg uppercase">Duyệt bài</button>
                             )}
                          </div>
                        )}
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                           {(activeTab === 'products' || activeTab === 'jobs') && (
                              <button onClick={() => handleToggleProductVip(item.id, item.is_vip)} className={`p-2 rounded-lg ${item.is_vip ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-400'}`}>
                                 <Zap size={16} fill={item.is_vip ? "currentColor" : "none"}/>
                              </button>
                           )}
                           <button onClick={() => setViewingItem(item)} className="p-2 bg-gray-800 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white"><Eye size={16}/></button>
                           {activeTab === 'users' && <button onClick={() => setEditingUser(item)} className="p-2 bg-gray-800 text-orange-400 rounded-lg"><Plus size={16}/></button>}
                           {(item.email !== ADMIN_EMAIL) && (
                             <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white"><Trash2 size={16}/></button>
                           )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {editingUser && <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} onSave={(id:any, data:any) => { /* logic update */ }} />}
      {viewingItem && <ViewDetailModal isOpen={!!viewingItem} onClose={() => setViewingItem(null)} data={viewingItem} type={activeTab} />}
    </div>
  );
}