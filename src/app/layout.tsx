"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import AuthWrapper from "@/components/AuthWrapper";
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // KIỂM TRA ĐÚNG TRANG LOGIN/SIGNUP
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  return (
    <html lang="vi">
      <body className={inter.className}>
        <Header />
        <div className="pt-20">
          {isAuthPage ? (
            <main>{children}</main>
          ) : (
            <AuthWrapper>{children}</AuthWrapper>
          )}
        </div>
      </body>
    </html>
  );
}