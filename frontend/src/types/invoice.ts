// ==================== Invoice Types ====================

export interface Invoice {
  id: string;
  invoice_number: string;
  house_id: string | null;
  period_month: number;
  period_year: number;
  invoice_types: number | null;
  total_amount: string;
  status: string;
  due_date: string;
  paid_at: string | null;
  paid_amount: string | null;
  payment_note: string | null;
  confirmed_by: string | null;
  notes: string | null;
  deleted_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceWithDetails extends Invoice {
  house?: House | null;
  invoice_type?: InvoiceType | null;
  details?: InvoiceDetail[];
  creator?: User | null;
  confirmer?: User | null;
}

export interface InvoiceDetail {
  id: string;
  invoice_id: string;
  fee_type_id: number;
  description: string;
  unit_price: string;
  quantity: string;
  amount: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceType {
  id: number;
  name: string;
  description: string | null;
  is_required: boolean;
  created_at: string;
  updated_at: string;
}

export interface FeeType {
  id: number;
  name: string;
  category: string;
  unit_price: string;
  unit: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateInvoiceRequest {
  house_id: string;
  period_month: number;
  period_year: number;
  invoice_types: number;
  total_amount: string;
  due_date: string;
  notes?: string;
  details?: CreateInvoiceDetailRequest[];
}

export interface CreateInvoiceDetailRequest {
  fee_type_id: number;
  description: string;
  unit_price: string;
  quantity: string;
  amount: string;
  notes?: string;
}

export interface UpdateInvoiceRequest {
  house_id?: string;
  period_month?: number;
  period_year?: number;
  invoice_types?: number;
  total_amount?: string;
  status?: string;
  due_date?: string;
  notes?: string;
}

export interface ConfirmInvoiceRequest {
  paidAmount?: string;
  paymentNote?: string;
}

// Import necessary types
import type { House } from './house';
import type { User } from './user';
