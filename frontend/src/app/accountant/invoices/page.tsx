'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  DataTable, 
  SearchInput,
  Loading,
  StatusBadge,
} from '@/components/ui';
import { invoiceService } from '@/services';
import { QUERY_KEYS } from '@/config/constants';
import { useSearch, usePagination, useSort } from '@/hooks';
import { formatDate, formatCurrency } from '@/utils/helpers';
import type { InvoiceWithDetails, TableColumn } from '@/types';

export default function AccountantInvoicesPage() {
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: [QUERY_KEYS.invoices, 'accountant'],
    queryFn: () => invoiceService.getAllInvoices(),
  });

  const { searchTerm, setSearchTerm, filteredData } = useSearch(invoices, [
    'invoice_number',
  ]);

  const { sortedData, sortConfig, requestSort } = useSort(filteredData);

  const { data: paginatedData, ...pagination } = usePagination(sortedData, {
    initialLimit: 10,
  });

  const columns: TableColumn<InvoiceWithDetails>[] = [
    {
      key: 'invoice_number',
      label: 'Số hóa đơn',
      sortable: true,
    },
    {
      key: 'house',
      label: 'Căn hộ',
      render: (_, row) => row.house?.room_number || 'N/A',
    },
    {
      key: 'period_month',
      label: 'Kỳ',
      render: (_, row) => `${row.period_month}/${row.period_year}`,
    },
    {
      key: 'total_amount',
      label: 'Tổng tiền',
      sortable: true,
      render: (value) => formatCurrency(String(value)),
      align: 'right',
    },
    {
      key: 'status',
      label: 'Trạng thái',
      sortable: true,
      render: (value) => <StatusBadge status={String(value)} type="fee" />,
    },
    {
      key: 'due_date',
      label: 'Hạn thanh toán',
      sortable: true,
      render: (value) => formatDate(String(value)),
    },
  ];

  if (isLoading) {
    return <Loading text="Đang tải danh sách hóa đơn..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quản lý hóa đơn</h1>
        <p className="text-muted-foreground mt-1">
          Tạo và quản lý hóa đơn cho các căn hộ
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Danh sách hóa đơn ({invoices.length})</CardTitle>
            <SearchInput
              placeholder="Tìm kiếm theo số hóa đơn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:w-80"
            />
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={paginatedData}
            columns={columns}
            onSort={requestSort}
            sortField={sortConfig?.field}
            sortOrder={sortConfig?.order}
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={pagination.goToPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
