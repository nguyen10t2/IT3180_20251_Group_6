import { z } from 'zod';

export const transactionSchema = z.object({
  //Check mã dân
  residentId: z.string().min(1, "Mã người đóng tiền không được để trống"),
  
  //Check xem thu tiền hợp lí chưa
  feeId: z.string().min(1, "Vui lòng nhập khoản nộp hợp lí!"),
  
  //Check xem đúng tiền không
  amount: z.coerce.number({ message: "Số tiền phải là một con số" })
    .min(1000, "Số tiền nộp quá nhỏ (tối thiểu 1.000đ)")
    .nonnegative("Số tiền không được là số âm"),
    
  paymentDate: z.string().min(1, "Vui lòng chọn ngày thu"),
//Note để ghi chú nếu cần
  note: z.string().optional(),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;