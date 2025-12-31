import axiosInstance from "@/lib/axios";

export interface Feedback {
  feedback_id: string;
  user_id: string;
  house_hold_id: string | null;
  type: "complaint" | "suggestion" | "maintenance" | "other";
  priority: "low" | "medium" | "high" | "urgent";
  title: string;
  content: string;
  status: "pending" | "in_progress" | "resolved" | "rejected";
  created_at: string;
  updated_at: string;
  comment_count?: number;
}

export interface FeedbackComment {
  comment_id: string;
  feedback_id: string;
  user_id: string | null;
  commenter_name: string | null;
  content: string;
  is_internal: boolean;
  created_at: string;
}

export interface CreateFeedbackData {
  type: "complaint" | "suggestion" | "maintenance" | "other";
  priority?: "low" | "medium" | "high" | "urgent";
  title: string;
  content: string;
}

export const feedbackService = {
  // Lấy danh sách feedback
  async getFeedbacks(): Promise<{ feedbacks: Feedback[] }> {
    const response = await axiosInstance.get("/api/feedbacks");
    return response.data;
  },

  // Tạo feedback mới
  async createFeedback(data: CreateFeedbackData): Promise<{ message: string; feedback: Feedback }> {
    const response = await axiosInstance.post("/api/feedbacks", data);
    return response.data;
  },

  // Lấy chi tiết feedback
  async getFeedbackDetails(feedback_id: string): Promise<{ feedback: Feedback & { comments: FeedbackComment[] } }> {
    const response = await axiosInstance.get(`/api/feedbacks/${feedback_id}`);
    return response.data;
  },
};
