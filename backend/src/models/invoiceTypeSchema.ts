import {
  pgTable,
  varchar,
  serial,
} from "drizzle-orm/pg-core";

export const invoiceTypeSchema = pgTable('invoice_type', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique()
});

export type InvoiceType = typeof invoiceTypeSchema.$inferSelect;
export type NewInvoiceType = typeof invoiceTypeSchema.$inferInsert;