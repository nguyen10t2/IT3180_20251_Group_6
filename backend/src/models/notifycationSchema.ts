import {
  pgTable,
  boolean,
  text,
  timestamp,
  uuid,
  varchar,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { notification_target, notification_type } from "./pgEnum";
import { userSchema } from "./userSchema";

export const notificationSchema = pgTable("notification", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  type: notification_type("type").notNull().default("general"),
  target: notification_target("target").notNull().default("all"),
  target_id: uuid("target_id").references(() => userSchema.id),
  is_pinned: boolean("is_pinned").notNull().default(false),
  scheduled_at: timestamp("scheduled_at", { withTimezone: true }),
  published_at: timestamp("published_at", { withTimezone: true }),
  expires_at: timestamp("expires_at", { withTimezone: true }),
  created_by: uuid("created_by").references(() => userSchema.id, { onDelete: "set null" }),
  deleted_at: timestamp("deleted_at", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
  updated_at: timestamp("updated_at", { withTimezone: true }).default(sql`now()`),
}, (table) => [
  index("idx_notification_target_id").on(table.target_id),
  index("idx_notification_created_by").on(table.created_by),
  index("idx_notification_deleted_at").on(table.deleted_at),
  index("idx_notification_scheduled_at").on(table.scheduled_at),
  index("idx_notification_published_at").on(table.published_at),
]);

export type Notification = typeof notificationSchema.$inferSelect;
export type NewNotification = typeof notificationSchema.$inferInsert;