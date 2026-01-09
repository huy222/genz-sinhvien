"use client"; // Bắt buộc dòng này để dùng form

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function NewReviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const data = {
      author_name: formData.get('name'),
      category: formData.get('category'),
      content: formData.get('content'),
      rating: parseInt(formData.get('rating') as string),
    };

    // Gửi dữ liệu lên Supabase
    const { error } = await supabase.from('reviews').insert([data]);

    if (error) {
      alert('Lỗi: ' + error.message);
    } else {
      alert('Đã đăng review thành công! 🎉');
      router.push('/review'); // Quay về trang danh sách
      router.refresh(); // Làm mới dữ liệu
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-genz-bg text-white flex items-center justify-center p-6">
      <div className="bg-genz-card p-8 rounded-3xl w-full max-w-lg border border-genz-border">
        <h1 className="text-3xl font-black mb-6 text-center text-neon-purple">Viết Review Mới ✍️</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2">Bạn là ai? (Ẩn danh cũng được)</label>
            <input name="name" type="text" placeholder="Ví dụ: Sinh viên năm nhất..." required 
              className="w-full bg-black/50 border border-gray-700 rounded-xl p-3 focus:border-neon-purple outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">Chủ đề</label>
              <select name="category" className="w-full bg-black/50 border border-gray-700 rounded-xl p-3 outline-none">
                <option value="tro">Nhà trọ</option>
                <option value="quan_an">Quán ăn</option>
                <option value="mon_hoc">Môn học/Giảng viên</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Đánh giá (Sao)</label>
              <select name="rating" className="w-full bg-black/50 border border-gray-700 rounded-xl p-3 outline-none">
                <option value="5">⭐⭐⭐⭐⭐ (5 sao)</option>
                <option value="4">⭐⭐⭐⭐ (4 sao)</option>
                <option value="3">⭐⭐⭐ (3 sao)</option>
                <option value="1">⭐ (1 sao - Né gấp)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Nội dung review</label>
            <textarea name="content" rows={4} placeholder="Kể chi tiết trải nghiệm của bạn..." required
              className="w-full bg-black/50 border border-gray-700 rounded-xl p-3 focus:border-neon-purple outline-none"></textarea>
          </div>

          <button disabled={loading} type="submit" 
            className="w-full bg-neon-purple text-white font-bold py-3 rounded-xl hover:opacity-90 transition">
            {loading ? 'Đang gửi...' : 'Đăng bài ngay 🚀'}
          </button>
        </form>
      </div>
    </div>
  );
}