import { pgEnum } from "drizzle-orm/pg-core";


export const Status = pgEnum('status', ['active', 'inactive', 'suspended']);

export const Gender = pgEnum('gender', ['male', 'female', 'other']);

export const ResidentStatus = pgEnum('resident_status', ['tamtru', 'thuongtru', 'tamvang']);

export const RoomType = pgEnum('room_type', ['penhouse', 'studio', 'normal']);

export const FeeCategory = pgEnum('fee_category', ['fixed', 'variable']);

export const FeeStatus = pgEnum('fee_status', ['pending', 'paid', 'overdue', 'cancelled']);

export const NotificationType = pgEnum('notification_type', ['general', 'emergency', 'event', 'payment']);

export const NotificationTarget = pgEnum('notification_target', ['all', 'household', 'individual']);

export const FeedbackType = pgEnum('feedback_type', ['complaint', 'suggestion', 'maintenance', 'other']);

export const FeedbackStatus = pgEnum('feedback_status', ['pending', 'in_progress', 'resolved', 'rejected']);

export const FeedbackPriority = pgEnum('feedback_priority', ['low', 'medium', 'high', 'urgent']);

export type StatusType = typeof Status.enumValues[number];
export type GenderType = typeof Gender.enumValues[number];
export type ResidentStatusType = typeof ResidentStatus.enumValues[number];
export type RoomTypeType = typeof RoomType.enumValues[number];
export type FeeCategoryType = typeof FeeCategory.enumValues[number];
export type FeeStatusType = typeof FeeStatus.enumValues[number];
export type NotificationTypeType = typeof NotificationType.enumValues[number];
export type NotificationTargetType = typeof NotificationTarget.enumValues[number];
export type FeedbackTypeType = typeof FeedbackType.enumValues[number];
export type FeedbackStatusType = typeof FeedbackStatus.enumValues[number];
export type FeedbackPriorityType = typeof FeedbackPriority.enumValues[number];