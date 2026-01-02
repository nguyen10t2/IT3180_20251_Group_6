import { t } from "elysia";
import { enumToTypeBox } from "../helpers/enumHelper";
import { fee_status } from "../models/pgEnum";

export const CreateInvoiceBody = t.Object({
    house_id: t.String({ format: "uuid", error: 'Không được để trống ID hộ dân' }),
    period_month: t.Number({error: 'Không được để trống tháng của kỳ thanh toán'}),
    period_year: t.Number({error: 'Không được để trống năm của kỳ thanh toán'}),
    total_amount: t.String({error: 'Không được để trống số tiền của hóa đơn' }),
    due_date: t.Date({error: 'Không được để trống hạn thanh toán hóa đơn'}),
    invoice_type: t.Number({error: 'Không được để trống loại hóa đơn'}),
    notes: t.Optional(t.String()),
    created_by: t.String({ format: "uuid", error: 'Không được để trống người tạo hóa đơn' }),
});

export const UpdateInvoiceBody = t.Object({
    house_id: t.Optional(t.String({ format: "uuid" })),
    period_month: t.Optional(t.Number()),
    period_year: t.Optional(t.Number()),
    total_amount: t.Optional(t.String()),
    due_date: t.Optional(t.Date()),
    invoice_type: t.Optional(t.Number()),
    notes: t.Optional(t.String()),
    status: t.Optional(enumToTypeBox(fee_status.enumValues)),
    paid_at: t.Optional(t.Date()),
    confirmed_by: t.Optional(t.String({ format: "uuid" })),
});

export const ConfirmInvoiceBody = t.Optional(
    t.Object({
        paidAmount: t.Optional(t.String({ error: 'Số tiền đã thanh toán không hợp lệ' })),
          paymentNote: t.Optional(t.String({ error: 'Ghi chú thanh toán không hợp lệ' }))
    })
);