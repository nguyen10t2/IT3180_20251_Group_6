import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  index
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { feedbackSchema } from "./feedbackSchema";
import { userSchema } from "./userSchema";

export const feedbackCommentSchema = pgTable("feedback_comments", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  feedback_id: uuid("feedback_id").notNull().references(() => feedbackSchema.id, { onDelete: "cascade" }),
  user_id: uuid("user_id").notNull().references(() => userSchema.id, { onDelete: "restrict" }),
  content: text("content").notNull(),
  is_internal: boolean("is_internal").notNull().default(false),
  created_at: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
}, (table) => [
  index("idx_feedback_comment_feedback_id").on(table.feedback_id),
  index("idx_feedback_comment_user_id").on(table.user_id),
]);

export type FeedbackComment = typeof feedbackCommentSchema.$inferSelect;
export type NewFeedbackComment = typeof feedbackCommentSchema.$inferInsert;