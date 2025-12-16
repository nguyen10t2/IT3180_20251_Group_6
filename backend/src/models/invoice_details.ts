import { sql } from "drizzle-orm";
import { index, uuid, integer, numeric, text, timestamp, pgTable } from "drizzle-orm/pg-core";
import { Invoices } from "./invoices";
import { FeeTypes } from "./fee_types";

export const InvoiceDetails = pgTable("invoice_details", {
    id: uuid("id")
        .primaryKey()
        .default(sql`uuid_generate_v4()`),
    invoice_id: uuid("invoice_id")
        .notNull()
        .references(() => Invoices.id, { onDelete: "cascade" }),
    fee_type_id: integer("fee_type_id")
        .notNull()
        .references(() => FeeTypes.id, { onDelete: "restrict" }),
    quantity: numeric("quantity", { precision: 10, scale: 2 })
        .notNull()
        .default('1'),
    unit_price: numeric("unit_price", { precision: 12, scale: 2 })
        .notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 })
        .notNull(),
    notes: text("notes"),
    created_at: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
}, (table) => [
    index('idx_invoice_details_invoice_id').on(table.invoice_id),
    index('idx_invoice_details_fee_type_id').on(table.fee_type_id),
]);