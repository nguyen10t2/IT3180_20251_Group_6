"use client";

import { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Bell, 
  Plus,
  Loader2,
  Search,
  Send,
  Trash2,
  X,
  Users,
  Building2
} from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";

interface Notification {
  notification_id: string;
  title: string;
  content: string;
  type: string;
  target_type: string;
  created_at: string;
  read?: boolean;
}

export default function ManagerNotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [households, setHouseholds] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "general",
    target_type: "all",
    target_id: "",
  });

  useEffect(() => {
    fetchNotifications();
    fetchHouseholds();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/api/manager/notifications");
      setNotifications(res.data.notifications || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Không thể tải danh sách thông báo");
    } finally {
      setLoading(false);
    }
  };

  const fetchHouseholds = async () => {
    try {
      const res = await axiosInstance.get("/api/manager/households");
      setHouseholds(res.data.houseHolds || []);
    } catch (error) {
      console.error("Error fetching households:", error);
    }
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.content) {
      toast.error("Vui lòng điền tiêu đề và nội dung");
      return;
    }

    try {
      setSaving(true);
      await axiosInstance.post("/api/manager/notifications", {
        title: formData.title,
        content: formData.content,
        type: formData.type,
      });
      toast.success("Gửi thông báo thành công");
      setShowCreateModal(false);
      resetForm();
      fetchNotifications();
    } catch (error) {
      console.error("Error creating notification:", error);
      toast.error("Không thể gửi thông báo");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (notificationId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa thông báo này?")) return;

    try {
      await axiosInstance.delete(`/api/manager/notifications/${notificationId}`);
      toast.success("Xóa thông báo thành công");
      fetchNotifications();
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Không thể xóa thông báo");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      type: "general",
      target_type: "all",
      target_id: "",
    });
  };

  const closeModal = () => {
    setShowCreateModal(false);
    resetForm();
  };

  const getTypeBadge = (type: string) => {
    const types: Record<string, { label: string; className: string }> = {
      general: { label: "Thông báo chung", className: "bg-blue-500/10 text-blue-600" },
      maintenance: { label: "Bảo trì", className: "bg-orange-500/10 text-orange-600" },
      payment: { label: "Thanh toán", className: "bg-green-500/10 text-green-600" },
      emergency: { label: "Khẩn cấp", className: "bg-red-500/10 text-red-600" },
      event: { label: "Sự kiện", className: "bg-cyan-500/10 text-cyan-600" },
    };
    const typeInfo = types[type] || types.general;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${typeInfo.className}`}>
        {typeInfo.label}
      </span>
    );
  };

  const getTargetBadge = (targetType: string) => {
    const targets: Record<string, { label: string; icon: any }> = {
      all: { label: "Tất cả", icon: Users },
      household: { label: "Hộ gia đình", icon: Building2 },
    };
    const targetInfo = targets[targetType] || targets.all;
    const Icon = targetInfo.icon;
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Icon className="h-3 w-3" />
        {targetInfo.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredNotifications = notifications.filter(n =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Quản lý thông báo</h1>
            <p className="text-muted-foreground">
              Gửi và quản lý thông báo tới cư dân
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Gửi thông báo
          </Button>
        </div>

        {/* Notifications List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Danh sách thông báo
                </CardTitle>
                <CardDescription>
                  Các thông báo đã gửi trong hệ thống
                </CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Chưa có thông báo nào</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.notification_id}
                    className="p-4 rounded-lg border hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{notification.title}</h4>
                          {getTypeBadge(notification.type)}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {notification.content}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(notification.notification_id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                      {getTargetBadge(notification.target_type)}
                      <span className="text-xs text-muted-foreground">
                        {formatDate(notification.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal - Inline để tránh re-render */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Gửi thông báo mới</h3>
              <Button variant="ghost" size="icon" onClick={closeModal}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tiêu đề <span className="text-red-500">*</span></Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Tiêu đề thông báo"
                />
              </div>

              <div className="space-y-2">
                <Label>Nội dung <span className="text-red-500">*</span></Label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Nội dung thông báo..."
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <div className="space-y-2">
                <Label>Loại thông báo</Label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="general">Thông báo chung</option>
                  <option value="maintenance">Bảo trì</option>
                  <option value="payment">Thanh toán</option>
                  <option value="emergency">Khẩn cấp</option>
                  <option value="event">Sự kiện</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={closeModal}>
                Hủy
              </Button>
              <Button 
                onClick={handleCreate}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Gửi thông báo
              </Button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
