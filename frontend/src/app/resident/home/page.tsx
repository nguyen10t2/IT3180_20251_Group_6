"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { notificationService } from "@/services/notificationService";
import { invoiceService } from "@/services/invoiceService";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bell, FileText, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingInvoiceCount, setPendingInvoiceCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const notificationData = await notificationService.getNotifications();
        const unread = notificationData.notifications.filter((n) => !n.read).length;
        setUnreadCount(unread);
        
        const invoiceData = await invoiceService.getInvoices();
        const pending = invoiceData.invoices.filter((i) => i.status === "pending" || i.status === "overdue").length;
        setPendingInvoiceCount(pending);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    {
      title: "Thông báo mới",
      value: unreadCount.toString(),
      description: "Chưa đọc",
      icon: Bell,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Hóa đơn",
      value: pendingInvoiceCount.toString(),
      description: "Chưa thanh toán",
      icon: FileText,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Xin chào, {user?.fullname || "Bạn"}! 👋
        </h1>
        <p className="text-muted-foreground">
          Chào mừng bạn đến với hệ thống quản lý chung cư Kogu Express
        </p>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2">
          {stats.map((stat) => (
            <Card key={stat.title} className="transition-all hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Thao tác nhanh</CardTitle>
            <CardDescription>
              Các chức năng thường sử dụng
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <button 
              onClick={() => router.push("/resident/invoices")}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
            >
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Xem hóa đơn</p>
                <p className="text-sm text-muted-foreground">
                  Xem các khoản phí cần thanh toán
                </p>
              </div>
            </button>
            <button 
              onClick={() => router.push("/resident/notifications")}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
            >
              <Bell className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Xem thông báo</p>
                <p className="text-sm text-muted-foreground">
                  Cập nhật tin tức mới nhất
                </p>
              </div>
            </button>
          </CardContent>
        </Card>

        {/* Recent Activity - placeholder for now */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin hộ gia đình</CardTitle>
            <CardDescription>
              Thông tin căn hộ của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>Truy cập mục "Thông tin" để xem chi tiết hộ gia đình</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}