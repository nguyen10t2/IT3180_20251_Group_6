import { is, sql } from "drizzle-orm";
import { index, uuid, varchar, text, timestamp, pgTable, boolean } from "drizzle-orm/pg-core";
import { NotificationTarget, NotificationType } from "./enum";
import { Users } from "./users";


export const Notifications = pgTable("notifications", {
    id: uuid("id")
        .primaryKey()
        .default(sql`uuid_generate_v4()`),
    title: varchar("title", { length: 255 })
        .notNull(),
    context: text("context")
        .notNull(),
    type: NotificationType("type")
        .notNull(),
    target: NotificationTarget("target")
        .notNull(),
    target_id: uuid("target_id"),
    is_pinned: boolean("is_pinned")
        .notNull()
        .default(false),
    read_at: timestamp("read_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    scheduled_at: timestamp("scheduled_at", { withTimezone: true }),
    published_at: timestamp("published_at", { withTimezone: true }),
    expires_at: timestamp("expires_at", { withTimezone: true }),
    created_by: uuid("created_by")
        .references(() => Users.id, { onDelete: "set null" }),
    created_at: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true })
        .notNull()
        .defaultNow()
}, (table) => [
    index('idx_notifications_type').on(table.type),
    index('idx_notifications_target').on(table.target),
    index('idx_notifications_publish_at').on(table.published_at),
    index('idx_notifications_is_pinned').on(table.is_pinned)
        .where(sql`${table.is_pinned} IS TRUE`),
    index('idx_notifications_created_by').on(table.created_by)
]);