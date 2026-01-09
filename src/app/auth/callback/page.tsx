"use client";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Lắng nghe sự kiện đăng nhập thành công
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        // Đăng nhập xong -> Chuyển hướng về trang Chợ
        router.push('/market'); 
        router.refresh(); // Làm mới lại dữ liệu để nhận diện user
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#09090b] text-white">
      <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="font-bold text-lg animate-pulse">Đang đăng nhập...</p>
    </div>
  );
}