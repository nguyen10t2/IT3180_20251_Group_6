import { pgTable, varchar, serial} from "drizzle-orm/pg-core";

export const InvoiceType = pgTable('invoice_type', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique()
});