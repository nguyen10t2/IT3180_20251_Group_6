import {
  pgTable,
  uuid,
  integer,
  decimal,
  timestamp,
  text,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { invoiceSchema } from "./invoiceSchema";
import { feeTypeSchema } from "./feeTypeSchema";

export const invoiceDetailSchema = pgTable("invoice_details", {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
  invoice_id: uuid('invoice_id').references(() => invoiceSchema.id),
  fee_id: integer('fee_id').references(() => feeTypeSchema.id),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  notes: text('notes'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().default(sql`now()`),
}, (table) => [
  index("idx_invoice_detail_invoice_id").on(table.invoice_id),
  index("idx_invoice_detail_fee_id").on(table.fee_id),
]);

export type InvoiceDetail = typeof invoiceDetailSchema.$inferSelect;
export type NewInvoiceDetail = typeof invoiceDetailSchema.$inferInsert;