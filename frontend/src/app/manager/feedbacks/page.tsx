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
import { 
  MessageSquare, 
  Loader2,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  Building2,
  User
} from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";

interface Feedback {
  feedback_id: string;
  user_id: string;
  fullname?: string;
  room_number?: string;
  title: string;
  content: string;
  category: string;
  status: string;
  response?: string;
  created_at: string;
  responded_at?: string;
}

export default function ManagerFeedbacksPage() {
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "in_progress" | "resolved">("all");
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/api/manager/feedbacks");
      setFeedbacks(res.data.feedbacks || []);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      toast.error("Không thể tải danh sách phản hồi");
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (feedbackId: string) => {
    if (!responseText.trim()) {
      toast.error("Vui lòng nhập nội dung phản hồi");
      return;
    }

    try {
      await axiosInstance.patch(`/api/manager/feedbacks/${feedbackId}/respond`, {
        response: responseText,
      });
      toast.success("Đã gửi phản hồi thành công");
      setRespondingId(null);
      setResponseText("");
      fetchFeedbacks();
    } catch (error) {
      console.error("Error responding to feedback:", error);
      toast.error("Không thể gửi phản hồi");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600">
            <CheckCircle className="h-3 w-3" />
            Đã xử lý
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600">
            <Clock className="h-3 w-3" />
            Đang xử lý
          </span>
        );
      case "pending":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-600">
            <AlertCircle className="h-3 w-3" />
            Chờ xử lý
          </span>
        );
    }
  };

  const getCategoryBadge = (category: string) => {
    const categories: Record<string, { label: string; className: string }> = {
      complaint: { label: "Khiếu nại", className: "bg-red-500/10 text-red-600" },
      suggestion: { label: "Góp ý", className: "bg-blue-500/10 text-blue-600" },
      maintenance: { label: "Bảo trì", className: "bg-orange-500/10 text-orange-600" },
      inquiry: { label: "Hỏi đáp", className: "bg-cyan-500/10 text-cyan-600" },
      other: { label: "Khác", className: "bg-gray-500/10 text-gray-600" },
    };
    const catInfo = categories[category] || categories.other;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${catInfo.className}`}>
        {catInfo.label}
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

  const filteredFeedbacks = feedbacks.filter(fb => {
    const matchesSearch = 
      fb.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fb.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fb.fullname?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === "all") return matchesSearch;
    return matchesSearch && fb.status === filter;
  });

  return (

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý phản hồi</h1>
          <p className="text-muted-foreground">
            Xem và xử lý phản hồi từ cư dân
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card 
            className={`cursor-pointer transition-all ${filter === "all" ? "ring-2 ring-primary" : ""}`}
            onClick={() => setFilter("all")}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tổng cộng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{feedbacks.length}</div>
            </CardContent>
          </Card>
          <Card 
            className={`cursor-pointer transition-all ${filter === "pending" ? "ring-2 ring-orange-500" : ""}`}
            onClick={() => setFilter("pending")}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Chờ xử lý
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">
                {feedbacks.filter(f => f.status === "pending").length}
              </div>
            </CardContent>
          </Card>
          <Card 
            className={`cursor-pointer transition-all ${filter === "in_progress" ? "ring-2 ring-blue-500" : ""}`}
            onClick={() => setFilter("in_progress")}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Đang xử lý
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">
                {feedbacks.filter(f => f.status === "in_progress").length}
              </div>
            </CardContent>
          </Card>
          <Card 
            className={`cursor-pointer transition-all ${filter === "resolved" ? "ring-2 ring-green-500" : ""}`}
            onClick={() => setFilter("resolved")}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Đã xử lý
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {feedbacks.filter(f => f.status === "resolved").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feedbacks List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Danh sách phản hồi
                </CardTitle>
                <CardDescription>
                  Phản hồi và góp ý từ cư dân
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
            ) : filteredFeedbacks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Không có phản hồi nào</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFeedbacks.map((feedback) => (
                  <div
                    key={feedback.feedback_id}
                    className="p-4 rounded-lg border"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{feedback.title}</h4>
                          {getCategoryBadge(feedback.category)}
                          {getStatusBadge(feedback.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {feedback.content}
                        </p>
                      </div>
                    </div>

                    {/* Sender info */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {feedback.fullname || "Cư dân"}
                      </div>
                      {feedback.room_number && (
                        <div className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          Phòng {feedback.room_number}
                        </div>
                      )}
                      <span>•</span>
                      <span>{formatDate(feedback.created_at)}</span>
                    </div>

                    {/* Response section */}
                    {feedback.response && (
                      <div className="mt-3 p-3 rounded-lg bg-green-500/5 border-l-4 border-green-500">
                        <p className="text-sm font-medium text-green-700">Phản hồi từ quản lý:</p>
                        <p className="text-sm mt-1">{feedback.response}</p>
                        {feedback.responded_at && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDate(feedback.responded_at)}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Response form */}
                    {respondingId === feedback.feedback_id ? (
                      <div className="mt-3 space-y-2">
                        <textarea
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          placeholder="Nhập nội dung phản hồi..."
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleRespond(feedback.feedback_id)}>
                            Gửi phản hồi
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setRespondingId(null);
                              setResponseText("");
                            }}
                          >
                            Hủy
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                        {feedback.status !== "resolved" && (
                          <Button 
                            size="sm"
                            onClick={() => setRespondingId(feedback.feedback_id)}
                          >
                            Phản hồi
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

  );
}
