import {
  pgTable,
  uuid,
  varchar,
  integer,
  decimal,
  boolean,
  text,
  timestamp,
  check,
  index,
  unique,
} from "drizzle-orm/pg-core";

import { sql } from "drizzle-orm";

export const houseSchema = pgTable("house", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  room_number: varchar("room_number", { length: 10 }).notNull().unique(),
  room_type: varchar("room_type", { length: 20 }).notNull(),
  building: varchar("building", { length: 10 }),
  area: decimal("area", { precision: 10, scale: 2 }).notNull(),
  head_resident_id: uuid("head_resident_id"),
  has_vehicle: boolean("has_vehicle").default(false),
  motorbike_count: integer("motorbike_count").default(0),
  car_count: integer("car_count").default(0),
  notes: text("notes"),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  deleted_at: timestamp("deleted_at"),
  created_at: timestamp("created_at").notNull().default(sql`now()`),
  updated_at: timestamp("updated_at").notNull().default(sql`now()`),
}, (table) => [
  check("motorbike_count_check", sql`${table.motorbike_count} >= 0`),
  check("car_count_check", sql`${table.car_count} >= 0`),
  unique("unique_room_number_active").on(table.room_number, table.deleted_at),
  index("idx_room_number").on(table.room_number),
  index("idx_status").on(table.status),
  index("idx_house_head_resident").on(table.head_resident_id),
]);

export type House = typeof houseSchema.$inferSelect;
export type NewHouse = typeof houseSchema.$inferInsert;