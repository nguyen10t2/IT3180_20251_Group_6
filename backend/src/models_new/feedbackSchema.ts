import {
  pgTable,
  text,
  uuid,
  varchar,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { userSchema } from "./userSchema";
import { houseSchema } from "./houseSchema";
import { feedback_type, feedback_priority, feedback_status } from "./pgEnum";

export const feedbackSchema = pgTable("feedback", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  user_id: uuid("user_id").notNull().references(() => userSchema.id, { onDelete: "restrict" }),
  house_id: uuid("house_id").notNull().references(() => houseSchema.id, { onDelete: "set null" }),
  type: feedback_type("type").notNull().default("other"),
  priority: feedback_priority("priority").notNull().default("medium"),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  attachments: text("attachments").array().notNull(),
  status: feedback_status("status").notNull().default("pending"),
  assigned_to: uuid("assigned_to").references(() => userSchema.id, { onDelete: "set null" }),
  resolved_at: timestamp("resolved_at"),
  resolution_notes: text("resolution_notes"),
  deleted_at: timestamp("deleted_at"),
  created_at: timestamp("created_at").default(sql`now()`),
  updated_at: timestamp("updated_at").default(sql`now()`),
}, (table) => [
  index("idx_feedback_user_id").on(table.user_id),
  index("idx_feedback_house_id").on(table.house_id),
  index("idx_feedback_status").on(table.status),
  index("idx_feedback_created_at").on(table.created_at),
]);

export type Feedback = typeof feedbackSchema.$inferSelect;
export type NewFeedback = typeof feedbackSchema.$inferInsert;