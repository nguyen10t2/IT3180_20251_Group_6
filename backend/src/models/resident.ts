import { pgTable, varchar, uuid, date, timestamp, numeric, text, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { Gender, ResidentStatus } from "./enum";
import { House } from "./house";
import { HouseRole } from "./house_role";

export const Resident = pgTable('resident', {
  id: uuid('id').defaultRandom().primaryKey(),
  house_id: uuid('house_id').references(() => House.house_id, {
    onDelete: 'set null',
  }),
  full_name: varchar('full_name', { length: 255 }).notNull(),
  id_card: varchar('id_card', { length: 20 }).notNull().unique(),
  date_of_birth: date('date_of_birth').notNull(),
  phone: varchar('phone', { length: 15 }).notNull().unique(),
  gender: Gender('gender').notNull(),
  role: integer('role')
    .notNull()
    .references(() => HouseRole.id, {
      onDelete: 'restrict',
    }),
  status: ResidentStatus('status').notNull(),
  occupation: varchar('occupation', { length: 100 }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});
