"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { notificationService } from "@/services/notificationService";
import { invoiceService } from "@/services/invoiceService";
import { useRouter } from "next/navigation";
import { 
  Bell, 
  FileText, 
  CreditCard, 
  Info, 
  ArrowRight, 
  Sparkles,
  CalendarDays
} from "lucide-react";
import { motion } from "framer-motion"; // Thư viện animation
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Hiệu ứng xuất hiện lần lượt
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 },
  },
};

export default function HomePage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingInvoiceCount, setPendingInvoiceCount] = useState(0);
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    // Set ngày hiện tại
    const date = new Date();
    setCurrentDate(date.toLocaleDateString("vi-VN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));

    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch data song song để tối ưu tốc độ
        const [notificationData, invoiceData] = await Promise.all([
            notificationService.getNotifications(),
            invoiceService.getInvoices()
        ]);

        const unread = notificationData.notifications.filter((n) => !n.read).length;
        setUnreadCount(unread);

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

  // Cấu hình hiển thị Stats
  const stats = [
    {
      title: "Thông báo mới",
      value: unreadCount,
      label: "tin chưa đọc",
      icon: Bell,
      color: "text-blue-600",
      bgGradient: "from-blue-500/20 to-cyan-500/20",
      border: "border-blue-200 dark:border-blue-900",
      shadow: "shadow-blue-500/10",
      onClick: () => router.push("/resident/notifications"),
    },
    {
      title: "Hóa đơn cần đóng",
      value: pendingInvoiceCount,
      label: "hóa đơn chờ xử lý",
      icon: FileText,
      color: "text-orange-600",
      bgGradient: "from-orange-500/20 to-red-500/20",
      border: "border-orange-200 dark:border-orange-900",
      shadow: "shadow-orange-500/10",
      onClick: () => router.push("/resident/invoices"),
    },
  ];

  // Component Skeleton khi đang tải
  if (loading) {
    return (
      <div className="space-y-8 p-2">
        <div className="space-y-3">
            <div className="h-8 w-1/3 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-1/4 bg-slate-100 rounded animate-pulse" />
        </div>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <div className="h-32 bg-slate-100 rounded-xl animate-pulse" />
            <div className="h-32 bg-slate-100 rounded-xl animate-pulse" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
             <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />
             <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-8 pb-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* 1. HERO SECTION: Lời chào & Ngày tháng */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                <CalendarDays className="w-4 h-4" />
                <span className="capitalize">{currentDate}</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">
                Xin chào, <span className="bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent">{user?.fullname?.split(" ").pop() || "Bạn"}</span>! 👋
            </h1>
            <p className="text-muted-foreground text-lg">
                Chúc bạn một ngày tốt lành tại <span className="font-semibold text-foreground">Kogu Express</span>.
            </p>
        </div>
      </motion.div>

      {/* 2. STATS GRID: Hiển thị số liệu nổi bật */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {stats.map((stat) => (
          <motion.div
            key={stat.title}
            variants={itemVariants}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
            onClick={stat.onClick}
            className="cursor-pointer"
          >
            <Card className={cn(
                "relative overflow-hidden border transition-all duration-300 hover:shadow-xl",
                stat.border, stat.shadow
            )}>
              {/* Background Gradient mờ ảo */}
              <div className={cn("absolute inset-0 bg-gradient-to-br opacity-30", stat.bgGradient)} />
              
              <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  {stat.title}
                </CardTitle>
                <div className={cn("p-2 rounded-full bg-white/80 dark:bg-slate-950/50 backdrop-blur-sm shadow-sm", stat.color)}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="flex items-baseline gap-2">
                    <div className="text-4xl font-bold tracking-tight text-foreground">
                        {stat.value}
                    </div>
                    <span className="text-sm text-muted-foreground font-medium">{stat.label}</span>
                </div>
                {stat.value > 0 && (
                    <div className="mt-3 inline-flex items-center text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-md">
                        <Sparkles className="w-3 h-3 mr-1" /> Cần xử lý ngay
                    </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* 3. DASHBOARD WIDGETS: Thao tác nhanh & Thông tin */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Quick Actions Widget */}
        <motion.div variants={itemVariants} className="md:col-span-2">
            <Card className="h-full border-slate-200/60 dark:border-slate-800/60 shadow-lg shadow-slate-200/40 dark:shadow-slate-900/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-yellow-500" /> Thao tác nhanh
                    </CardTitle>
                    <CardDescription>Truy cập nhanh các chức năng thường dùng</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <QuickActionButton 
                        icon={FileText} 
                        title="Hóa đơn & Thanh toán" 
                        desc="Xem và thanh toán phí dịch vụ"
                        color="text-emerald-600"
                        bgColor="bg-emerald-500/10"
                        onClick={() => router.push("/resident/invoices")}
                    />
                    <QuickActionButton 
                        icon={Bell} 
                        title="Bảng tin cư dân" 
                        desc="Cập nhật thông báo mới nhất"
                        color="text-blue-600"
                        bgColor="bg-blue-500/10"
                        onClick={() => router.push("/resident/notifications")}
                    />
                    {/* Placeholder buttons for future features */}
                    <QuickActionButton 
                        icon={CreditCard} 
                        title="Lịch sử giao dịch" 
                        desc="Xem lại lịch sử thanh toán"
                        color="text-purple-600"
                        bgColor="bg-purple-500/10"
                        onClick={() => {}} // Add route later
                    />
                     <QuickActionButton 
                        icon={Info} 
                        title="Phản ánh & Góp ý" 
                        desc="Gửi ý kiến đến ban quản lý"
                        color="text-rose-600"
                        bgColor="bg-rose-500/10"
                        onClick={() => router.push("/resident/feedback")} // Assuming route exists or placeholder
                    />
                </CardContent>
            </Card>
        </motion.div>

        {/* Household Info Widget (Mini) */}
        <motion.div variants={itemVariants} className="md:col-span-1">
            <Card className="h-full bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 border-slate-200 dark:border-slate-800">
                <CardHeader>
                    <CardTitle className="text-lg">Căn hộ của bạn</CardTitle>
                    <CardDescription>Thông tin tóm tắt</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center text-center space-y-4 py-6">
                    <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-inner">
                        <Info className="w-8 h-8 text-slate-400" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground mb-1">Bạn đang ở tại</p>
                        <p className="font-bold text-xl text-foreground">Kogu Express</p>
                    </div>
                    <button 
                        onClick={() => router.push("/resident/account")}
                        className="flex items-center gap-2 text-sm font-medium text-primary hover:underline mt-2 group"
                    >
                        Xem chi tiết căn hộ <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                </CardContent>
            </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Component phụ cho nút bấm nhanh để code gọn hơn
function QuickActionButton({ icon: Icon, title, desc, color, bgColor, onClick }: any) {
    return (
        <button 
            onClick={onClick}
            className="flex items-start gap-4 p-4 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 transition-all duration-200 group text-left shadow-sm hover:shadow-md"
        >
            <div className={cn("p-3 rounded-lg transition-colors group-hover:scale-110 duration-200", bgColor)}>
                <Icon className={cn("h-6 w-6", color)} />
            </div>
            <div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {desc}
                </p>
            </div>
        </button>
    )
}