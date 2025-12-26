"use client";

import { useEffect, useState } from "react";

import { useAuthStore } from "@/stores/useAuthStore";
import { feedbackService, Feedback, CreateFeedbackData } from "@/services/feedbackService";
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
  MessageSquare, 
  Send, 
  Loader2, 
  AlertCircle,
  Ban,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import { toast } from "sonner";

export default function FeedbackPage() {
  const { user } = useAuthStore();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const isUserPending = user?.status === "pending";
  const isUserRejected = user?.status === "rejected";
  const isUserNotActive = user?.status !== "active";

  // Form state
  const [formData, setFormData] = useState<CreateFeedbackData>({
    type: "suggestion",
    priority: "medium",
    title: "",
    content: "",
  });

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const data = await feedbackService.getFeedbacks();
      setFeedbacks(data.feedbacks);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isUserNotActive) {
      toast.error(isUserPending 
        ? "Tài khoản đang chờ duyệt. Vui lòng chờ ban quản lý phê duyệt."
        : "Tài khoản bị từ chối. Vui lòng liên hệ ban quản lý.");
      return;
    }

    if (!formData.title || !formData.content) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      setSubmitting(true);
      const data = await feedbackService.createFeedback(formData);
      
      // Thêm vào danh sách
      setFeedbacks((prev) => [data.feedback, ...prev]);
      
      // Reset form
      setFormData({
        type: "suggestion",
        priority: "medium",
        title: "",
        content: "",
      });
      
      toast.success("Gửi phản hồi thành công!");
    } catch (error: any) {
      console.error("Error creating feedback:", error);
      toast.error(error.response?.data?.message || "Không thể gửi phản hồi");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statuses: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
      pending: { 
        label: "Chờ xử lý", 
        className: "bg-orange-500/10 text-orange-500",
        icon: <Clock className="h-3 w-3" />
      },
      in_progress: { 
        label: "Đang xử lý", 
        className: "bg-blue-500/10 text-blue-500",
        icon: <Loader2 className="h-3 w-3" />
      },
      resolved: { 
        label: "Đã xử lý", 
        className: "bg-green-500/10 text-green-500",
        icon: <CheckCircle className="h-3 w-3" />
      },
      rejected: { 
        label: "Từ chối", 
        className: "bg-red-500/10 text-red-500",
        icon: <XCircle className="h-3 w-3" />
      },
    };
    return statuses[status] || statuses.pending;
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      complaint: "Khiếu nại",
      suggestion: "Đề xuất",
      maintenance: "Bảo trì",
      other: "Khác",
    };
    return types[type] || type;
  };

  const getPriorityBadge = (priority: string) => {
    const priorities: Record<string, { label: string; className: string }> = {
      low: { label: "Thấp", className: "bg-gray-500/10 text-gray-500" },
      medium: { label: "Trung bình", className: "bg-blue-500/10 text-blue-500" },
      high: { label: "Cao", className: "bg-orange-500/10 text-orange-500" },
      urgent: { label: "Khẩn cấp", className: "bg-red-500/10 text-red-500" },
    };
    return priorities[priority] || priorities.medium;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Phản hồi & Góp ý</h1>
        <p className="text-muted-foreground">
          Gửi ý kiến đóng góp và phản hồi của bạn
        </p>
      </div>

      {/* Notice for inactive users */}
      {isUserNotActive && (
        <Card className="border-orange-500/50 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Ban className="h-5 w-5 text-orange-500" />
              <p className="text-sm text-orange-700 dark:text-orange-400">
                {isUserPending 
                  ? "Tài khoản đang chờ duyệt. Bạn có thể xem phản hồi cũ nhưng không thể gửi mới. Vui lòng chờ ban quản lý phê duyệt."
                  : "Tài khoản bị từ chối. Bạn không thể gửi phản hồi mới. Vui lòng liên hệ ban quản lý."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Feedback Form */}
        <Card className={isUserNotActive? "opacity-60" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Gửi phản hồi mới
            </CardTitle>
            <CardDescription>
              Chúng tôi rất mong nhận được ý kiến từ bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Tiêu đề <span className="text-red-500">*</span></Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Nhập tiêu đề phản hồi..."
                  disabled={isUserNotActive}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="type">Loại phản hồi</Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    disabled={isUserNotActive}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="suggestion">Đề xuất</option>
                    <option value="complaint">Khiếu nại</option>
                    <option value="maintenance">Yêu cầu bảo trì</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Mức độ ưu tiên</Label>
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    disabled={isUserNotActive}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="low">Thấp</option>
                    <option value="medium">Trung bình</option>
                    <option value="high">Cao</option>
                    <option value="urgent">Khẩn cấp</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Nội dung <span className="text-red-500">*</span></Label>
                <textarea
                  id="content"
                  rows={5}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Nhập nội dung phản hồi của bạn..."
                  disabled={isUserNotActive}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-none disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isUserNotActive || submitting}
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {isUserNotActive ? "Chức năng bị khóa" : "Gửi phản hồi"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Previous Feedbacks */}
        <Card>
          <CardHeader>
            <CardTitle>Phản hồi đã gửi</CardTitle>
            <CardDescription>
              Lịch sử các phản hồi của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : feedbacks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Bạn chưa gửi phản hồi nào</p>
              </div>
            ) : (
              feedbacks.map((feedback) => {
                const status = getStatusBadge(feedback.status);
                const priority = getPriorityBadge(feedback.priority);
                
                return (
                  <div key={feedback.feedback_id} className="p-4 rounded-lg border">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-medium">{feedback.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {feedback.content}
                        </p>
                      </div>
                      <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${status.className}`}>
                        {status.icon}
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                      <span className={`px-2 py-0.5 rounded ${priority.className}`}>
                        {priority.label}
                      </span>
                      <span>{getTypeLabel(feedback.type)}</span>
                      <span>•</span>
                      <span>{formatDate(feedback.created_at)}</span>
                      {feedback.comment_count && feedback.comment_count > 0 && (
                        <>
                          <span>•</span>
                          <span>{feedback.comment_count} phản hồi</span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
