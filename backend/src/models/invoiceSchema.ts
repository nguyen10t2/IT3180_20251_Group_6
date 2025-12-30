import { sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  numeric,
  index,
  integer,
  unique,
} from "drizzle-orm/pg-core";
import { houseSchema } from "./houseSchema";
import { fee_status } from "./pgEnum";
import { userSchema } from "./userSchema";
import { invoiceTypeSchema } from "./invoiceTypeSchema";

export const invoiceSchema = pgTable('invoices', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
  invoice_number: varchar('invoice_number', { length: 50 }).notNull().unique(),
  house_id: uuid('house_id').references(() => houseSchema.id, { onDelete: 'cascade' }),
  period_month: integer('period_month').notNull(),
  period_year: integer('period_year').notNull(),
  invoice_types: integer('invoice_types').references(() => invoiceTypeSchema.id, { onDelete: 'set null' }),
  total_amount: numeric('total_amount', { precision: 12, scale: 2 }).notNull().default('0'),
  status: fee_status('status').notNull().default('pending'),
  due_date: timestamp('due_date', { withTimezone: true }).notNull(),
  paid_at: timestamp('paid_at', { withTimezone: true }),
  paid_amount: numeric('paid_amount', { precision: 12, scale: 2 }),
  payment_note: varchar('payment_note', { length: 50 }),
  confirmed_by: uuid('confirmed_by').references(() => userSchema.id, { onDelete: 'set null' }),
  notes: text('notes'),
  deleted_at: timestamp('deleted_at', { withTimezone: true }),
  created_by: uuid('created_by').notNull().references(() => userSchema.id, { onDelete: 'set null' }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  unique('unique_invoice_number_active').on(table.house_id, table.period_month, table.period_year, table.invoice_types, table.deleted_at),
  index('idx_invoices_house_id').on(table.house_id),
  index('idx_invoices_period').on(table.period_month, table.period_year),
  index('idx_invoices_status').on(table.status),
  index('idx_invoices_due_date').on(table.due_date),
  index('idx_invoices_create_by').on(table.created_by)
]);

export type Invoices = typeof invoiceSchema.$inferSelect;
export type NewInvoices = typeof invoiceSchema.$inferInsert;