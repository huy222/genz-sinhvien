"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import AuthWrapper from "@/components/AuthWrapper";
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ["latin"] });

// Cấu hình Metadata (SEO)
const metadata = {
  title: "GenZ Sinh Viên | Việc Làm, Đồ Cũ & Tài Liệu",
  description: "Nền tảng kết nối sinh viên: Tìm việc làm part-time uy tín, săn đồ cũ giá rẻ và kho tài liệu học tập miễn phí.",
  openGraph: {
    title: "GenZ Sinh Viên - Cộng Đồng Tin Cậy cho Sinh Viên",
    description: "Tìm việc làm - Mua đồ cũ - Tải tài liệu. Tất cả trong một!",
    url: "https://your-domain.vercel.app", // Thay bằng domain của bạn
    siteName: "GenZ Sinh Viên",
    images: [
      {
        url: "/og-image.jpg", // File này bạn để trong thư mục public
        width: 1200,
        height: 630,
        alt: "GenZ Sinh Viên Banner",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // KIỂM TRA ĐÚNG TRANG LOGIN/SIGNUP
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  return (
    <html lang="vi">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        {/* Open Graph Tags */}
        <meta property="og:title" content={metadata.openGraph.title} />
        <meta property="og:description" content={metadata.openGraph.description} />
        <meta property="og:image" content={metadata.openGraph.images[0].url} />
        <meta property="og:url" content={metadata.openGraph.url} />
        <meta property="og:type" content="website" />
      </head>
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