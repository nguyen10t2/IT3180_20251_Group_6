import { pgTable, varchar, uuid, timestamp, text, integer, index} from "drizzle-orm/pg-core";
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
    status: Status('status')
        .notNull()
        .default('inactive'),
    role: integer('role')
        .notNull()
        .default(3)
        .references(() => UserRole.id, { onDelete: 'restrict' }),
    resident_id: uuid('resident_id')
        .references(() => Resident.id, { onDelete: 'set null' }),
    approved_by: uuid('approved_by')
        .notNull(),
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
]);
