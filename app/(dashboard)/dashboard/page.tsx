import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, Users, Wallet } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight text-slate-800">Tổng quan thu phí</h2>
      
      <div className="grid gap-4 md:grid-cols-3">
        {/* Card 1 */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng thu tháng 12</CardTitle>
            <Receipt className="h-4 w-4 text-pink-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">145.231.000 đ</div>
            <p className="text-xs text-muted-foreground">+20.1% so với tháng trước</p>
          </CardContent>
        </Card>

        {/* Card 2 */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cư dân chưa đóng phí</CardTitle>
            <Users className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">12 Hộ</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}