// ==================== Common Types ====================

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface FilterParams {
  status?: string;
  role?: string;
  type?: string;
  priority?: string;
  startDate?: string;
  endDate?: string;
}

export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}

export interface SearchParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  sort?: SortParams;
  status?: string;
  role?: string;
  type?: string;
  priority?: string;
  startDate?: string;
  endDate?: string;
}

export interface ErrorResponse {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface DashboardStats {
  totalHouses: number;
  totalResidents: number;
  totalUsers: number;
  pendingUsers: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  totalRevenue: string;
  pendingFeedbacks: number;
  resolvedFeedbacks: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
