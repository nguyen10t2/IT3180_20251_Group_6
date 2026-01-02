// ==================== Notification Types ====================

export interface Notification {
  id: string;
  title: string;
  content: string;
  type: string;
  target: string;
  target_id: string | null;
  is_pinned: boolean;
  scheduled_at: string | null;
  published_at: string | null;
  expires_at: string | null;
  created_by: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  is_read?: boolean;
}

export interface NotificationWithRelations extends Notification {
  creator?: User | null;
  read_status?: NotificationRead | null;
}

export interface NotificationRead {
  id: string;
  notification_id: string;
  user_id: string;
  read_at: string;
  created_at: string;
}

export interface CreateNotificationRequest {
  title: string;
  content: string;
  type: string;
  target: string;
  target_id?: string;
  is_pinned?: boolean;
  scheduled_at?: string;
  published_at?: string;
  expires_at?: string;
}

export interface UpdateNotificationRequest {
  title?: string;
  content?: string;
  type?: string;
  target?: string;
  target_id?: string;
  is_pinned?: boolean;
  scheduled_at?: string;
  published_at?: string;
  expires_at?: string;
}

// Import necessary types
import type { User } from './user';
