import {
    pgTable,
    serial,
    varchar,
    boolean,
    timestamp,
    unique,
    index,
    foreignKey,
    decimal,
    date
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { fee_category } from "../models_new/pgEnum";

export const feeTypesSchema = pgTable("fee_types", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    description: varchar("description", { length: 255 }),
    category: fee_category("category").notNull(),
    unit_price: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
    unit: varchar("unit", { length: 50 }).notNull(),
    is_active: boolean("is_active").notNull().default(true),
    effective_from: date("effective_from"),
    effective_to: date("effective_to"),
    deleted_at: timestamp("deleted_at"),
    created_at: timestamp("created_at").notNull().default(sql`now()`),
    updated_at: timestamp("updated_at").notNull().default(sql`now()`),
}, (table) => [
    unique("unique_fee_name_active").on(table.name, table.deleted_at),
    index("idx_fee_name").on(table.name),
    index("idx_fee_category").on(table.category),
    index("idx_fee_is_active").on(table.is_active),
    index("idx_fee_effective_from").on(table.effective_from),
    index("idx_fee_effective_to").on(table.effective_to),
    index("idx_fee_deleted_at").on(table.deleted_at),
]);