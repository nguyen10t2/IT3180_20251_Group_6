import {
    pgTable,
    serial,
    varchar,
    integer,
    uuid,
    text,
    boolean,
    timestamp,
    unique,
    index,
    foreignKey
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { residentSchema } from "./residentSchema";

export const userRoleSchema = pgTable("user_role", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 25 }).notNull().unique(),
    permission: integer("permission").notNull(),
    description: varchar("description", { length: 255 })
});

export const userSchema = pgTable("users", {
    id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
    email: varchar("email", { length: 100 }).notNull().unique(),
    hashed_password: text("hashed_password").notNull(),
    full_name: varchar("full_name", { length: 255 }).notNull(),
    avatar_url: text(),
    resident_id: uuid("resident_id").references(() => residentSchema.id),
    role: integer("role").references(() => userRoleSchema.id).notNull().default(3),
    status: varchar("status", { length: 20 }).notNull().default("inactive"),
    email_verified: boolean("email_verified").notNull().default(false),
    approved_by: uuid("approved_by"),
    approved_at: timestamp("approved_at"),
    rejected_reason: text("rejected_reason"),
    last_login_at: timestamp("last_login_at"),
    last_login_ip: varchar("last_login_ip", { length: 45 }),
    failed_login_attempts: integer("failed_login_attempts").notNull().default(0),
    locked_until: timestamp("locked_until"),
    deleted_at: timestamp("deleted_at"),
    created_at: timestamp("created_at").notNull().default(sql`now()`),
    updated_at: timestamp("updated_at").notNull().default(sql`now()`),
}, (table) => [
    unique("unique_email_active").on(table.email, table.deleted_at),
    index("idx_email").on(table.email),
    index("idx_status").on(table.status),
    index("idx_role").on(table.role),
    index("idx_resident_id").on(table.resident_id),
    index("idx_feed").on(table.role, table.created_at, table.status),
    foreignKey({
        columns: [table.approved_by],
        foreignColumns: [table.id],
        name: "fk_users_approved_by",
    }).onDelete("set null"),
]);

export type User = typeof userSchema;