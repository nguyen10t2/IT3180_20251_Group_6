import { pgTable, serial, varchar, timestamp, text, numeric, boolean} from "drizzle-orm/pg-core";
import { FeeCategory } from "./enum";


export const FeeTypes = pgTable('fee_types', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 100 }).notNull().unique(),
    description: text('description'),
    category: FeeCategory('category').notNull(),
    unit_price: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
    unit: varchar('unit', { length: 50 }).notNull(),
    is_active: boolean('is_active').notNull().default(true),
    created_at: timestamp('created_at', {withTimezone: true}).notNull().defaultNow(),
    updated_at: timestamp('updated_at', {withTimezone: true}).notNull().defaultNow(),
});