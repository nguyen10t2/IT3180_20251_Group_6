import { z } from 'zod';

export const invoiceSchema = z.object({
  house_id: z.string().uuid("Vui lòng chọn căn hộ hợp lệ"), 
  total_amount: z.coerce.number()
    .min(1000, "Số tiền tối thiểu 1.000đ")
    .nonnegative("Số tiền không được âm"),
  period_month: z.number().min(1).max(12),
  period_year: z.number().min(2024),
  notes: z.string().optional(),
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;