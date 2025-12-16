import { pgTable, varchar, uuid, timestamp, text, boolean} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { Users } from "./users";


export const RefreshToken = pgTable('refresh_token', {
    id: uuid('id')
        .primaryKey()
        .default(sql`uuid_generate_v4()`),
    user_id: uuid('user_id')
        .references(() => Users.id, { onDelete: 'cascade' }),
    token: text('token')
        .notNull(),
    expires_at: timestamp('expires_at', {withTimezone: true})
        .notNull(),
    created_at: timestamp('created_at', {withTimezone: true})
        .notNull()
        .defaultNow(),
});

export const OTP = pgTable('otp', {
    id: uuid('id')
        .primaryKey()
        .default(sql`uuid_generate_v4()`),
    email: varchar('email', { length: 100 })
        .notNull(),
    code: varchar('code', { length: 10 })
        .notNull(),
    expires_at: timestamp('expires_at', {withTimezone: true})
        .notNull(),
    created_at: timestamp('created_at', {withTimezone: true})
        .notNull()
        .defaultNow(),
});

export const ResetPasswordToken = pgTable('reset_password_token', {
    id: uuid('id')
        .primaryKey()
        .default(sql`uuid_generate_v4()`),
    email: varchar('email', { length: 100 })
        .notNull(),
    token: text('token')
        .notNull(),
    is_used: boolean('is_used')
        .default(false),
    expires_at: timestamp('expires_at', {withTimezone: true})
        .notNull(),
    created_at: timestamp('created_at', {withTimezone: true})
        .notNull()
        .defaultNow(),
});