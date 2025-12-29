"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch"; // Nếu chưa có Switch shadcn, mình dùng custom toggle bên dưới
import {
  Settings,
  Moon,
  Sun,
  Bell,
  Shield,
  Globe,
  Smartphone,
  Check,
  ChevronRight,
  Monitor
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
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

export default function SettingsPage() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [notifications, setNotifications] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [language, setLanguage] = useState("vi");

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 max-w-4xl mx-auto pb-10"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants} className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent inline-block">
          Cài đặt & Tùy chỉnh
        </h1>
        <p className="text-muted-foreground text-lg">
          Cá nhân hóa trải nghiệm Kogu Express của riêng bạn.
        </p>
      </motion.div>

      <div className="grid gap-8">
        {/* 1. GIAO DIỆN (APPEARANCE) */}
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden border-slate-200/60 dark:border-slate-800/60 shadow-lg shadow-slate-200/40 dark:shadow-slate-900/20 group hover:border-primary/50 transition-colors duration-300">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-yellow-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg dark:bg-orange-900/30">
                  <Sun className="h-6 w-6" />
                </div>
                Giao diện hiển thị
              </CardTitle>
              <CardDescription>
                Chọn giao diện sáng, tối hoặc đồng bộ với hệ thống của bạn.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <ThemeOption
                  active={theme === "light"}
                  onClick={() => setTheme("light")}
                  icon={Sun}
                  label="Sáng"
                />
                <ThemeOption
                  active={theme === "dark"}
                  onClick={() => setTheme("dark")}
                  icon={Moon}
                  label="Tối"
                />
                <ThemeOption
                  active={theme === "system"}
                  onClick={() => setTheme("system")}
                  icon={Monitor}
                  label="Hệ thống"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 2. THÔNG BÁO (NOTIFICATIONS) */}
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden border-slate-200/60 dark:border-slate-800/60 shadow-lg shadow-slate-200/40 dark:shadow-slate-900/20 group hover:border-primary/50 transition-colors duration-300">
             <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                 <div className="p-2 bg-blue-100 text-blue-600 rounded-lg dark:bg-blue-900/30">
                  <Bell className="h-6 w-6" />
                </div>
                Thông báo
              </CardTitle>
              <CardDescription>
                Kiểm soát cách bạn nhận thông tin từ ban quản lý.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ToggleItem
                title="Thông báo đẩy (Push Notification)"
                description="Nhận thông báo tức thì trên thiết bị này về các sự kiện quan trọng."
                checked={notifications}
                onChange={setNotifications}
              />
              <Separator className="bg-slate-100 dark:bg-slate-800"/>
              <ToggleItem
                title="Email thông báo"
                description="Nhận email tổng hợp hóa đơn và tin tức hàng tuần."
                checked={emailNotif}
                onChange={setEmailNotif}
              />
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
            {/* 3. BẢO MẬT (SECURITY) */}
            <motion.div variants={itemVariants}>
            <Card className="h-full border-slate-200/60 dark:border-slate-800/60 shadow-lg shadow-slate-200/40 dark:shadow-slate-900/20 group hover:border-primary/50 transition-colors duration-300">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-green-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg dark:bg-emerald-900/30">
                        <Shield className="h-6 w-6" />
                    </div>
                    Bảo mật
                </CardTitle>
                <CardDescription>Bảo vệ tài khoản của bạn.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SecurityItem 
                        title="Xác thực 2 yếu tố (2FA)" 
                        desc="Chưa kích hoạt" 
                        actionLabel="Thiết lập" 
                        icon={Smartphone}
                    />
                     <SecurityItem 
                        title="Đổi mật khẩu" 
                        desc="Cập nhật 3 tháng trước" 
                        actionLabel="Đổi" 
                        icon={Settings} // Placeholder icon
                    />
                </CardContent>
            </Card>
            </motion.div>

            {/* 4. NGÔN NGỮ (LANGUAGE) */}
            <motion.div variants={itemVariants}>
            <Card className="h-full border-slate-200/60 dark:border-slate-800/60 shadow-lg shadow-slate-200/40 dark:shadow-slate-900/20 group hover:border-primary/50 transition-colors duration-300">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-400 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                     <div className="p-2 bg-purple-100 text-purple-600 rounded-lg dark:bg-purple-900/30">
                        <Globe className="h-6 w-6" />
                    </div>
                    Ngôn ngữ & Vùng
                </CardTitle>
                <CardDescription>Tùy chỉnh ngôn ngữ hiển thị.</CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="space-y-3">
                       <LanguageOption 
                            label="Tiếng Việt (Vietnamese)" 
                            active={language === 'vi'} 
                            onClick={() => setLanguage('vi')}
                            flag="🇻🇳"
                       />
                       <LanguageOption 
                            label="English (US)" 
                            active={language === 'en'} 
                            onClick={() => setLanguage('en')}
                            flag="🇺🇸"
                       />
                   </div>
                </CardContent>
            </Card>
            </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// --- SUB COMPONENTS ĐỂ CODE GỌN HƠN ---

// 1. Theme Selection Button
function ThemeOption({ active, onClick, icon: Icon, label }: any) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "relative flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-200",
                active 
                    ? "border-primary bg-primary/5 text-primary" 
                    : "border-transparent bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-muted-foreground hover:text-foreground"
            )}
        >
            {active && (
                <div className="absolute top-2 right-2 text-primary">
                    <Check className="w-4 h-4" />
                </div>
            )}
            <Icon className={cn("w-6 h-6", active && "fill-current")} />
            <span className="font-medium text-sm">{label}</span>
        </button>
    )
}

// 2. Custom Toggle Switch Item
function ToggleItem({ title, description, checked, onChange }: any) {
    return (
        <div className="flex items-center justify-between group/item">
            <div className="space-y-1 pr-4">
                <p className="font-medium text-base group-hover/item:text-primary transition-colors">{title}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <button
                onClick={() => onChange(!checked)}
                className={cn(
                    "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                    checked ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"
                )}
            >
                <span className="sr-only">Use setting</span>
                <span
                    aria-hidden="true"
                    className={cn(
                        "pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                        checked ? "translate-x-5" : "translate-x-0"
                    )}
                />
            </button>
        </div>
    )
}

// 3. Security List Item
function SecurityItem({ title, desc, actionLabel, icon: Icon }: any) {
    return (
        <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 transition-all hover:shadow-sm">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-200 dark:bg-slate-800 rounded-full text-slate-500">
                    <Icon className="w-4 h-4" />
                </div>
                <div>
                    <p className="font-medium text-sm">{title}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
            </div>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10 h-8 text-xs font-semibold">
                {actionLabel}
            </Button>
        </div>
    )
}

// 4. Language Option Item
function LanguageOption({ label, active, onClick, flag }: any) {
    return (
        <button 
            onClick={onClick}
            className={cn(
                "w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-200",
                active 
                    ? "border-primary/50 bg-primary/5 shadow-[0_0_0_1px_rgba(var(--primary),0.5)]" 
                    : "border-transparent hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
        >
            <div className="flex items-center gap-3">
                <span className="text-xl leading-none">{flag}</span>
                <span className={cn("font-medium", active ? "text-primary" : "text-foreground")}>{label}</span>
            </div>
            {active && <Check className="w-4 h-4 text-primary" />}
        </button>
    )
}