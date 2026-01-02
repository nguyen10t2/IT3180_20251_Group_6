// ==================== Feedback Types ====================

export interface Feedback {
  id: string;
  user_id: string;
  house_id: string;
  type: string;
  priority: string;
  title: string;
  content: string;
  attachments: string[];
  status: string;
  assigned_to: string | null;
  resolved_at: string | null;
  resolution_notes: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface FeedbackWithRelations extends Feedback {
  user?: User | null;
  house?: House | null;
  assignee?: User | null;
  comments?: FeedbackComment[];
}

export interface FeedbackComment {
  id: string;
  feedback_id: string;
  user_id: string;
  content: string;
  attachments: string[];
  created_at: string;
  updated_at: string;
}

export interface FeedbackCommentWithUser extends FeedbackComment {
  user?: User | null;
}

export interface CreateFeedbackRequest {
  house_id: string;
  type: string;
  priority: string;
  title: string;
  content: string;
  attachments?: string[];
}

export interface UpdateFeedbackRequest {
  type?: string;
  priority?: string;
  title?: string;
  content?: string;
  attachments?: string[];
  status?: string;
  assigned_to?: string;
}

export interface RespondFeedbackRequest {
  status: string;
  assigned_to?: string;
  resolution_notes?: string;
}

export interface CreateFeedbackCommentRequest {
  content: string;
  attachments?: string[];
}

// Import necessary types
import type { User } from './user';
import type { House } from './house';
