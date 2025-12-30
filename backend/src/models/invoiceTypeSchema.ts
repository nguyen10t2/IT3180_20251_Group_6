import {
  pgTable,
  varchar,
  serial,
} from "drizzle-orm/pg-core";

export const invoiceTypeSchema = pgTable('invoice_types', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  description: varchar('description', { length: 255 }),
});

export type InvoiceType = typeof invoiceTypeSchema.$inferSelect;
export type NewInvoiceType = typeof invoiceTypeSchema.$inferInsert;