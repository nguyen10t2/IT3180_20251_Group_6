import { pgEnum } from "drizzle-orm/pg-core";

export const user_status = pgEnum("user_status", ["active", "inactive", "suspended"]);
export const gender = pgEnum("gender", ["male", "female", "other"]);
export const resident_status = pgEnum("resident_status", ["thuongtru", "tamtru", "tamvang", "dachuyendi"]);
export const room_type = pgEnum("room_type", ["penhouse", "studio", "normal"]);
export const fee_category = pgEnum("fee_category", ["fixed", "variable"]);
export const fee_status = pgEnum("fee_status", ["pending", "paid", "overdue", "cancelled"]);
export const notification_type = pgEnum("notification_type", ["general", "emergency", "event", "payment"]);
export const notification_target = pgEnum("notification_target", ["all", "household", "individual"]);
export const feedback_type = pgEnum("feedback_type", ["complaint", "suggestion", "maintenance", "other"]);
export const feedback_status = pgEnum("feedback_status", ["pending", "in_progress", "resolved", "rejected"]);
export const feedback_priority = pgEnum("feedback_priority", ["low", "medium", "high", "urgent"]);
export const house_role_type = pgEnum("house_role_type", ["owner", "member", "tenant"]);

export type StatusEnum = typeof user_status.enumValues[number];
export type GenderEnum = typeof gender.enumValues[number];
export type ResidentStatusEnum = typeof resident_status.enumValues[number];
export type RoomTypeEnum = typeof room_type.enumValues[number];
export type FeeCategoryEnum = typeof fee_category.enumValues[number];
export type FeeStatusEnum = typeof fee_status.enumValues[number];
export type NotificationTypeEnum = typeof notification_type.enumValues[number];
export type NotificationTargetEnum = typeof notification_target.enumValues[number];
export type FeedbackTypeEnum = typeof feedback_type.enumValues[number];
export type FeedbackStatusEnum = typeof feedback_status.enumValues[number];
export type FeedbackPriorityEnum = typeof feedback_priority.enumValues[number];
export type HouseRoleTypeEnum = typeof house_role_type.enumValues[number];