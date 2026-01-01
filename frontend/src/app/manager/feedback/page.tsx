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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  MessageSquare, 
  Loader2,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  Building2,
  User,
  Eye,
  X
} from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";

interface Feedback {
  id: string;
  user_id: string;
  house_id: string;
  fullname?: string;
  room_number?: string;
  title: string;
  content: string;
  type: string;
  priority: string;
  attachments?: string[];
  status: string;
  assigned_to?: string;
  resolved_at?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
}

// Helper functions moved outside component
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

const getTypeBadge = (type: string) => {
  const types: Record<string, { label: string; className: string }> = {
    complaint: { label: "Khiếu nại", className: "bg-red-500/10 text-red-600" },
    suggestion: { label: "Đề xuất", className: "bg-blue-500/10 text-blue-600" },
    maintenance: { label: "Bảo trì", className: "bg-orange-500/10 text-orange-600" },
    other: { label: "Khác", className: "bg-gray-500/10 text-gray-600" },
  };
  const typeInfo = types[type] || types.other;
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${typeInfo.className}`}>
      {typeInfo.label}
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

function FeedbackDetailModal({ 
  feedback, 
  onClose, 
  onRespondSuccess 
}: { 
  feedback: Feedback; 
  onClose: () => void; 
  onRespondSuccess: () => void; 
}) {
  const [responseText, setResponseText] = useState("");
  const [responding, setResponding] = useState(false);

  const handleRespond = async () => {
    const trimmedResponse = responseText.trim();
    
    if (!trimmedResponse) {
      toast.error("Vui lòng nhập nội dung phản hồi");
      return;
    }

    if (!feedback?.id) {
      toast.error("Không tìm thấy ID phản hồi");
      console.error("Missing feedback_id:", feedback);
      return;
    }

    try {
      setResponding(true);
      const payload = {
        id: feedback.id,
        response: trimmedResponse,
      };
      console.log("Sending payload:", payload);
      
      await axiosInstance.post(`/managers/feedbacks/response`, payload);
      toast.success("Đã gửi phản hồi thành công");
      onRespondSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error responding to feedback:", error);
      console.error("Error data:", error.response?.data);
      const errorMsg = error.response?.data?.message || "Không thể gửi phản hồi";
      toast.error(errorMsg);
    } finally {
      setResponding(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Chi tiết phản hồi</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getTypeBadge(feedback.type)}
              {getStatusBadge(feedback.status)}
            </div>
            <span className="text-sm text-muted-foreground">
              {formatDate(feedback.created_at)}
            </span>
          </div>

          <div>
            <h4 className="font-semibold text-lg">{feedback.title}</h4>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
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
            </div>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-sm whitespace-pre-wrap">{feedback.content}</p>
          </div>

          {/* Response section */}
          {feedback.response ? (
            <div className="mt-4 p-4 rounded-lg bg-green-500/5 border-l-4 border-green-500">
              <p className="text-sm font-medium text-green-700">Phản hồi từ quản lý:</p>
              <p className="text-sm mt-2 whitespace-pre-wrap">{feedback.response}</p>
              {feedback.responded_at && (
                <p className="text-xs text-muted-foreground mt-2">
                  {formatDate(feedback.responded_at)}
                </p>
              )}
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              <Label>Gửi phản hồi</Label>
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Nhập nội dung phản hồi..."
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button 
                  onClick={handleRespond}
                  disabled={responding}
                >
                  {responding && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Gửi phản hồi
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ManagerFeedbacksPage() {
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "in_progress" | "resolved">("all");
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/managers/feedbacks");
      setFeedbacks(res.data.feedbacks || []);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      toast.error("Không thể tải danh sách phản hồi");
    } finally {
      setLoading(false);
    }
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
    <>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead>Người gửi</TableHead>
                    <TableHead>Phòng</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead>Ngày gửi</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFeedbacks.map((feedback) => (
                    <TableRow key={feedback.id}>
                      <TableCell className="font-medium max-w-[200px] truncate" title={feedback.title}>
                        {feedback.title}
                      </TableCell>
                      <TableCell>{feedback.fullname || "Cư dân"}</TableCell>
                      <TableCell>{feedback.room_number || "N/A"}</TableCell>
                      <TableCell>{getTypeBadge(feedback.type)}</TableCell>
                      <TableCell>{formatDate(feedback.created_at)}</TableCell>
                      <TableCell>{getStatusBadge(feedback.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedFeedback(feedback)}
                          className="h-8 w-8 p-0"
                          title="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedFeedback && (
        <FeedbackDetailModal 
          feedback={selectedFeedback} 
          onClose={() => setSelectedFeedback(null)}
          onRespondSuccess={fetchFeedbacks}
        />
      )}
    </>
  );
}
