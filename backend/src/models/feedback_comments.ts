import { pgTable, uuid, timestamp, text, boolean,index} from "drizzle-orm/pg-core";
import { is, sql } from "drizzle-orm";
import { Feedbacks } from "./feedbacks";
import { Users } from "./users";


export const FeedbackComments = pgTable('feedback_comments', {
    id: uuid('id')
        .primaryKey()
        .default(sql`uuid_generate_v4()`),
    feedback_id: uuid('feedback_id')
        .references(() => Feedbacks.id, { onDelete: 'cascade' }),
    user_id: uuid('user_id')
        .references(() => Users.id, { onDelete: 'set null' }),
    comment: text('comment')
        .notNull(),
    is_internal: boolean('is_internal')
        .notNull()
        .default(false),
    created_at: timestamp('created_at', { withTimezone: true })
        .notNull()
        .defaultNow()
}, (table) => [
    index('idx_feedback_comments_feedback_id').on(table.feedback_id),
    index('idx_feedback_comments_user_id').on(table.user_id),
]);

