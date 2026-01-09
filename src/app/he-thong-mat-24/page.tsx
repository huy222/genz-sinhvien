"use client";
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Trash2, ShoppingBag, Briefcase, MessageSquare, 
  LayoutDashboard, Users, Megaphone, 
  Plus, Zap, FileText, Eye, Check, Globe, Smartphone, ShieldCheck, ShieldX,
  Image as ImageIcon, UploadCloud, X, Star, CheckCircle, ArrowLeft, LogOut
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
  
  // Modal State
  const [editingUser, setEditingUser] = useState<any>(null);
  const [viewingItem, setViewingItem] = useState<any>(null);
  
  // System Config State
  const [vipEnabled, setVipEnabled] = useState(false);
  
  // Marketing State
  const [banners, setBanners] = useState<any[]>([]);
  const [newBanner, setNewBanner] = useState({ title: '', description: '' });
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Stats State
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

    // Lấy gọn data chỉ cần cột created_at để tính toán cho nhanh
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

  // --- 2. LẤY DỮ LIỆU DANH SÁCH (CÓ JOIN BẢNG) ---
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

    try {
      let query;
      if (activeTab === 'users') {
        query = supabase.from(targetTable).select('*');
      } else {
        // --- LOGIC CHỌN CỘT NỐI THEO TAB ---
        let foreignKey = 'user_id'; // Mặc định
        
        // Nếu tab Review dùng tên cột khác, hãy đổi ở đây
        // Ví dụ: if (activeTab === 'reviews') foreignKey = 'author_id';

        query = supabase.from(targetTable).select(`
          *,
          profiles:${foreignKey} (
            username,
            email
          )
        `);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      setDataList(data || []);
    } catch (err: any) {
      console.error(`Lỗi fetch tab ${activeTab}:`, err.message);
      
      // Nếu lỗi do "không tìm thấy quan hệ", hãy thử lấy dữ liệu mà không join profile
      const { data: fallbackData } = await supabase.from(targetTable).select('*').order('created_at', { ascending: false });
      setDataList(fallbackData || []);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  // --- 3. CÁC HÀM BỔ TRỢ ---
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
    const currentEmail = user?.email?.trim().toLowerCase();
    const adminEmail = ADMIN_EMAIL?.trim().toLowerCase();

    if (!user || currentEmail !== adminEmail) {
      router.push("/"); // Đá về trang chủ nếu không phải admin
    } else {
      setIsAdmin(true);
      calculateStats();
    }
    setLoading(false);
  }, [ADMIN_EMAIL, router, calculateStats]);

  // --- 4. LIFECYCLE ---
  useEffect(() => { checkAdmin(); }, [checkAdmin]);
  
  useEffect(() => { 
    if (isAdmin) {
      if (activeTab === 'marketing') fetchBanners();
      else fetchListContent(); 
      
      if (activeTab === 'products' || activeTab === 'jobs') fetchSettings();
    }
  }, [activeTab, isAdmin, userSubTab, fetchListContent, fetchBanners, fetchSettings]);

  // --- 5. HÀM XỬ LÝ (ACTIONS) ---
  
  // Duyệt bài
  const handleApprove = async (id: string | number) => {
    const table = activeTab === 'docs' ? 'documents' : activeTab;
    
    // Optimistic Update (Cập nhật giao diện trước khi gọi API)
    setDataList(prev => prev.map(item => item.id === id ? { ...item, is_approved: true } : item));

    const { error } = await supabase.from(table).update({ is_approved: true }).eq('id', id);
    if (error) {
      alert("Lỗi duyệt bài: " + error.message);
      fetchListContent(); // Revert lại nếu lỗi
    } else {
      calculateStats();
    }
  };

  // Xóa dữ liệu
  const handleDelete = async (id: any) => {
    if(!confirm("⚠️ Cảnh báo: Xóa vĩnh viễn dữ liệu này?")) return;
    
    // Optimistic UI
    setDataList(prev => prev.filter(item => item.id !== id));

    const table = activeTab === 'users' ? 'profiles' : (activeTab === 'docs' ? 'documents' : activeTab);
    const { error } = await supabase.from(table).delete().eq('id', id);
    
    if (error) {
      alert(`Lỗi: ${error.message}`);
      fetchListContent();
    } else {
      calculateStats();
    }
  };

  // Toggle VIP (Ghim bài)
  const handleToggleProductVip = async (id: number, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    // Cập nhật giao diện ngay
    setDataList(prev => prev.map(item => item.id === id ? { ...item, is_vip: newStatus } : item));
    
    const { error } = await supabase.from('products').update({ is_vip: newStatus }).eq('id', id);
    if (error) {
        alert("Lỗi cập nhật VIP: " + error.message);
        fetchListContent();
    }
  };

  // Bật/Tắt hệ thống VIP toàn trang
  const toggleVipFeature = async () => {
    const newState = !vipEnabled;
    setVipEnabled(newState);
    const { error } = await supabase.from('app_settings').update({ enable_market_vip: newState }).eq('id', 1);
    if (error) alert("Lỗi lưu cài đặt: " + error.message);
  };

  // --- 6. LOGIC MARKETING (BANNER) ---
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
      // Upload ảnh lên Storage (Bucket tên là 'banners')
      const fileName = `banner-${Date.now()}-${bannerImage.name.replace(/[^a-zA-Z0-9]/g, '')}`;
      const { error: uploadError } = await supabase.storage.from('banners').upload(fileName, bannerImage);
      
      if (uploadError) {
        alert("Lỗi upload ảnh: " + uploadError.message);
        setIsUploading(false);
        return;
      }
      
      const { data: publicUrlData } = supabase.storage.from('banners').getPublicUrl(fileName);
      imageUrl = publicUrlData.publicUrl;
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

  // Cập nhật user từ Modal
  const handleSaveUser = async (id: string, newData: any) => {
    const { error } = await supabase.from('profiles').update(newData).eq('id', id);
    if (!error) {
      setDataList(prev => prev.map(item => item.id === id ? { ...item, ...newData } : item));
      alert("✅ Cập nhật thành công!");
    }
  };

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-white font-bold tracking-widest animate-pulse text-xs uppercase italic">Đang tải dữ liệu Admin...</div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-6 md:p-8 pt-24">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-orange-500/20 text-orange-500 rounded-2xl border border-orange-500/30">
            <LayoutDashboard size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic">Admin Center</h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em]">Hệ thống Quản trị & Bảo mật</p>
          </div>
        </div>
        <div className="flex gap-2">
            <button onClick={() => router.push('/')} className="px-4 py-2 bg-gray-800 rounded-lg text-xs font-bold hover:bg-gray-700 flex items-center gap-2 transition">
                <ArrowLeft size={14}/> Về Trang Chủ
            </button>
            <button onClick={async () => { await supabase.auth.signOut(); router.push('/'); }} className="px-4 py-2 bg-red-600/20 text-red-500 border border-red-600/30 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white flex items-center gap-2 transition">
                <LogOut size={14}/> Đăng xuất
            </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
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

        {/* TAB CONTENT */}
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
                            <span className="text-[10px] text-gray-500 mt-2">Upload ảnh</span>
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
              {/* SUBTABS CHO USERS */}
              {activeTab === 'users' && (
                <div className="p-4 bg-white/[0.02] border-b border-gray-800 flex flex-wrap gap-4 px-8 items-center">
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

              {/* DATA TABLE */}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-gray-500 text-[10px] font-black uppercase tracking-widest border-b border-gray-800 bg-white/[0.01]">
                    <th className="p-6">Chi tiết nội dung</th>
                    <th className="p-6">Trạng thái</th>
                    <th className="p-6 text-right">Thao tác</th>
                  </tr>
                </thead>
             <tbody className="divide-y divide-gray-900/50">
  {dataList.length === 0 && (
    <tr><td colSpan={3} className="p-8 text-center text-gray-600 text-sm">Không có dữ liệu</td></tr>
  )}
  {dataList
    .filter(item => activeTab === 'users' ? (userSubTab === 'verified' ? item.is_verified : !item.is_verified) : true)
    .map((item) => {
       // --- LOGIC HIỂN THỊ THÔNG MINH ---
       let displayTitle = "Không tiêu đề";
       let displaySubtitle = "";
       
       if (activeTab === 'users') {
           displayTitle = item.username || item.email?.split('@')[0];
           displaySubtitle = item.email;
       } else {
           // SỬA TẠI ĐÂY: Ưu tiên lấy content cho Review, title cho các loại khác
           displayTitle = item.content || item.title || item.subject_name || item.employer || "Bài viết không nội dung";
           
           // Hiển thị tên người đăng từ object profiles (đã join)
           const authorName = item.profiles?.username || "Người dùng ẩn";
           const authorEmail = item.profiles?.email ? `(${item.profiles.email})` : "";
           displaySubtitle = `Đăng bởi: ${authorName} ${authorEmail}`;
       }

       return (
        <tr key={item.id} className="hover:bg-white/[0.02] transition group">
          <td className="p-6">
              <div className="font-black text-white text-sm uppercase mb-1 tracking-tighter line-clamp-1">
                  {displayTitle}
              </div>
              <div className="text-[11px] text-gray-500 font-medium">{displaySubtitle}</div>
          </td>
          <td className="p-6">
              {activeTab === 'users' ? (
                  item.is_verified ? <span className="text-green-500 text-[10px] font-bold border border-green-500/20 px-2 py-1 rounded bg-green-500/5">Đã xác minh</span> : <span className="text-red-500 text-[10px] font-bold border border-red-500/20 px-2 py-1 rounded bg-red-500/5">Chưa xác minh</span>
              ) : (
              <div className="flex items-center gap-3">
                  {item.is_approved ? (
                      <span className="text-green-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><CheckCircle size={14}/> Đã duyệt</span>
                  ) : (
                      <button onClick={() => handleApprove(item.id)} className="bg-orange-500 text-black text-[10px] font-black px-4 py-2 rounded-lg hover:bg-orange-400 transition shadow-lg uppercase active:scale-95">Duyệt ngay</button>
                  )}
                  {item.is_vip && <span className="text-yellow-500 text-[10px] font-black bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20 flex items-center gap-1"><Zap size={10} fill="currentColor"/> VIP</span>}
              </div>
              )}
          </td>
          <td className="p-6 text-right">
              <div className="flex justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
              
              {/* Nút Ghim VIP (Chỉ cho Products/Jobs) */}
              {(activeTab === 'products' || activeTab === 'jobs') && (
                  <button 
                  onClick={() => handleToggleProductVip(item.id, item.is_vip)} 
                  className={`p-2.5 rounded-xl transition shadow-sm ${item.is_vip ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-white/5 text-gray-400 hover:text-yellow-500 hover:bg-white/10'}`}
                  title={item.is_vip ? "Gỡ ghim" : "Ghim bài lên Top"}
                  >
                  <Star size={18} fill={item.is_vip ? "currentColor" : "none"} />
                  </button>
              )}

              {/* Nút Xem chi tiết */}
              <button onClick={() => setViewingItem(item)} className="p-2.5 bg-white/5 text-gray-400 rounded-xl hover:bg-white hover:text-black transition shadow-sm" title="Xem chi tiết">
                  <Eye size={18} />
              </button>

              {/* Nút Edit User */}
              {activeTab === 'users' && (
                  <button onClick={() => setEditingUser(item)} className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition shadow-sm" title="Sửa User">
                      <ShieldCheck size={18} />
                  </button>
              )}
              
              {/* Nút Xóa */}
              {(item.role !== 'admin' && item.email !== ADMIN_EMAIL) && (
                  <button onClick={() => handleDelete(item.id)} className="p-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition" title="Xóa vĩnh viễn">
                  <Trash2 size={18} />
                  </button>
              )}
              </div>
          </td>
        </tr>
    )})}
</tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      {editingUser && <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} onSave={handleSaveUser} />}
      {viewingItem && <ViewDetailModal isOpen={!!viewingItem} onClose={() => setViewingItem(null)} data={viewingItem} type={activeTab} />}
    </div>
  );
}