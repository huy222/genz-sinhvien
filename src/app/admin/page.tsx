"use client";
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Trash2, ShoppingBag, Briefcase, MessageSquare, 
  LayoutDashboard, Users, Megaphone, 
  Plus, Zap, FileText, Eye, Check, Globe, Smartphone, ShieldCheck, ShieldX,
  Image as ImageIcon, UploadCloud, X, Star, CheckCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import EditUserModal from '@/components/EditUserModal'; 
import ViewDetailModal from '@/components/ViewDetailModal';

// --- Thẻ thống kê (StatCard) ---
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
  
  const [editingUser, setEditingUser] = useState<any>(null);
  const [viewingItem, setViewingItem] = useState<any>(null);
  const [vipEnabled, setVipEnabled] = useState(false);
  
  // State cho Marketing
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

  // --- 1. Thống kê số liệu ---
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

  // --- 2. Lấy dữ liệu danh sách ---
  const fetchListContent = useCallback(async () => {
    setLoading(true);
    const tableMap: any = {
      'users': 'profiles', 
      'docs': 'documents',
      'products': 'products',
      'jobs': 'jobs',
      'reviews': 'reviews'
    };
    const targetTable = tableMap[activeTab] || activeTab;

    // Sắp xếp: VIP lên đầu, sau đó đến ngày tạo
    let query = supabase.from(targetTable).select('*').order('created_at', { ascending: false });
    
    // Nếu là products thì ưu tiên hiển thị is_vip trước
    if (activeTab === 'products') {
       query = supabase.from(targetTable).select('*').order('is_vip', { ascending: false }).order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error("Lỗi fetch:", error.message);
      setDataList([]);
    } else {
      const safeData = data?.map(item => ({
        ...item,
        profiles: item.profiles || { 
          username: item.username || item.email?.split('@')[0] || "Người dùng",
          email: item.email || "N/A"
        }
      }));
      setDataList(safeData || []);
    }
    setLoading(false);
  }, [activeTab]);

  // --- 3. Các hàm bổ trợ ---
  const fetchBanners = useCallback(async () => {
    const { data } = await supabase.from('banner_config').select('*').order('created_at', { ascending: false });
    if (data) setBanners(data);
  }, []);

  const fetchSettings = useCallback(async () => {
    const { data } = await supabase.from('app_settings').select('enable_market_vip').eq('id', 1).single();
    if (data) setVipEnabled(data.enable_market_vip);
  }, []);

  const checkAdmin = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email !== ADMIN_EMAIL) {
      router.push("/");
    } else {
      setIsAdmin(true);
      calculateStats();
    }
    setLoading(false);
  }, [ADMIN_EMAIL, router, calculateStats]);

  // --- 4. Quản lý LifeCycle ---
  useEffect(() => { checkAdmin(); }, [checkAdmin]);
  
  useEffect(() => { 
    if (isAdmin) {
      if (activeTab === 'marketing') fetchBanners();
      else fetchListContent(); 
      if (activeTab === 'products' || activeTab === 'jobs') fetchSettings();
    }
  }, [activeTab, isAdmin, userSubTab, fetchListContent, fetchBanners, fetchSettings]);

  // --- 5. Thao tác dữ liệu ---
  const handleApprove = async (id: string | number) => {
    const table = activeTab === 'docs' ? 'documents' : activeTab;
    const { error } = await supabase.from(table).update({ is_approved: true }).eq('id', id);
    if (!error) {
      setDataList(prev => prev.map(item => item.id === id ? { ...item, is_approved: true } : item));
      calculateStats();
    } else {
      alert("Lỗi duyệt bài: " + error.message);
    }
  };

  const handleDelete = async (id: any) => {
    if(!confirm("⚠️ Cảnh báo: Xóa vĩnh viễn dữ liệu này?")) return;
    const table = activeTab === 'users' ? 'profiles' : (activeTab === 'docs' ? 'documents' : activeTab);
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) {
      alert(`Lỗi: ${error.message}`);
    } else {
      setDataList(prev => prev.filter(item => item.id !== id));
      calculateStats();
    }
  };

  // 🔥 HÀM TOGGLE VIP (Mới thêm)
  const handleToggleProductVip = async (id: number, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const { error } = await supabase.from('products').update({ is_vip: newStatus }).eq('id', id);
    
    if (error) {
        alert("Lỗi cập nhật VIP: " + error.message);
    } else {
        // Cập nhật giao diện ngay lập tức
        setDataList(prev => prev.map(item => item.id === id ? { ...item, is_vip: newStatus } : item));
    }
  };

  const toggleVipFeature = async () => {
    const newState = !vipEnabled;
    setVipEnabled(newState);
    const { error } = await supabase.from('app_settings').update({ enable_market_vip: newState }).eq('id', 1);
    if (error) alert("Lỗi lưu cài đặt: " + error.message);
  };

  // --- MARKETING ACTIONS ---
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBannerImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAddBanner = async () => {
    if (!newBanner.title) return alert("Thiếu tiêu đề!");
    setIsUploading(true);
    let imageUrl = null;
    if (bannerImage) {
      const fileName = `banner-${Date.now()}-${bannerImage.name}`;
      const { data, error } = await supabase.storage.from('banners').upload(fileName, bannerImage);
      if (!error) {
        const { data: publicUrlData } = supabase.storage.from('banners').getPublicUrl(fileName);
        imageUrl = publicUrlData.publicUrl;
      }
    }
    const { error } = await supabase.from('banner_config').insert({ 
      title: newBanner.title, 
      description: newBanner.description,
      image_url: imageUrl,
      is_active: true 
    });
    if (!error) {
      setNewBanner({ title: '', description: '' });
      setBannerImage(null);
      setPreviewUrl(null);
      fetchBanners();
    } else {
      alert("Lỗi tạo banner: " + error.message);
    }
    setIsUploading(false);
  };

  const handleToggleBanner = async (id: number, currentStatus: boolean) => {
    const { error } = await supabase.from('banner_config').update({ is_active: !currentStatus }).eq('id', id);
    if (!error) fetchBanners();
  };

  const handleDeleteBanner = async (id: number) => {
    if (!confirm("⚠️ Xóa banner này?")) return;
    const { error } = await supabase.from('banner_config').delete().eq('id', id);
    if (!error) setBanners(prev => prev.filter(b => b.id !== id));
  };

  const handleSaveUser = async (id: string, newData: any) => {
    const { error } = await supabase.from('profiles').update(newData).eq('id', id);
    if (!error) {
      setDataList(prev => prev.map(item => item.id === id ? { ...item, ...newData } : item));
      alert("✅ Cập nhật thành công!");
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-bold tracking-widest animate-pulse text-xs uppercase italic">System Authenticating...</div>;
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
            <h1 className="text-3xl font-black tracking-tighter uppercase italic">Admin Center</h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em]">Hệ thống Quản trị & Bảo mật</p>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-10">
        <StatCard title="Thành viên" icon={Users} color="text-green-500" data={stats.users} />
        <StatCard title="Hàng hóa" icon={ShoppingBag} color="text-pink-500" data={stats.products} />
        <StatCard title="Việc làm" icon={Briefcase} color="text-blue-500" data={stats.jobs} />
        <StatCard title="Review" icon={MessageSquare} color="text-purple-500" data={stats.reviews} />
        <StatCard title="Tài liệu" icon={FileText} color="text-emerald-500" data={stats.docs} />
      </div>

      <div className="bg-[#18181b] rounded-3xl border border-gray-800 overflow-hidden shadow-2xl">
        {/* TAB NAVIGATION */}
        <div className="flex border-b border-gray-800 bg-white/5 overflow-x-auto custom-scrollbar">
          {[
            { id: 'users', label: 'Thành viên', icon: Users },
            { id: 'marketing', label: 'Marketing', icon: Megaphone },
            { id: 'reviews', label: 'Reviews', icon: MessageSquare },
            { id: 'products', label: 'Chợ Pass', icon: ShoppingBag },
            { id: 'jobs', label: 'Việc Làm', icon: Briefcase },
            { id: 'docs', label: 'Tài liệu', icon: FileText },
          ].map((tab: any) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 py-5 text-sm font-bold transition flex items-center justify-center gap-3 min-w-[140px] ${activeTab === tab.id ? 'bg-white/10 text-white border-b-2 border-orange-500' : 'text-gray-500 hover:text-gray-300'}`}>
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </div>

        <div className="p-0">
          {activeTab === 'marketing' ? (
             <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
               {/* FORM TẠO BANNER */}
               <div className="lg:col-span-1 space-y-6">
                 <div className="bg-orange-500/10 p-6 rounded-3xl border border-orange-500/20 relative overflow-hidden">
                   <h3 className="text-white font-black uppercase italic tracking-tighter mb-4 flex items-center gap-2">
                     <Plus size={18} className="text-orange-500" /> Tạo chiến dịch mới
                   </h3>
                   <div className="space-y-4">
                     <div>
                       <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Tiêu đề Banner</label>
                       <input type="text" value={newBanner.title} onChange={e => setNewBanner({...newBanner, title: e.target.value})} className="w-full bg-black/50 border border-gray-800 rounded-xl p-4 text-white focus:border-orange-500 transition outline-none text-sm"/>
                     </div>
                     <div>
                       <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Mô tả ngắn</label>
                       <textarea value={newBanner.description} onChange={e => setNewBanner({...newBanner, description: e.target.value})} className="w-full bg-black/50 border border-gray-800 rounded-xl p-4 text-white focus:border-orange-500 h-24 transition outline-none text-sm resize-none"/>
                     </div>
                     <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Hình ảnh</label>
                        {!previewUrl ? (
                          <label className="w-full h-24 border-2 border-dashed border-gray-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 transition">
                            <UploadCloud size={24} className="text-gray-500" />
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageSelect} />
                          </label>
                        ) : (
                          <div className="relative w-full h-32 rounded-xl overflow-hidden border border-gray-700">
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                            <button onClick={() => { setBannerImage(null); setPreviewUrl(null); }} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"><X size={14} /></button>
                          </div>
                        )}
                     </div>
                     <button onClick={handleAddBanner} disabled={isUploading} className="w-full bg-orange-500 text-black font-black py-4 rounded-xl hover:bg-orange-400 transition uppercase text-[11px] tracking-widest flex justify-center items-center gap-2">
                       {isUploading ? "Đang xử lý..." : "Kích hoạt Banner ngay"}
                     </button>
                   </div>
                 </div>
               </div>
               {/* LIST BANNER */}
               <div className="lg:col-span-2 space-y-4">
                 <h3 className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em]">Danh sách chiến dịch ({banners.length})</h3>
                 <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                   {banners.map((b) => (
                     <div key={b.id} className="p-5 rounded-3xl border border-gray-800 bg-white/[0.02] flex gap-5 items-center">
                       <img src={b.image_url || "https://placehold.co/100"} className="w-24 h-24 rounded-2xl object-cover bg-gray-900 border border-gray-800" alt="banner" />
                       <div className="flex-1">
                          <h4 className="font-black text-white uppercase text-sm">{b.title}</h4>
                          <p className="text-[11px] text-gray-500 line-clamp-1">{b.description}</p>
                          <div className="mt-3 flex items-center gap-3">
                             <button onClick={() => handleToggleBanner(b.id, b.is_active)} className={`w-10 h-5 rounded-full relative transition-colors ${b.is_active ? 'bg-orange-500' : 'bg-gray-800'}`}>
                               <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${b.is_active ? 'right-1' : 'left-1'}`} />
                             </button>
                             <button onClick={() => handleDeleteBanner(b.id)} className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition"><Trash2 size={16}/></button>
                          </div>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             </div>
          ) : (
            <div className="overflow-x-auto">
              {/* SUBTABS USERS */}
              {activeTab === 'users' && (
                <div className="p-4 bg-white/[0.02] border-b border-gray-800 flex gap-4 px-8 items-center">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mr-4">Bộ lọc:</span>
                  <button onClick={() => setUserSubTab('verified')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black transition ${userSubTab === 'verified' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'text-gray-500'}`}>
                    <ShieldCheck size={14}/> ĐÃ XÁC MINH
                  </button>
                  <button onClick={() => setUserSubTab('unverified')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black transition ${userSubTab === 'unverified' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-gray-500'}`}>
                    <ShieldX size={14}/> CHƯA XÁC MINH
                  </button>
                </div>
              )}

              {/* VIP CONTROL */}
              {(activeTab === 'products' || activeTab === 'jobs') && (
                <div className="p-4 bg-orange-500/5 border-b border-gray-800 flex justify-between items-center px-8">
                  <div className="flex items-center gap-3">
                    <Zap size={20} className={vipEnabled ? "text-yellow-500" : "text-gray-600"} fill={vipEnabled ? "currentColor" : "none"} />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Hệ thống VIP Market</span>
                  </div>
                  <button onClick={toggleVipFeature} className={`px-6 py-2 rounded-full text-[10px] font-black transition border-2 ${vipEnabled ? 'bg-yellow-500 border-yellow-500 text-black' : 'border-gray-700 text-gray-500'}`}>
                    {vipEnabled ? "HỆ THỐNG ĐANG BẬT" : "HỆ THỐNG ĐANG TẮT"}
                  </button>
                </div>
              )}

              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-gray-500 text-[10px] font-black uppercase tracking-widest border-b border-gray-800 bg-white/[0.01]">
                    <th className="p-6">Chi tiết nội dung</th>
                    <th className="p-6">Trạng thái</th>
                    <th className="p-6 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-900/50">
                  {dataList
                    .filter(item => activeTab === 'users' ? (userSubTab === 'verified' ? item.is_verified : !item.is_verified) : true)
                    .map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition group">
                      <td className="p-6">
                        <div className="font-black text-white text-sm uppercase mb-1 tracking-tighter">
                          {activeTab === 'users' ? (item.username || item.email?.split('@')[0]) : (item.title || item.employer || "Không tiêu đề")}
                        </div>
                        <div className="text-[11px] text-gray-500 font-medium">{item.email}</div>
                      </td>
                      <td className="p-6">
                        {activeTab === 'users' ? (
                          item.is_verified ? <span className="text-green-500 text-[10px] font-bold">Đã xác minh</span> : <span className="text-red-500 text-[10px] font-bold">Chưa xác minh</span>
                        ) : (
                          <div className="flex items-center gap-3">
                            {item.is_approved ? (
                              <span className="text-green-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><CheckCircle size={14}/> Đã duyệt</span>
                            ) : (
                              <button onClick={() => handleApprove(item.id)} className="bg-orange-500 text-black text-[10px] font-black px-4 py-2 rounded-lg hover:bg-orange-400 transition shadow-lg uppercase active:scale-95">Duyệt ngay</button>
                            )}
                            {item.is_vip && <span className="text-yellow-500 text-[10px] font-black bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20">VIP</span>}
                          </div>
                        )}
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          
                          {/* 🔥 NÚT GHIM VIP (MỚI THÊM) - Chỉ hiện cho Products */}
                          {activeTab === 'products' && (
                             <button 
                               onClick={() => handleToggleProductVip(item.id, item.is_vip)} 
                               className={`p-2.5 rounded-xl transition shadow-sm ${item.is_vip ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-white/5 text-gray-400 hover:text-yellow-500 hover:bg-white/10'}`}
                               title={item.is_vip ? "Gỡ ghim" : "Ghim bài lên Top"}
                             >
                               <Star size={18} fill={item.is_vip ? "currentColor" : "none"} />
                             </button>
                          )}

                          <button onClick={() => setViewingItem(item)} className="p-2.5 bg-white/5 text-gray-400 rounded-xl hover:bg-white hover:text-black transition shadow-sm">
                            <Eye size={18} />
                          </button>
                          {(item.role !== 'admin' && item.email !== ADMIN_EMAIL) && (
                            <button onClick={() => handleDelete(item.id)} className="p-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition">
                              <Trash2 size={18} />
                            </button>
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

      {editingUser && <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} onSave={handleSaveUser} />}
      {viewingItem && <ViewDetailModal isOpen={!!viewingItem} onClose={() => setViewingItem(null)} data={viewingItem} type={activeTab} />}
    </div>
  );
}