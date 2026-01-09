"use client";
import { usePathname } from 'next/navigation';
import AuthWrapper from "@/components/AuthWrapper";
import Header from "@/components/Header";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // KIỂM TRA ĐÚNG TRANG LOGIN/SIGNUP ĐỂ ẨN/HIỆN WRAPPER
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  return (
    <>
      <Header />
      <div className="pt-20">
        {isAuthPage ? (
          <main>{children}</main>
        ) : (
          <AuthWrapper>{children}</AuthWrapper>
        )}
      </div>
    </>
  );
}