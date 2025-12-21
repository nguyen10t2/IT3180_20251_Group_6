import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { invoiceSchema, type InvoiceFormValues } from "../schemas/invoice.schema";
import { feeService } from "../services/fee.service";
import { useState } from "react";

export const useInvoiceForm = () => {
  const [loading, setLoading] = useState(false);

  const form = useForm<InvoiceFormValues>({
    // Ép kiểu 'as any' để TypeScript chấp nhận Resolver mà không cần kiểm tra sâu
    resolver: zodResolver(invoiceSchema) as any,
    defaultValues: {
      house_id: "", 
      total_amount: 0,
      period_month: new Date().getMonth() + 1,
      period_year: new Date().getFullYear(),
      notes: ""
    } as InvoiceFormValues,
  });

  const onSubmit = async (data: InvoiceFormValues) => {
    setLoading(true);
    try {
      await feeService.createInvoice(data);
      alert("Ghi nhận hóa đơn thành công!");
    } catch (error) {
      alert("Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  return { form, onSubmit: form.handleSubmit(onSubmit), loading };
};