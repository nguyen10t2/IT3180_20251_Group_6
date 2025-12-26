import {
  pgTable,
  uuid,
  timestamp,
  unique
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { notificationSchema } from "./notifycationSchema";
import { userSchema } from "./userSchema";

export const notificationReadSchema = pgTable("notification_reads", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  notification_id: uuid("notification_id").notNull().references(() => notificationSchema.id),
  user_id: uuid("user_id").notNull().references(() => userSchema.id),
  read_at: timestamp("read_at").notNull().default(sql`now()`),
}, (table) => [
  unique("unique_notification_user").on(table.notification_id, table.user_id),
]);

export type NotificationRead = typeof notificationReadSchema.$inferSelect;
export type NewNotificationRead = typeof notificationReadSchema.$inferInsert;