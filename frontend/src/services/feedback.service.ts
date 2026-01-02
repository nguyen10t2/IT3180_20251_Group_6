import { apiClient } from '@/lib/api-client';
import type {
  Feedback,
  FeedbackWithRelations,
  CreateFeedbackRequest,
  UpdateFeedbackRequest,
  RespondFeedbackRequest,
  ApiResponse,
} from '@/types';

export const feedbackService = {
  // Get all feedbacks (manager only)
  getAllFeedbacks: async (): Promise<FeedbackWithRelations[]> => {
    const response = await apiClient.get<{ feedbacks: FeedbackWithRelations[] }>('/managers/feedbacks');
    return response.data.feedbacks;
  },

  // Get feedback by ID (manager only)
  getFeedbackById: async (id: string): Promise<FeedbackWithRelations> => {
    const response = await apiClient.get<{ feedback: FeedbackWithRelations }>(`/managers/feedbacks/${id}`);
    return response.data.feedback;
  },

  // Respond to feedback (manager only)
  respondToFeedback: async (id: string, data: RespondFeedbackRequest): Promise<ApiResponse> => {
    const response = await apiClient.patch<ApiResponse>(`/managers/feedbacks/${id}/respond`, data);
    return response.data;
  },

  // Update feedback status (manager only)
  updateFeedbackStatus: async (id: string, status: 'pending' | 'in_progress' | 'resolved' | 'rejected'): Promise<ApiResponse> => {
    const response = await apiClient.patch<ApiResponse>(`/managers/feedbacks/${id}/status`, { status });
    return response.data;
  },

  // Get resident feedbacks
  getResidentFeedbacks: async (): Promise<Feedback[]> => {
    const response = await apiClient.get<{ feedbacks: Feedback[] }>('/feedbacks');
    return response.data.feedbacks;
  },

  // Create feedback (resident)
  createFeedback: async (data: CreateFeedbackRequest): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/feedbacks', data);
    return response.data;
  },

  // Update feedback (resident)
  updateFeedback: async (id: string, data: UpdateFeedbackRequest): Promise<ApiResponse> => {
    const response = await apiClient.patch<ApiResponse>(`/feedbacks/${id}`, data);
    return response.data;
  },

  // Delete feedback (resident)
  deleteFeedback: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.delete<ApiResponse>(`/feedbacks/${id}`);
    return response.data;
  },

  // Get feedback by ID (resident)
  getResidentFeedbackById: async (id: string): Promise<FeedbackWithRelations> => {
    const response = await apiClient.get<{ feedback: FeedbackWithRelations }>(`/feedbacks/${id}`);
    return response.data.feedback;
  },

  // Add comment to feedback
  addComment: async (feedbackId: string, content: string, role: 'manager' | 'resident' = 'manager'): Promise<ApiResponse> => {
    const endpoint = role === 'resident' ? `/feedbacks/${feedbackId}/comments` : `/managers/feedbacks/${feedbackId}/comments`;
    const response = await apiClient.post<ApiResponse>(endpoint, { content });
    return response.data;
  },
};
