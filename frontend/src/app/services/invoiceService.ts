import axiosInstance from "@/lib/axios";

export interface Invoice {
  invoice_id: string;
  invoice_number: string;
  house_hold_id: string;
  room_number: string;
  period_month: number;
  period_year: number;
  total_amount: string;
  status: "pending" | "paid" | "overdue" | "cancelled";
  due_date: string;
  paid_at: string | null;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
}

export interface InvoiceItem {
  item_id: string;
  invoice_id: string;
  fee_type_id: string;
  fee_name: string;
  category: string;
  description: string;
  quantity: number;
  unit_price: string;
  amount: string;
  previous_reading: number | null;
  current_reading: number | null;
}

export const invoiceService = {
  // Lấy danh sách hóa đơn
  async getInvoices(): Promise<{ invoices: Invoice[] }> {
    const response = await axiosInstance.get("/api/invoices");
    return response.data;
  },

  // Lấy chi tiết hóa đơn
  async getInvoiceDetails(invoice_id: string): Promise<{ invoice: Invoice; items: InvoiceItem[] }> {
    const response = await axiosInstance.get(`/api/invoices/${invoice_id}`);
    return response.data;
  },

  // Thanh toán hóa đơn
  async payInvoice(invoice_id: string, payment_method?: string): Promise<{ message: string; invoice: Invoice }> {
    const response = await axiosInstance.post(`/api/invoices/${invoice_id}/pay`, {
      payment_method: payment_method || "bank_transfer",
    });
    return response.data;
  },
};
