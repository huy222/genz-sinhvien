"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Plus, FileText, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import CreateDocModal from '@/components/CreateDocModal';
import DocCard from '@/components/DocCard'; // ✅ Sử dụng Card chuyên nghiệp đã tạo

export default function DocsPage() {
  const router = useRouter();
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
    fetchDocs();
  }, [searchTerm]);

const fetchDocs = async () => {
  setLoading(true);
  // Chỉ lấy dữ liệu bảng documents, không join bảng profiles
  const { data, error } = await supabase
    .from('documents')
    .select('*') 
    .eq('is_approved', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Lỗi:", error.message);
  } else {
    const safeDocs = data?.map(doc => ({
      ...doc,
      profiles: { username: doc.email?.split('@')[0] || "Sinh viên" }
    }));
    setDocs(safeDocs || []);
  }
  setLoading(false);
};

  const handleOpenCreateModal = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-4 md:p-8 pt-28">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-500/20">
              <FileText size={12} /> Kho tài liệu sinh viên
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">
              Library <span className="text-green-500">Center</span>
            </h1>
            <p className="text-gray-500 text-sm font-medium">Tổng hợp đề thi, giáo trình và slide từ cộng đồng Genz.</p>
          </div>

          <button 
            onClick={handleOpenCreateModal} 
            className="group bg-white text-black hover:bg-green-500 px-8 py-4 rounded-2xl font-black transition-all flex items-center gap-3 shadow-xl active:scale-95 uppercase text-xs"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform" /> 
            Chia sẻ tài liệu
          </button>
        </div>

        {/* SEARCH BAR */}
        <div className="relative mb-12 group">
          <div className="absolute inset-0 bg-green-500/5 blur-xl rounded-3xl group-focus-within:bg-green-500/10 transition-all"></div>
          <div className="relative flex items-center">
            <Search className="absolute left-5 text-gray-500 group-focus-within:text-green-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo tên môn học, mã học phần hoặc tên đề thi..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-[#18181b] border border-gray-800 rounded-2xl py-5 pl-14 pr-6 text-white focus:outline-none focus:border-green-500/50 transition-all shadow-2xl placeholder:text-gray-600 font-medium" 
            />
          </div>
        </div>

        {/* DOCS GRID */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="animate-spin text-green-500" size={40} />
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em]">Đang truy xuất dữ liệu...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {docs.map((doc) => (
              <DocCard key={doc.id} doc={doc} /> // ✅ Sử dụng component DocCard chuyên dụng
            ))}
          </div>
        )}
        
        {/* EMPTY STATE */}
        {!loading && docs.length === 0 && (
          <div className="text-center py-32 bg-[#18181b]/30 rounded-3xl border border-dashed border-gray-800">
            <div className="bg-gray-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-600">
                <Search size={32} />
            </div>
            <h3 className="text-gray-400 font-bold uppercase text-sm tracking-widest">Không tìm thấy tài liệu</h3>
            <p className="text-gray-600 text-xs mt-2">Hãy thử tìm kiếm với từ khóa khác hoặc chia sẻ tài liệu đầu tiên.</p>
          </div>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && user && (
        <CreateDocModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={fetchDocs} 
        />
      )}
    </div>
  );
}