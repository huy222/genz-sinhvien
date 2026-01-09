import { UserCircle } from "lucide-react";

const REVIEWS = [
  { name: "sv_nam1", text: "Trọ hẻm 51 giá rẻ nhưng điện nước ảo lắm 😢", color: "text-red-400" },
  { name: "k48_neu", text: "Thầy Tuấn dạy Triết siêu cuốn, không buồn ngủ tí nào!", color: "text-green-400" },
  { name: "huyen_2k4", text: "Quán cơm tấm bà Ba ngon + rẻ, cứu đói cuối tháng.", color: "text-yellow-400" },
  { name: "thanh_IT", text: "Pass lại giáo trình C++ giá hạt dẻ đây...", color: "text-blue-400" },
  { name: "an_nguyen", text: "Cảnh báo: Né quán trà sữa X ra, thái độ lồi lõm.", color: "text-red-400" },
  { name: "minh_bk", text: "Tìm người ở ghép khu Bách Khoa, sạch sẽ là được.", color: "text-purple-400" },
];

export default function ReviewMarquee() {
  return (
    <div className="relative h-[180px] overflow-hidden mt-4 mask-gradient">
      {/* Lớp phủ mờ để tạo cảm giác trôi vào/trôi ra (nếu muốn xịn hơn) */}
      <div className="absolute top-0 left-0 w-full h-10 bg-gradient-to-b from-[#18181b] to-transparent z-10"></div>
      <div className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-[#18181b] to-transparent z-10"></div>

      {/* Phần nội dung chạy */}
      <div className="chay-chu-comment">
        {/* Render 2 lần danh sách để tạo vòng lặp vô tận không bị khựng */}
        {[...REVIEWS, ...REVIEWS].map((item, index) => (
          <div key={index} className="mb-3 bg-white/5 p-3 rounded-lg border border-white/5 text-sm backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1">
              <UserCircle size={14} className="text-gray-500" />
              <span className={`font-bold text-xs ${item.color}`}>@{item.name}</span>
            </div>
            <p className="text-gray-300 text-xs leading-relaxed">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}