import { pgTable, varchar, uuid, timestamp, text, index} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { Users } from "./users";
import { House } from "./house";
import { FeedbackPriority, FeedbackStatus, FeedbackType } from "./enum";


export const Feedbacks = pgTable('feedbacks', {
    id: uuid('id')
        .primaryKey()
        .default(sql`uuid_generate_v4()`),
    user_id: uuid('user_id')
        .references(() => Users.id, { onDelete: 'set null' }),
    house_id: uuid('house_id')
        .references(() => House.house_id, { onDelete: 'set null' }),
    type: FeedbackType('type')
        .notNull(),
    priority: FeedbackPriority('priority')
        .notNull()
        .default('medium'),
    title: varchar('title', { length: 255 })
        .notNull(),
    context: text('context')
        .notNull(),
    attachments: text('attachments').array(),
    status: FeedbackStatus('status')
        .notNull()
        .default('pending'),
    assigned_to: uuid('assigned_to')
        .references(() => Users.id, { onDelete: 'set null' }),
    resolved_at: timestamp('resolved_at', { withTimezone: true }),
    resolution_notes: text('resolution_notes'),
    created_at: timestamp('created_at', { withTimezone: true })
        .notNull()
        .defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true })
        .notNull()
        .defaultNow(),
}, (table) => [
    index('idx_feedbacks_user_id').on(table.user_id),
    index('idx_feedbacks_house_id').on(table.house_id),
    index('idx_feedbacks_status').on(table.status),
    index('idx_feedbacks_priority').on(table.priority),
    index('idx_feedbacks_type').on(table.type),
    index('idx_feedbacks_assigned_to').on(table.assigned_to)
]); 