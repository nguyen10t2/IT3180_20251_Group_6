import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, Users, Wallet } from "lucide-react";

export default function DashboardPage() {
  // Định nghĩa style chung cho các thẻ để code gọn hơn
  const cardHoverStyle = "shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-blue-300 cursor-pointer bg-white";

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight text-slate-800">Tổng quan thu phí</h2>
      
      <div className="grid gap-4 md:grid-cols-3">
        {/* Card 1: Tổng thu */}
        <Card className={cardHoverStyle}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Tổng thu tháng 12</CardTitle>
            <div className="p-2 bg-yellow-100 rounded-full">
                <Receipt className="h-5 w-5 text-yellow-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">145.231.000 đ</div>
            <p className="text-xs text-green-600 font-medium mt-1">+20.1% so với tháng trước</p>
          </CardContent>
        </Card>

        {/* Card 2: Chưa đóng phí */}
        <Card className={cardHoverStyle}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Cư dân chưa đóng phí</CardTitle>
            <div className="p-2 bg-red-100 rounded-full">
                <Users className="h-5 w-5 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">12 Hộ</div>
            <p className="text-xs text-slate-400 mt-1">Cần gửi thông báo nhắc nhở</p>
          </CardContent>
        </Card>

        {/* Card 3: Đã đóng phí */}
        <Card className={cardHoverStyle}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Cư dân đã đóng phí</CardTitle>
            <div className="p-2 bg-green-100 rounded-full">
                <Users className="h-5 w-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">148 Hộ</div>
            <p className="text-xs text-slate-400 mt-1">Đạt tỷ lệ 92.5%</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}