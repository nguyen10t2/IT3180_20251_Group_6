import { pgTable, varchar, uuid, boolean,timestamp, numeric, text, integer} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { RoomType } from "./enum";

export const House = pgTable('house', {
    house_id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
    room_number: varchar('room_number', { length: 10 }).notNull().unique(),
    room_type: RoomType('room_type').notNull(),
    area: numeric('area', { precision: 10, scale: 2 }).notNull(),
    member_count: integer('member_count').default(0),
    house_resident_id: uuid('house_resident_id'),
    has_vehicle: boolean('has_vehicle').default(false),
    vehicle_count: integer('vehicle_count').default(0),
    notes: text('notes'),
    created_at: timestamp('created_at', {withTimezone: true}).defaultNow().notNull(),
    updated_at: timestamp('updated_at', {withTimezone: true}).defaultNow().notNull()
});