import { sql } from "drizzle-orm";
import { uuid, timestamp, pgTable, index, uniqueIndex } from "drizzle-orm/pg-core";
import { Users } from "./users";
import { Notifications } from "./notifications";

export const NotificationReads = pgTable("notification_reads", {
    id: uuid("id")
        .primaryKey()
        .default(sql`uuid_generate_v4()`),
    notification_id: uuid("notification_id")
        .references(() => Notifications.id, { onDelete: "cascade" }),
    user_id: uuid("user_id")
        .references(() => Users.id, { onDelete: "cascade" }),
    read_at: timestamp("read_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
}, (table) => [
    index("idx_notification_reads_notification_id").on(table.notification_id),
    index("idx_notification_reads_user_id").on(table.user_id),
    uniqueIndex(
      "notification_reads_notification_id_user_id_unique"
    ).on(table.notification_id, table.user_id),
]);