import { t } from "elysia";
import { enumToTypeBox } from "../helpers/enumHelper";
import { FeeStatus } from "../models/enum";

export const CreateInvoice = t.Object({
    house_id: t.String({ format: "uuid" }),
    period_month: t.Number(),
    period_year: t.Number(),
    total_amount: t.Numeric({ precision: 12, scale: 2 }),
    due_date: t.Date(),
    invoice_type: t.Number(),
    notes: t.Optional(t.String()),
    created_by: t.String({ format: "uuid" }),
});

export const UpdateInvoice = t.Object({
    house_id: t.Optional(t.String({ format: "uuid" })),
    period_month: t.Optional(t.Number()),
    period_year: t.Optional(t.Number()),
    total_amount: t.Optional(t.Numeric({ precision: 12, scale: 2 })),
    due_date: t.Optional(t.Date()),
    invoice_type: t.Optional(t.Number()),
    notes: t.Optional(t.String()),
    status: t.Optional(enumToTypeBox(FeeStatus.enumValues)),
    paid_at: t.Optional(t.Date()),
    confirmed_by: t.Optional(t.String({ format: "uuid" })),
})