import { sql } from "drizzle-orm";
import { pgTable, uuid, varchar, timestamp, text, numeric, index, integer} from "drizzle-orm/pg-core";
import { House } from "./house";
import { Users } from "./users";
import { InvoiceType } from "./invoice_type";
import { FeeStatus } from "./enum";

export const Invoices = pgTable('invoices', {
    id: uuid('id')
        .primaryKey()
        .default(sql`uuid_generate_v4()`),
    invoice_number: varchar('invoice_number', { length: 50 })
        .notNull()
        .unique(),
    house_id: uuid('house_id')
        .references(() => House.house_id, { onDelete: 'cascade' }),
    period_month: integer('period_month')
        .notNull(),
    period_year: integer('period_year')
        .notNull(),
    invoice_type: integer('invoice_type')
        .references(() => InvoiceType.id, { onDelete: 'set null' }),
    total_amount: numeric('total_amount', { precision: 12, scale: 2 })
        .notNull()
        .default('0'),
    status: FeeStatus('status')
        .notNull()
        .default('pending'),
    due_date: timestamp('due_date', { withTimezone: true })
        .notNull(),
    paid_at: timestamp('paid_at', { withTimezone: true }),
    notes: text('notes'),
    create_by: uuid('create_by')
        .notNull()
        .references(() => Users.id, { onDelete: 'set null' }),
    confirmed_by: uuid('confirmed_by')
        .references(() => Users.id, { onDelete: 'set null' }),
    created_at: timestamp('created_at', { withTimezone: true })
        .notNull()
        .defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true })
        .notNull()
        .defaultNow(),
}, (table) => [
    index('idx_invoices_house_id').on(table.house_id),
    index('idx_invoices_period').on(table.period_month, table.period_year),
    index('idx_invoices_status').on(table.status),
    index('idx_invoices_due_date').on(table.due_date),
    index('idx_invoices_create_by').on(table.create_by)
]);