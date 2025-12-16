import { pgTable, varchar, uuid, timestamp, text, integer, foreignKey, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { Status } from "./enum";
import { UserRole } from "./user_role";
import { Resident } from "./resident";

export const Users = pgTable('users', {
    id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
    email: varchar('email', { length: 100 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    password: text('password').notNull(),
    status: Status('status').notNull().default('inactive'),
    verify: boolean('verify').notNull().default(false),
    role: integer('role')
        .notNull()
        .default(3)
        .references(() => UserRole.id, { onDelete: 'restrict' }),
    resident_id: uuid('resident_id')
        .references(() => Resident.id, { onDelete: 'set null' }),
    approved_by: uuid('approved_by'),
    approved_at: timestamp('approved_at', {withTimezone: true}),
    rejected_reason: text('rejected_reason'),
    created_at: timestamp('created_at', {withTimezone: true}).notNull().defaultNow(),
    updated_at: timestamp('updated_at', {withTimezone: true}).notNull().defaultNow(),
}, (table) => ({
    fk_users_approved_by: foreignKey({
        columns: [table.approved_by],
        foreignColumns: [table.id],
        name: 'fk_users_approved_by',
    }).onDelete('set null'),
}));