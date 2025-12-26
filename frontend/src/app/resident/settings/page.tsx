"use client";


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
import { Settings, Moon, Sun, Bell, Shield, Globe } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cài đặt</h1>
        <p className="text-muted-foreground">
          Quản lý các cài đặt ứng dụng của bạn
        </p>
      </div>

      <div className="grid gap-6">
        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5" />
              Giao diện
            </CardTitle>
            <CardDescription>
              Tùy chỉnh giao diện ứng dụng
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Chế độ hiển thị</Label>
              <div className="flex gap-2">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  onClick={() => setTheme("light")}
                  className="flex-1"
                >
                  <Sun className="h-4 w-4 mr-2" />
                  Sáng
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  onClick={() => setTheme("dark")}
                  className="flex-1"
                >
                  <Moon className="h-4 w-4 mr-2" />
                  Tối
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  onClick={() => setTheme("system")}
                  className="flex-1"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Hệ thống
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Thông báo
            </CardTitle>
            <CardDescription>
              Quản lý cài đặt thông báo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Thông báo đẩy</p>
                <p className="text-sm text-muted-foreground">
                  Nhận thông báo về các hoạt động quan trọng
                </p>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email thông báo</p>
                <p className="text-sm text-muted-foreground">
                  Nhận email về hóa đơn và sự kiện
                </p>
              </div>
              <button
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary"
              >
                <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Bảo mật
            </CardTitle>
            <CardDescription>
              Cài đặt bảo mật tài khoản
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <p className="font-medium">Xác thực hai yếu tố</p>
                <p className="text-sm text-muted-foreground">
                  Thêm một lớp bảo mật cho tài khoản của bạn
                </p>
              </div>
              <Button variant="outline">Thiết lập</Button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <p className="font-medium">Phiên đăng nhập</p>
                <p className="text-sm text-muted-foreground">
                  Quản lý các thiết bị đã đăng nhập
                </p>
              </div>
              <Button variant="outline">Xem chi tiết</Button>
            </div>
          </CardContent>
        </Card>

        {/* Language */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Ngôn ngữ
            </CardTitle>
            <CardDescription>
              Cài đặt ngôn ngữ hiển thị
            </CardDescription>
          </CardHeader>
          <CardContent>
            <select className="flex h-10 w-full max-w-xs rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
