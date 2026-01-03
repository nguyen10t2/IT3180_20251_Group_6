'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  DataTable,
  Loading,
  StatusBadge,
  Badge,
  Modal,
} from '@/components/ui';
import { invoiceService } from '@/services';
import { QUERY_KEYS, ROUTES } from '@/config/constants';
import { formatDate, formatCurrency } from '@/utils/helpers';
import type { Invoice, TableColumn } from '@/types';
import { useAuth } from '@/hooks';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function ResidentInvoicesPage() {
  const { user } = useAuth();
  const status = user?.status;
  const isActive = status === 'active';

  const [sortField, setSortField] = React.useState<string>('created_at');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');
  const [selectedInvoiceId, setSelectedInvoiceId] = React.useState<string | null>(null);

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: [QUERY_KEYS.residentInvoices],
    queryFn: invoiceService.getResidentInvoices,
    staleTime: 30000,
    enabled: isActive,
  });

  const { data: invoiceDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: [QUERY_KEYS.residentInvoices, selectedInvoiceId],
    queryFn: () => invoiceService.getResidentInvoiceById(selectedInvoiceId!),
    enabled: !!selectedInvoiceId && isActive,
  });

  const handleSort = React.useCallback((field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  }, [sortField, sortOrder]);

  const columns: TableColumn<Invoice>[] = [
    {
      key: 'invoice_number',
      label: 'Mã hóa đơn',
      sortable: true,
    },
    {
      key: 'total_amount',
      label: 'Số tiền',
      sortable: true,
      render: (value) => (
        <span className="font-medium">
          {formatCurrency(Number(value))}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      sortable: true,
      render: (value, row) => (
        <StatusBadge 
          status={(row as Invoice).paid_at ? 'paid' : String(value)} 
          type="invoice" 
        />
      ),
    },
    {
      key: 'due_date',
      label: 'Hạn thanh toán',
      sortable: true,
      render: (value) => formatDate(String(value)),
    },
    {
      key: 'paid_at',
      label: 'Ngày thanh toán',
      render: (value) => value ? formatDate(String(value)) : '-',
    },
  ];

  if (!isActive) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Hóa đơn của tôi</h1>
        {status === 'pending' ? (
          <p className="text-muted-foreground">Thông tin cư dân đang chờ quản lý xác thực. Vui lòng đợi phê duyệt để xem hóa đơn.</p>
        ) : (
          <div className="space-y-2">
            <p className="text-muted-foreground">Tài khoản chưa kích hoạt. Vui lòng đăng ký cư dân để xem hóa đơn.</p>
            <Link href={ROUTES.RESIDENT.PROFILE} className="inline-block">
              <Button>Đăng ký cư dân</Button>
            </Link>
          </div>
        )}
      </div>
    );
  }

  if (isLoading) {
    return <Loading text="Đang tải danh sách hóa đơn..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Hóa đơn của tôi</h1>
        <p className="text-muted-foreground mt-1">
          Danh sách hóa đơn và lịch sử thanh toán
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Danh sách hóa đơn ({invoices.length})</CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline">
                Chưa thanh toán: {invoices.filter(i => i.status === 'unpaid').length}
              </Badge>
              <Badge variant="outline">
                Đã thanh toán: {invoices.filter(i => i.status === 'paid').length}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {invoices.length > 0 ? (
            <DataTable
              data={invoices}
              columns={columns}
              onSort={handleSort}
              sortField={sortField}
              sortOrder={sortOrder}
              onRowClick={(row) => setSelectedInvoiceId(row.id)}
              rowClassName={() => 'cursor-pointer hover:bg-muted/50'}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Chưa có hóa đơn nào</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={!!selectedInvoiceId}
        onClose={() => setSelectedInvoiceId(null)}
        title="Chi tiết hóa đơn"
        size="lg"
      >
        {isLoadingDetails ? (
          <div className="flex justify-center py-8">
            <Loading text="Đang tải chi tiết..." />
          </div>
        ) : invoiceDetails ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Mã hóa đơn</p>
                <p className="font-medium">{invoiceDetails.invoice_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Trạng thái</p>
                <StatusBadge 
                  status={invoiceDetails.paid_at ? 'paid' : invoiceDetails.status} 
                  type="invoice" 
                />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Kỳ thu</p>
                <p className="font-medium">Tháng {invoiceDetails.period_month}/{invoiceDetails.period_year}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hạn thanh toán</p>
                <p className="font-medium">{formatDate(invoiceDetails.due_date)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng tiền</p>
                <p className="font-bold text-lg text-primary">
                  {formatCurrency(Number(invoiceDetails.total_amount))}
                </p>
              </div>
              {invoiceDetails.paid_at && (
                <div>
                  <p className="text-sm text-muted-foreground">Ngày thanh toán</p>
                  <p className="font-medium">{formatDate(invoiceDetails.paid_at)}</p>
                </div>
              )}
            </div>

            {invoiceDetails.notes && (
              <div>
                <p className="text-sm text-muted-foreground">Ghi chú</p>
                <p className="text-sm">{invoiceDetails.notes}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Không tìm thấy thông tin hóa đơn
          </div>
        )}
      </Modal>
    </div>
  );
}
