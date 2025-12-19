import { pgTable, varchar, uuid, date, timestamp, integer, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { Gender, ResidentStatus } from "./enum";
import { House } from "./house";
import { HouseRole } from "./house_role";

export const Resident = pgTable('resident', {
  id: uuid('id')
    .primaryKey()
    .default(sql`uuid_generate_v4()`),
  house_id: uuid('house_id')
    .references(() => House.house_id, { onDelete: 'set null'}),
  full_name: varchar('fullname', { length: 255 })
    .notNull(),
  id_card: varchar('id_card', { length: 20 })
    .notNull()
    .unique(),
  date_of_birth: date('date_of_birth', { mode: 'date' })
    .notNull(),
  phone: varchar('phone', { length: 15 })
    .notNull()
    .unique(),
  gender: Gender('gender')
    .notNull(),
  role: integer('role')
    .notNull()
    .references(() => HouseRole.id, { onDelete: 'restrict' }),
  status: ResidentStatus('status')
    .notNull(),
  occupation: varchar('occupation', { length: 100 }),
  created_at: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
}, (table) => [
  index('idx_resident_house_id').on(table.house_id),
  index('idx_resident_full_name').on(table.full_name),
  index('idx_resident_id_card').on(table.id_card),
  index('idx_resident_phone').on(table.phone),

  index('idx_resident_status').on(table.status)
]);
