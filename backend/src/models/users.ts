import { pgTable, varchar, uuid, timestamp, text, integer, index, boolean, foreignKey } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { Status } from "./enum";
import { UserRole } from "./user_role";
import { Resident } from "./resident";

export const Users = pgTable('users', {
    id: uuid('id')
        .primaryKey()
        .default(sql`uuid_generate_v4()`),
    email: varchar('email', { length: 100 })
        .notNull()
        .unique(),
    password: text('password')
        .notNull(),
    name: varchar('name', { length: 255 })
        .notNull(),
    verify: boolean('verify')
        .notNull()
        .default(false),
    status: Status('status')
        .notNull()
        .default('inactive'),
    role: integer('role')
        .notNull()
        .default(3)
        .references(() => UserRole.id, { onDelete: 'restrict' }),
    resident_id: uuid('resident_id')
        .references(() => Resident.id, { onDelete: 'set null' }),
    approved_by: uuid('approved_by'),
    approved_at: timestamp('approved_at', {withTimezone: true}),
    rejected_reason: text('rejected_reason'),
    created_at: timestamp('created_at', {withTimezone: true})
        .notNull()
        .defaultNow(),
    updated_at: timestamp('updated_at', {withTimezone: true})
        .notNull()
        .defaultNow(),
}, (table) => [
  index('idx_users_email').on(table.email),
  index('idx_users_status').on(table.status),
  index('idx_users_role').on(table.role),
  index('idx_users_resident_id').on(table.resident_id),
  index('idx_users_feed').on(table.role, table.created_at, table.status),
  foreignKey({
    columns: [table.approved_by],
    foreignColumns: [table.id],
    name: 'fk_users_approved_by',
  }).onDelete('set null'),
]);
