import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

// Cấu hình Metadata chuẩn Server-side (Giúp Facebook/Zalo đọc được ảnh)
export const metadata: Metadata = {
  title: "GenZ Sinh Viên | Việc Làm, Đồ Cũ & Tài Liệu",
  description: "Nền tảng kết nối sinh viên: Tìm việc làm part-time uy tín, săn đồ cũ giá rẻ.",
  metadataBase: new URL('https://www.genzsinhvien.io.vn'), // Thay bằng tên miền thật
  openGraph: {
    title: "GenZ Sinh Viên - Cộng Đồng Tin Cậy cho Sinh Viên",
    description: "Tìm việc làm - Mua đồ cũ - Tải tài liệu. Tất cả trong một!",
    url: "https://www.genzsinhvien.io.vn",
    siteName: "GenZ Sinh Viên",
    images: [
      {
        url: "/og-image.JPG",
        width: 1200,    // 👈 Bắt buộc có để fix lỗi bạn vừa gặp
        height: 630,   // 👈 Bắt buộc có để fix lỗi bạn vừa gặp
        alt: "GenZ Sinh Viên Banner",
        type: "image/jpeg", // Hoặc image/png tùy định dạng ảnh của bạn
      },
    ],
    locale: "vi_VN",
    type: "website",
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