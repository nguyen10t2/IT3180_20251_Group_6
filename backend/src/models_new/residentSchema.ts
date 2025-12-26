import {
    pgTable,
    uuid,
    varchar,
    date,
    timestamp,
    unique,
    index,
    foreignKey
} from "drizzle-orm/pg-core";

import { sql } from "drizzle-orm";
import { houseSchema } from "./houseSchema";
import { gender } from "../models_new/pgEnum";
import { house_role_type, resident_status } from "../models_new/pgEnum";

export const residentSchema = pgTable("resident", {
    id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
    house_id: uuid("house_id").references(() => houseSchema.id),
    full_name: varchar("full_name", { length: 255 }).notNull(),
    id_card: varchar("id_card", { length: 12 }).notNull().unique(),
    date_of_birth: date("date_of_birth").notNull(),
    phone: varchar("phone", { length: 10 }).notNull().unique(),
    email: varchar("email", { length: 100 }),
    gender: gender("gender").notNull(),
    occupation: varchar("occupation", { length: 100 }),
    house_role: house_role_type("house_role").notNull().default("member"),
    residence_status: resident_status("residence_status").notNull().default("thuongtru"),
    move_in_date: date("move_in_date"),
    move_out_date: date("move_out_date"),
    move_out_reason: varchar("move_out_reason", { length: 255 }),
    deleted_at: timestamp("deleted_at"),
    created_at: timestamp("created_at").notNull().default(sql`now()`),
    updated_at: timestamp("updated_at").notNull().default(sql`now()`),
}, (table) => [
    unique("unique_id_card_active").on(table.id_card, table.deleted_at),
    unique("unique_phone_active").on(table.phone, table.deleted_at),
    index("idx_house_id").on(table.house_id),
    index("idx_full_name").on(table.full_name),
    index("idx_id_card").on(table.id_card),
    index("idx_phone").on(table.phone),
    index("idx_residence_status").on(table.residence_status),
    index("idx_house_role").on(table.house_role),
    index("idx_deleted_at").on(table.deleted_at),
    foreignKey({
        columns: [table.house_id],
        foreignColumns: [table.id],
        name: "fk_house_head_resident",
    }).onDelete("set null"),
]);

export type Resident = typeof residentSchema;