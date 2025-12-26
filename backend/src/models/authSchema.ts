import {
    pgTable,
    uuid,
    text,
    timestamp,
    check,
    index,
} from "drizzle-orm/pg-core";
import { userSchema } from "./userSchema";
import { sql } from "drizzle-orm";

export const refreshTokenSchema = pgTable("refresh_tokens", {
    id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
    user_id: uuid("user_id").notNull().references(() => userSchema.id),
    token_hash: text("token_hash").notNull(),
    expires_at: timestamp("expires_at").notNull(),
    created_at: timestamp("created_at").notNull().default(sql`now()`),
}, (table) => [
    check("idx_refresh_token_expires", sql`${table.expires_at} > ${table.created_at}`),
    index("idx_refresh_token_user_id").on(table.user_id),
    index("idx_refresh_token_token_hash").on(table.token_hash),
    index("idx_refresh_token_expires").on(table.expires_at),
]);

export type RefreshToken = typeof refreshTokenSchema.$inferSelect;
export type NewRefreshToken = typeof refreshTokenSchema.$inferInsert;