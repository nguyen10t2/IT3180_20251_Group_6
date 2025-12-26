import {
  pgTable,
  uuid,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { houseSchema } from "./houseSchema";
import { userSchema } from "./userSchema";
import { sql } from "drizzle-orm";

export const houseHoldHeadHistorySchema = pgTable("house_hold_head_history", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  house_id: uuid("house_id").notNull().references(() => houseSchema.id, { onDelete: "cascade" }),
  previous_head_id: uuid("previous_head_id").notNull().references(() => userSchema.id, { onDelete: "set null" }),
  new_head_id: uuid("new_head_id").notNull().references(() => userSchema.id, { onDelete: "restrict" }),
  reason: text("reason").notNull(),
  changed_by: uuid("changed_by").notNull().references(() => userSchema.id, { onDelete: "restrict" }),
  changed_at: timestamp("changed_at", { withTimezone: true }).notNull().default(sql`now()`),
}, (table) => [
  index("idx_household_head_history_house").on(table.house_id),
  index("idx_household_head_history_date").on(table.changed_at),
]);

export type HouseHoldHeadHistory = typeof houseHoldHeadHistorySchema.$inferSelect;
export type NewHouseHoldHeadHistory = typeof houseHoldHeadHistorySchema.$inferInsert;