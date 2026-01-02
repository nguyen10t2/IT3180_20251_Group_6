import { apiClient } from '@/lib/api-client';
import type {
  Invoice,
  InvoiceWithDetails,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  ConfirmInvoiceRequest,
  ApiResponse,
} from '@/types';

export const invoiceService = {
  // Get all invoices (accountant)
  getAllInvoices: async (): Promise<InvoiceWithDetails[]> => {
    const response = await apiClient.get<{ invoices: InvoiceWithDetails[] }>('/accountants/invoices');
    return response.data.invoices;
  },

  // Get invoice by ID (accountant)
  getInvoiceById: async (id: string): Promise<InvoiceWithDetails> => {
    const response = await apiClient.get<{ invoice: InvoiceWithDetails }>(`/accountants/invoices/${id}`);
    return response.data.invoice;
  },

  // Create invoice (accountant)
  createInvoice: async (data: CreateInvoiceRequest): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/accountants/invoices', data);
    return response.data;
  },

  // Update invoice (accountant)
  updateInvoice: async (id: string, data: UpdateInvoiceRequest): Promise<ApiResponse> => {
    const response = await apiClient.patch<ApiResponse>(`/accountants/invoices/${id}`, data);
    return response.data;
  },

  // Delete invoice (accountant)
  deleteInvoice: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.delete<ApiResponse>(`/accountants/invoices/${id}`);
    return response.data;
  },

  // Confirm invoice payment (accountant)
  confirmInvoice: async (id: string, data: ConfirmInvoiceRequest): Promise<ApiResponse> => {
    const response = await apiClient.patch<ApiResponse>(`/accountants/invoices/${id}/confirm`, data);
    return response.data;
  },

  // Get resident invoices
  getResidentInvoices: async (): Promise<Invoice[]> => {
    const response = await apiClient.get<{ invoices: Invoice[] }>('/invoices');
    return response.data.invoices;
  },

  // Get resident invoice details
  getResidentInvoiceById: async (id: string): Promise<InvoiceWithDetails> => {
    const response = await apiClient.get<{ invoiceDetails: InvoiceWithDetails }>(`/invoices/${id}`);
    return response.data.invoiceDetails;
  },
};
