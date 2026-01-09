"use client";
import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Loader2, UploadCloud, DollarSign, Tag, Phone } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateProductModal({ isOpen, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State form mặc định
  const [formData, setFormData] = useState({ 
    title: '', 
    price: '', 
    description: '', 
    contact: '', 
    category: 'khac' // Mặc định là Khác
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) return alert("File quá lớn! Vui lòng chọn ảnh dưới 5MB.");
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.price || !formData.contact) return alert("Vui lòng điền đủ thông tin!");
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Vui lòng đăng nhập lại.");

      // 1. Upload ảnh (nếu có)
      let imageUrl = null;
      if (imageFile) {
        const fileName = `${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
        const { error: uploadError } = await supabase.storage.from('products').upload(fileName, imageFile);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('products').getPublicUrl(fileName);
        imageUrl = data.publicUrl;
      }

      // 2. Lưu vào Database
      const { error: insertError } = await supabase.from('products').insert({
        title: formData.title,
        price: parseInt(formData.price),
        description: formData.description,
        contact: formData.contact,
        category: formData.category, // Lưu đúng mã danh mục
        image_url: imageUrl,
        user_id: user.id,
        is_approved: false // Chờ duyệt
      });

      if (insertError) throw insertError;

      alert("✅ Đăng bài thành công! Vui lòng chờ Admin duyệt bài nhé.");
      onSuccess();
      handleClose();

    } catch (error: any) {
      alert("Lỗi: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ title: '', price: '', description: '', contact: '', category: 'khac' });
    setImageFile(null);
    setPreviewUrl(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#18181b] w-full max-w-lg rounded-3xl border border-gray-800 p-6 shadow-2xl relative animate-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button onClick={handleClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition bg-black/50 rounded-full p-1"><X size={20} /></button>
        
        <h2 className="text-2xl font-black text-white mb-6 uppercase italic tracking-tighter flex items-center gap-2">
          <DollarSign className="text-pink-500" /> Đăng Bán Đồ Cũ
        </h2>
        
        <div className="space-y-5">
          {/* Upload Ảnh */}
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-2">Hình ảnh sản phẩm</label>
            {!previewUrl ? (
              <label className="w-full h-32 border-2 border-dashed border-gray-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-pink-500 hover:bg-pink-500/5 transition group">
                <UploadCloud size={32} className="text-gray-500 group-hover:text-pink-500 mb-2 transition" />
                <span className="text-xs text-gray-400 font-bold">Tải ảnh lên</span>
                <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageSelect} />
              </label>
            ) : (
              <div className="relative w-full h-48 rounded-2xl overflow-hidden group">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                <button onClick={() => { setImageFile(null); setPreviewUrl(null); }} className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full"><X size={16} /></button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Tên món đồ *</label>
                <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white focus:border-pink-500 outline-none text-sm placeholder:text-gray-600" placeholder="VD: Giáo trình C++"/>
            </div>
            <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Giá bán (VNĐ) *</label>
                <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white focus:border-pink-500 outline-none text-sm placeholder:text-gray-600" placeholder="VD: 50000"/>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             {/* 👇 PHẦN QUAN TRỌNG: DANH MỤC ĐẦY ĐỦ */}
             <div>
               <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1 flex items-center gap-1"><Tag size={10}/> Danh mục</label>
               <select 
                 value={formData.category} 
                 onChange={e => setFormData({...formData, category: e.target.value})} 
                 className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white focus:border-pink-500 outline-none text-sm appearance-none cursor-pointer"
               >
                 <option value="khac">📦 Khác</option>
                 <option value="sach">📚 Sách/Giáo trình</option>
                 <option value="thoi_trang">👕 Thời trang/Phụ kiện</option>
                 <option value="do_dien_tu">💻 Đồ điện tử</option>
                 <option value="xe_co">🛵 Xe cộ/Phương tiện</option>
                 <option value="gia_dung">🏠 Đồ gia dụng/Nội thất</option>
                 <option value="my_pham">💄 Mỹ phẩm/Làm đẹp</option>
                 <option value="van_phong_pham">✏️ Văn phòng phẩm</option>
               </select>
             </div>
             
             <div>
                 <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1 flex items-center gap-1"><Phone size={10}/> SĐT / Zalo *</label>
                 <input value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white focus:border-pink-500 outline-none text-sm placeholder:text-gray-600" placeholder="09xxxx"/>
             </div>
          </div>

          <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Mô tả tình trạng</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white focus:border-pink-500 outline-none text-sm h-24 resize-none placeholder:text-gray-600" placeholder="Mới 99%, còn bảo hành, pass nhanh..."/>
          </div>

          <button onClick={handleSubmit} disabled={loading} className="w-full bg-white text-black font-black py-4 rounded-xl hover:bg-gray-200 transition uppercase tracking-widest flex justify-center items-center gap-2 shadow-lg shadow-white/10 active:scale-95">
            {loading ? <Loader2 size={20} className="animate-spin text-pink-600"/> : "Đăng Bán Ngay"}
          </button>
        </div>
      </div>
    </div>
  );
}