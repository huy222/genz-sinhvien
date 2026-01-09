import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ShoppingBag, ArrowLeft, Phone } from 'lucide-react';

export default async function MarketPage() {
  const { data: products } = await supabase.from('products').select('*').order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-6 md:p-12">
      <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition">
        <ArrowLeft size={20} /> Quay lại
      </Link>
      
      <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-500 mb-8">
        Chợ Pass Đồ 🛒
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products?.map((product) => (
          <div key={product.id} className="bg-[#18181b] rounded-2xl overflow-hidden border border-[#27272a] group hover:border-pink-500/50 transition">
            <div className="h-48 bg-gray-800 flex items-center justify-center text-gray-600">
               {/* Thay bằng thẻ <img src={product.image_url} /> nếu có link ảnh */}
               <ShoppingBag size={40} />
            </div>
            <div className="p-4">
              <h3 className="font-bold truncate">{product.name}</h3>
              <p className="text-pink-500 font-bold text-lg">{product.price}</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                <Phone size={14} /> {product.contact}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}