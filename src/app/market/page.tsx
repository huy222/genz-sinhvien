"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Search, Plus, ShoppingBag, Tag, 
  Clock, Phone, Trash2, Star, CheckCircle2, 
  Zap, X, Crown 
} from 'lucide-react';
import CreateProductModal from '@/components/CreateProductModal';

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const timeAgo = (dateString: string) => {
  const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
  let interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " ngày trước";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " giờ trước";
  return "Vừa xong";
};

export default function MarketPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');

  // 👇 STATE MỚI: Kiểm tra xem hệ thống VIP có đang bật không
  const [isVipSystemActive, setIsVipSystemActive] = useState(false);

  useEffect(() => {
    checkUser();
    fetchProducts();
    fetchSettings(); // 👈 Gọi hàm lấy cài đặt
  }, []);

  useEffect(() => {
    const delaySearch = setTimeout(() => { fetchProducts(); }, 500);
    return () => clearTimeout(delaySearch);
  }, [searchTerm, category]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  // 👇 HÀM MỚI: Đọc cài đặt từ Admin
  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('enable_market_vip')
        .eq('id', 1)
        .single();
      
      if (data) {
        setIsVipSystemActive(data.enable_market_vip);
      }
    } catch (error) {
      console.error("Lỗi tải cài đặt:", error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('products')
        .select('*, profiles(username, avatar_url, is_verified)')
        .eq('is_approved', true)
        .order('is_vip', { ascending: false }) 
        .order('created_at', { ascending: false });

      if (category !== 'all') query = query.eq('category', category);
      if (searchTerm) query = query.ilike('title', `%${searchTerm}%`);

      const { data, error } = await query;
      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm("Bạn chắc chắn muốn xóa bài đăng này?")) return;
    setProducts(prev => prev.filter(p => p.id !== productId));
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) { alert("Lỗi xóa: " + error.message); fetchProducts(); }
  };

  // Chỉ Admin mới dùng hàm này trực tiếp trên giao diện
  const toggleVip = async (product: any) => {
    const newStatus = !product.is_vip;
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_vip: newStatus } : p));
    await supabase.from('products').update({ is_vip: newStatus }).eq('id', product.id);
  };

  const categories = [
    { key: 'all', label: 'Tất cả', icon: '🔥' },
    { key: 'thoi_trang', label: 'Thời trang', icon: '👕' },
    { key: 'do_dien_tu', label: 'Điện tử', icon: '💻' },
    { key: 'sach', label: 'Sách/Giáo trình', icon: '📚' },
    { key: 'xe_co', label: 'Xe cộ', icon: '🛵' },
    { key: 'my_pham', label: 'Mỹ phẩm', icon: '💄' },
    { key: 'gia_dung', label: 'Gia dụng', icon: '🏠' },
    { key: 'khac', label: 'Khác', icon: '📦' },
  ];

  const isAdmin = user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-4 md:p-8 pt-24">
      {/* HEADER */}
      <div className="text-center mb-10 animate-in slide-in-from-top-4 duration-500">
        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 mb-4 tracking-tighter">
          CHỢ THANH LÝ GEN Z
        </h1>
        <p className="text-gray-400 text-sm md:text-base font-medium max-w-2xl mx-auto">
          Cũ người mới ta - Nơi sinh viên trao đổi, mua bán đồ dùng giá rẻ, uy tín.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mt-6">
          {/* NÚT ĐĂNG BÀI */}
          <button 
            onClick={() => {
              if(!user) return alert("Bạn cần đăng nhập để đăng bán!");
              setIsModalOpen(true);
            }}
            className="bg-white text-black hover:bg-gray-200 px-6 py-3 rounded-full font-black uppercase tracking-widest transition shadow-lg shadow-white/10 group active:scale-95 flex items-center gap-2"
          >
            <Plus className="bg-black text-white rounded-full p-1 group-hover:rotate-90 transition" size={20} />
            Đăng Tin Bán Đồ
          </button>

          {/* ⚡ NÚT GIỚI THIỆU GÓI VIP (CHỈ HIỆN KHI ADMIN BẬT) */}
          {isVipSystemActive && (
            <button 
              onClick={() => setIsVipModalOpen(true)}
              className="relative overflow-hidden bg-gradient-to-r from-yellow-600 to-yellow-400 text-black px-6 py-3 rounded-full font-black uppercase tracking-widest transition shadow-lg shadow-yellow-500/20 hover:scale-105 active:scale-95 flex items-center gap-2 animate-in fade-in zoom-in"
            >
              <div className="absolute inset-0 bg-white/20 animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
              <Zap size={20} fill="black" className="animate-pulse" />
              Dịch Vụ Ghim Bài
            </button>
          )}
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="sticky top-20 z-30 max-w-7xl mx-auto mb-8 space-y-4">
        {/* Search & Categories */}
        <div className="relative group">
           <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
           <div className="relative bg-[#18181b] rounded-2xl flex items-center border border-gray-800 p-1">
             <Search className="text-gray-500 ml-4" size={20} />
             <input type="text" placeholder="Tìm kiếm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-transparent border-none text-white p-3 focus:outline-none placeholder:text-gray-600 font-medium" />
           </div>
        </div>
        <div className="overflow-x-auto pb-2 custom-scrollbar">
          <div className="flex gap-2 min-w-max px-1">
            {categories.map((cat) => (
              <button key={cat.key} onClick={() => setCategory(cat.key)} className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wide transition border ${category === cat.key ? 'bg-pink-600 border-pink-600 text-white shadow-lg shadow-pink-600/20' : 'bg-[#18181b] border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white'}`}>
                <span>{cat.icon}</span> {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* PRODUCT LIST */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">{[1, 2, 3, 4].map((i) => <div key={i} className="bg-[#18181b] rounded-3xl h-80 animate-pulse border border-gray-800"></div>)}</div>
        ) : products.length === 0 ? (
           <div className="text-center py-20 bg-[#18181b] rounded-3xl border border-gray-800 border-dashed"><ShoppingBag size={48} className="mx-auto text-gray-600 mb-4" /><h3 className="text-xl font-bold text-gray-400">Không tìm thấy món đồ nào</h3></div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => {
              const isOwner = user?.id === product.user_id;
              const borderClass = product.is_vip ? "border-yellow-500/70 shadow-xl shadow-yellow-500/20 scale-[1.02]" : "border-gray-800 hover:border-gray-600";
              return (
              <div key={product.id} className={`group bg-[#18181b] rounded-3xl border overflow-hidden transition duration-300 flex flex-col relative ${borderClass}`}>
                <div className="aspect-square bg-gray-900 relative overflow-hidden">
                  <img src={product.image_url || "https://images.unsplash.com/photo-1586769852044-692d6e37d74e"} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                  
                  {/* Nhãn VIP */}
                  {product.is_vip && <div className="absolute top-0 left-0 bg-yellow-400 text-black px-3 py-1 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg z-10 rounded-br-2xl"><Zap size={12} fill="black" /> TIN NỔI BẬT</div>}
                  {!product.is_vip && <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase text-white border border-white/10 flex items-center gap-1"><Tag size={10} /> {categories.find(c => c.key === product.category)?.label || "Khác"}</div>}
                  
                  {/* Nút Admin & Xóa */}
                  {isAdmin && <button onClick={(e) => { e.stopPropagation(); toggleVip(product); }} className={`absolute top-2 right-10 p-2 rounded-full shadow-lg z-20 transition ${product.is_vip ? 'bg-yellow-500 text-black' : 'bg-gray-900/80 text-gray-400 hover:text-yellow-400'}`}><Star size={16} fill={product.is_vip ? "black" : "none"} /></button>}
                  {(isOwner || isAdmin) && <button onClick={(e) => { e.stopPropagation(); handleDeleteProduct(product.id); }} className="absolute top-2 right-2 p-2 bg-red-600/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg hover:bg-red-600 z-20 backdrop-blur-sm"><Trash2 size={16} /></button>}
                </div>
                {/* Product Info */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className={`text-sm md:text-base font-bold text-white line-clamp-2 leading-tight min-h-[2.5em] group-hover:text-pink-500 transition mb-1 ${product.is_vip ? 'text-yellow-400' : ''}`}>{product.title}</h3>
                  <div className="text-pink-500 font-black text-lg mb-3 flex items-center gap-1">{formatMoney(product.price)}</div>
                  <div className="mt-auto pt-3 border-t border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <img src={product.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${product.profiles?.username}&background=random`} className={`w-6 h-6 rounded-full border ${product.is_vip ? 'border-yellow-500' : 'border-gray-700'}`} alt="Seller" />
                       <div className="flex flex-col"><span className="text-[10px] font-bold text-gray-300 max-w-[80px] truncate flex items-center gap-1">{product.profiles?.username}{product.profiles?.is_verified && <CheckCircle2 size={10} className="text-blue-500" />}</span><span className="text-[9px] text-gray-600 flex items-center gap-0.5"><Clock size={8}/> {timeAgo(product.created_at)}</span></div>
                    </div>
                    <a href={`tel:${product.contact}`} className={`p-2 rounded-full transition shadow-lg ${product.is_vip ? 'bg-yellow-400 text-black hover:bg-yellow-300' : 'bg-white text-black hover:bg-pink-500 hover:text-white'}`}><Phone size={14} fill="currentColor" /></a>
                  </div>
                </div>
              </div>
            )})}
          </div>
        )}
      </div>

      {/* MODAL ĐĂNG BÀI */}
      <CreateProductModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={() => fetchProducts()} />

      {/* 🆕 MODAL GIỚI THIỆU GÓI VIP (Chỉ hiện nếu hệ thống đang bật) */}
      {isVipModalOpen && isVipSystemActive && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#18181b] w-full max-w-sm rounded-3xl border border-yellow-500/30 shadow-2xl p-6 relative overflow-hidden animate-in zoom-in-95">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-600 to-yellow-300"></div>
            <button onClick={() => setIsVipModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20}/></button>

            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mb-3 border border-yellow-500/20">
                <Crown size={32} className="text-yellow-500" fill="currentColor" />
              </div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Gói Đẩy Tin VIP ⚡</h3>
              <p className="text-gray-400 text-xs mt-1">Tiếp cận hàng nghìn sinh viên mỗi ngày</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 bg-black/50 p-3 rounded-xl border border-gray-800">
                <Zap className="text-yellow-500" size={20} />
                <div className="text-sm">
                  <p className="font-bold text-white">Top 1 Trang Chủ</p>
                  <p className="text-[10px] text-gray-500">Luôn hiển thị ở vị trí đầu tiên</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-black/50 p-3 rounded-xl border border-gray-800">
                <Star className="text-yellow-500" size={20} />
                <div className="text-sm">
                  <p className="font-bold text-white">Giao Diện Nổi Bật</p>
                  <p className="text-[10px] text-gray-500">Viền vàng, nhãn VIP, sáng rực rỡ</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-center mb-6">
              <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest mb-1">Bảng giá sinh viên</p>
              <p className="text-3xl font-black text-white">10.000đ <span className="text-sm font-medium text-gray-400">/ tin</span></p>
              <p className="text-xs text-gray-500 mt-1">Ghim bài vĩnh viễn cho đến khi bán được</p>
            </div>

            <a href="https://zalo.me/0816677689" target="_blank" className="block w-full bg-yellow-500 text-black font-black py-4 rounded-xl hover:bg-yellow-400 transition text-center uppercase tracking-widest shadow-lg shadow-yellow-500/20">Liên hệ Admin Ghim Bài</a>
          </div>
        </div>
      )}
    </div>
  );
}