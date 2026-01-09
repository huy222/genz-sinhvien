import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

// Cấu hình Metadata chuẩn Server-side (Giúp Facebook/Zalo đọc được ảnh)
export const metadata: Metadata = {
  title: "GenZ Sinh Viên | Việc Làm, Đồ Cũ & Tài Liệu",
  description: "Nền tảng kết nối sinh viên: Tìm việc làm part-time uy tín, săn đồ cũ giá rẻ và tài liệu học tập.",
  metadataBase: new URL('https://www.genzsinhvien.io.vn/'), // Thay bằng tên miền bạn vừa mua
  openGraph: {
    title: "GenZ Sinh Viên - Cộng Đồng Tin Cậy cho Sinh Viên",
    description: "Tìm việc làm - Mua đồ cũ - Tải tài liệu. Tất cả trong một!",
    url: "https://www.genzsinhvien.io.vn/", // Thay bằng tên miền bạn vừa mua
    siteName: "GenZ Sinh Viên",
    images: [
      {
        url: "/og-image.jpg", // Tự động kết hợp với metadataBase ở trên
        width: 1200,
        height: 630,
        alt: "GenZ Sinh Viên Banner",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GenZ Sinh Viên",
    description: "Nền tảng dành riêng cho sinh viên Việt Nam",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        {/* ClientLayout lo phần Header và Auth logic */}
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}