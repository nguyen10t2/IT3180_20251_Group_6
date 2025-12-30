"use client";

import { useEffect, useState } from "react";

import { useAuthStore } from "@/stores/useAuthStore";
import { notificationService, Notification } from "@/services/notificationService";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  CheckCircle, 
  Info, 
  AlertTriangle, 
  CheckCheck, 
  Loader2,
  AlertCircle,
  Pin
} from "lucide-react";
import { toast } from "sonner";

export default function NotificationsPage() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const isUserPending = user?.status === "pending";
  const isUserRejected = user?.status === "rejected";
  const isUserNotActive = user?.status !== "active";
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      setNotifications(data.notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Không thể tải thông báo");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notification_id: string) => {
    try {
      await notificationService.markAsRead(notification_id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.notification_id === notification_id ? { ...n, read: true } : n
        )
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAll(true);
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("Đã đánh dấu tất cả đã đọc");
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Không thể đánh dấu đã đọc");
    } finally {
      setMarkingAll(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case "urgent":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "info":
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return "Vừa xong";
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Thông báo</h1>
          <p className="text-muted-foreground">
            Cập nhật tin tức và thông báo mới nhất
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {unreadCount} chưa đọc
            </span>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={markingAll}
              className="flex items-center gap-2"
            >
              {markingAll ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCheck className="h-4 w-4" />
              )}
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </div>
      </div>

      {/* Notice for inactive users */}
      {isUserNotActive && (
        <Card className="border-orange-500/50 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <p className="text-sm text-orange-700 dark:text-orange-400">
                {isUserPending 
                  ? "Tài khoản đang chờ duyệt. Bạn chỉ nhận được thông báo chung, thông báo hộ gia đình sẽ được hiển thị sau khi được duyệt."
                  : "Tài khoản bị từ chối. Vui lòng liên hệ ban quản lý để biết thêm chi tiết."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Tất cả thông báo</CardTitle>
          <CardDescription>
            Danh sách các thông báo của bạn
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Không có thông báo nào</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.notification_id}
                onClick={() => !notification.read && handleMarkAsRead(notification.notification_id)}
                className={`flex gap-4 p-4 rounded-lg border transition-colors ${
                  notification.read
                    ? "bg-background"
                    : "bg-muted/50 border-primary/20 cursor-pointer hover:bg-muted"
                }`}
              >
                <div className="shrink-0 mt-1">{getIcon(notification.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`font-medium ${
                          !notification.read ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {notification.title}
                      </h4>
                      {notification.is_pinned && (
                        <Pin className="h-3 w-3 text-primary" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {!notification.read && (
                        <span className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">
                    {notification.content}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">
                      {formatTime(notification.published_at)}
                    </p>
                    {!notification.read && (
                      <span className="text-xs text-primary">
                        Nhấn để đánh dấu đã đọc
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
