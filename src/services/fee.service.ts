import { InvoiceFormValues } from "../schemas/invoice.schema";

export const feeService = {
  checkExistingInvoice: async (houseId: string, month: number, year: number) => {
    console.log(`Đang kiểm tra hóa đơn cho căn hộ ${houseId} kỳ ${month}/${year}`);
    return false; 
  },

  createInvoice: async (data: InvoiceFormValues) => {
    return { success: true, message: "Ghi nhận hóa đơn thành công!" };
  }
};