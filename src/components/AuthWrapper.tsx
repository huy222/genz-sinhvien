"use client";
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  // Danh sách trang cho phép xem tự do
  const publicPages = ['/', '/market', '/jobs', '/docs', '/login', '/signup'];
  const isPublic = publicPages.includes(pathname);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user && !isPublic) {
        // Nếu không có user và trang này không công khai -> ĐÁ ĐI LUÔN
        router.replace('/login'); 
      } else {
        setAuthenticated(true);
        setLoading(false);
      }
    };
    checkUser();
  }, [pathname, isPublic, router]);

  // Nếu là trang công khai, cho hiện luôn không cần đợi check user lâu
  if (isPublic) return <>{children}</>;

  // Nếu đang check user ở trang riêng tư, hiện màn hình trống (ẩn hoàn toàn thông báo cũ)
  if (loading || !authenticated) {
    return <div className="min-h-screen bg-black" />; 
  }

  return <>{children}</>;
}