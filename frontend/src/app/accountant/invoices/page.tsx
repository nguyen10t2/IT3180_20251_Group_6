'use client';

import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  DataTable, 
  SearchInput,
  Loading,
  StatusBadge,
  Button,
  Select,
  Modal,
  Input,
  Textarea,
} from '@/components/ui';
import { invoiceService, houseService } from '@/services';
import { QUERY_KEYS } from '@/config/constants';
import { useSearch, usePagination, useSort } from '@/hooks';
import { formatDate, formatCurrency } from '@/utils/helpers';
import type { InvoiceWithDetails, TableColumn, CreateInvoiceRequest, InvoiceType } from '@/types';
import { toast } from 'sonner';

type InvoiceStatus = 'all' | 'paid' | 'pending' | 'overdue';

const STATUS_TABS = [
  { key: 'all' as InvoiceStatus, label: 'Tất cả' },
  { key: 'paid' as InvoiceStatus, label: 'Đã thanh toán' },
  { key: 'pending' as InvoiceStatus, label: 'Chưa thanh toán' },
  { key: 'overdue' as InvoiceStatus, label: 'Quá hạn' },
] as const;

interface InvoiceFormData {
  house_id: string;
  period_month: number;
  period_year: number;
  total_amount: string;
  due_date: string;
  invoice_types: number;
  notes: string;
}

export default function AccountantInvoicesPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = React.useState<InvoiceStatus>('all');
  const [houseFilter, setHouseFilter] = React.useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [selectedInvoice, setSelectedInvoice] = React.useState<InvoiceWithDetails | null>(null);
  const [confirmingInvoice, setConfirmingInvoice] = React.useState<InvoiceWithDetails | null>(null);
  const [confirmForm, setConfirmForm] = React.useState({ paidAmount: '', paymentNote: '' });
  const [formData, setFormData] = React.useState<InvoiceFormData>({
    house_id: '',
    period_month: new Date().getMonth() + 1,
    period_year: new Date().getFullYear(),
    total_amount: '',
    due_date: '',
    invoice_types: 1,
    notes: '',
  });

  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: [QUERY_KEYS.invoices, 'accountant'],
    queryFn: () => invoiceService.getAllInvoices(),
  });

  const { data: houses = [], isLoading: housesLoading } = useQuery({
    queryKey: [QUERY_KEYS.houses],
    queryFn: houseService.getAllHousesAccountant,
  });

  const { data: invoiceTypes = [], isLoading: invoiceTypesLoading } = useQuery({
    queryKey: [QUERY_KEYS.invoices, 'types'],
    queryFn: invoiceService.getInvoiceTypes,
  });

  React.useEffect(() => {
    if (!invoiceTypesLoading && invoiceTypes.length > 0 && !formData.invoice_types) {
      setFormData((prev) => ({ ...prev, invoice_types: invoiceTypes[0].id }));
    }
  }, [invoiceTypesLoading, invoiceTypes, formData.invoice_types]);

  React.useEffect(() => {
    if (isCreateDialogOpen && houses.length > 0 && !formData.house_id) {
      setFormData((prev) => ({ ...prev, house_id: houses[0].id }));
    }
  }, [isCreateDialogOpen, houses, formData.house_id]);

  const deleteMutation = useMutation({
    mutationFn: invoiceService.deleteInvoice,
    onSuccess: () => {
      toast.success('Đã xóa hóa đơn');
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.invoices, 'accountant'] });
    },
    onError: (error) => toast.error(`Xóa hóa đơn thất bại: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateInvoiceRequest) => invoiceService.createInvoice(data),
    onSuccess: () => {
      toast.success('Tạo hóa đơn thành công');
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.invoices, 'accountant'] });
      setIsCreateDialogOpen(false);
      setFormData({
        house_id: '',
        period_month: new Date().getMonth() + 1,
        period_year: new Date().getFullYear(),
        total_amount: '',
        due_date: '',
        invoice_types: invoiceTypes?.[0]?.id ?? 0,
        notes: '',
      });
    },
    onError: (error: any) => {
      toast.error(`Tạo hóa đơn thất bại: ${error?.message || 'Lỗi không xác định'}`);
    },
  });

  const confirmMutation = useMutation({
    mutationFn: ({ id, paidAmount, paymentNote }: { id: string; paidAmount?: string; paymentNote?: string; }) =>
      invoiceService.confirmInvoice(id, { paidAmount, paymentNote }),
    onSuccess: () => {
      toast.success('Đã xác nhận thanh toán');
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.invoices, 'accountant'] });
      setConfirmingInvoice(null);
      setConfirmForm({ paidAmount: '', paymentNote: '' });
    },
    onError: (error: any) => {
      toast.error(`Xác nhận thanh toán thất bại: ${error?.message || 'Lỗi không xác định'}`);
    },
  });

  // Filter by status
  const statusFilteredData = React.useMemo(() => {
    const now = new Date();
    return invoices.filter((invoice) => {
      if (statusFilter === 'all') return true;
      if (statusFilter === 'paid') return invoice.paid_at !== null;
      if (statusFilter === 'pending') return invoice.paid_at === null && new Date(invoice.due_date) >= now;
      if (statusFilter === 'overdue') return invoice.paid_at === null && new Date(invoice.due_date) < now;
      return true;
    });
  }, [invoices, statusFilter]);

  // Filter by house
  const houseFilteredData = React.useMemo(() => {
    if (houseFilter === 'all') return statusFilteredData;
    return statusFilteredData.filter((invoice) => invoice.house_id === houseFilter);
  }, [statusFilteredData, houseFilter]);

  const { searchTerm, setSearchTerm, filteredData } = useSearch(houseFilteredData, [
    'invoice_number',
  ]);

  const { sortedData, sortConfig, requestSort } = useSort(filteredData);

  const { data: paginatedData, ...pagination } = usePagination(sortedData, {
    initialLimit: 10,
  });

  // Calculate status counts
  const getStatusCount = (status: InvoiceStatus) => {
    const now = new Date();
    switch (status) {
      case 'all':
        return invoices.length;
      case 'paid':
        return invoices.filter((i) => i.paid_at !== null).length;
      case 'pending':
        return invoices.filter((i) => i.paid_at === null && new Date(i.due_date) >= now).length;
      case 'overdue':
        return invoices.filter((i) => i.paid_at === null && new Date(i.due_date) < now).length;
    }
  };

  const columns: TableColumn<InvoiceWithDetails>[] = [
    {
      key: 'invoice_number',
      label: 'Số hóa đơn',
      sortable: true,
    },
    {
      key: 'house',
      label: 'Căn hộ',
      render: (_, row) => {
        // Try to find house from houses array if not in invoice data
        const houseData = row.house || houses.find(h => h.id === row.house_id);
        return houseData?.room_number || 'N/A';
      },
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
    {
      key: 'actions',
      label: 'Hành động',
      width: '120px',
      render: (_, row) => (
        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          {row.status !== 'paid' && (
            <Button
              variant="secondary"
              size="sm"
              disabled={confirmMutation.isPending}
              onClick={() => {
                setConfirmingInvoice(row);
                setConfirmForm({ paidAmount: row.total_amount ?? '', paymentNote: '' });
              }}
            >
              Xác nhận
            </Button>
          )}
          <Button
            variant="destructive"
            size="sm"
            disabled={deleteMutation.isPending}
            onClick={() => {
              if (!row.id) return;
              if (!confirm('Xác nhận xóa hóa đơn này?')) return;
              deleteMutation.mutate(row.id);
            }}
          >
            Xóa
          </Button>
        </div>
      ),
    },
  ];

  if (invoicesLoading || housesLoading) {
    return <Loading text="Đang tải dữ liệu..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Quản lý hóa đơn</h1>
          <p className="text-muted-foreground mt-1">
            Tạo và quản lý hóa đơn cho các căn hộ
          </p>
        </div>
        <Button
          onClick={() => {
            // Reset form when opening modal and auto-fill defaults
            setFormData({
              house_id: houses[0]?.id ?? '',
              period_month: new Date().getMonth() + 1,
              period_year: new Date().getFullYear(),
              total_amount: '',
              due_date: '',
              invoice_types: invoiceTypes?.[0]?.id ?? 0,
              notes: '',
            });
            setIsCreateDialogOpen(true);
          }}
          disabled={createMutation.isPending}
        >
          + Tạo hóa đơn
        </Button>
      </div>

      {/* Invoice Creation Modal */}
      <Modal
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        title="Tạo hóa đơn mới"
        size="md"
        footer={
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              onClick={() => {
                if (!formData.house_id || !formData.total_amount || !formData.due_date || !formData.invoice_types) {
                  toast.error('Vui lòng điền tất cả các trường bắt buộc');
                  return;
                }
                createMutation.mutate({
                  house_id: formData.house_id,
                  period_month: formData.period_month,
                  period_year: formData.period_year,
                  total_amount: formData.total_amount,
                  due_date: formData.due_date,
                  invoice_types: formData.invoice_types,
                  notes: formData.notes || undefined,
                });
              }}
              disabled={createMutation.isPending}
              className="flex-1"
            >
              {createMutation.isPending ? 'Đang tạo...' : 'Tạo'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Căn hộ *</label>
            <Select
              value={formData.house_id}
              onChange={(e) => setFormData({ ...formData, house_id: e.target.value })}
              options={houses.map((house) => ({
                label: `Phòng ${house.room_number}`,
                value: house.id,
              }))}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Tháng *</label>
              <Input
                type="number"
                min="1"
                max="12"
                value={formData.period_month}
                onChange={(e) =>
                  setFormData({ ...formData, period_month: parseInt(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Năm *</label>
              <Input
                type="number"
                min="2020"
                value={formData.period_year}
                onChange={(e) =>
                  setFormData({ ...formData, period_year: parseInt(e.target.value) })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Loại hóa đơn *</label>
            <Select
              value={formData.invoice_types}
              onChange={(e) => setFormData({ ...formData, invoice_types: Number(e.target.value) })}
              options={invoiceTypes.length > 0
                ? invoiceTypes.map((type: InvoiceType) => ({ label: type.name, value: type.id }))
                : [{ label: invoiceTypesLoading ? 'Đang tải...' : 'Chưa có loại hóa đơn', value: '', disabled: true }]}
              disabled={invoiceTypesLoading || invoiceTypes.length === 0}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Số tiền *</label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.total_amount}
              onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Hạn thanh toán *</label>
            <Input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Ghi chú</label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Ghi chú thêm..."
              className="h-20"
            />
          </div>
        </div>
      </Modal>

      {/* Status Filter Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STATUS_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`p-3 rounded-lg border-2 transition-all ${
              statusFilter === key
                ? 'border-primary bg-primary text-white'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="text-sm font-medium">{label}</div>
            <div className="text-2xl font-bold mt-1">{getStatusCount(key)}</div>
          </button>
        ))}
      </div>

      {/* Statistics by House */}
      <Card>
        <CardHeader>
          <CardTitle>Thống kê theo căn hộ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            Xem tại <a href="/accountant/reports" className="text-primary hover:underline">Báo cáo</a>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <Card>
        <CardHeader>
          <CardTitle>Thống kê</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            Xem tại <a href="/accountant/reports" className="text-primary hover:underline">Báo cáo</a>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <CardTitle className="flex-1">Danh sách hóa đơn ({houseFilteredData.length})</CardTitle>
            <div className="flex flex-col md:flex-row gap-3 md:w-auto">
              <Select
                value={houseFilter}
                onChange={(e) => setHouseFilter(e.target.value)}
                options={[
                  { label: 'Tất cả căn hộ', value: 'all' },
                  ...houses.map((house) => ({
                    label: `Phòng ${house.room_number}`,
                    value: house.id,
                  })),
                ]}
              />
              <SearchInput
                placeholder="Tìm số hóa đơn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {paginatedData.length > 0 ? (
            <DataTable
              data={paginatedData}
              columns={columns}
              onSort={requestSort}
              sortField={sortConfig?.field}
              sortOrder={sortConfig?.order}
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={pagination.goToPage}
              onRowClick={(row) => setSelectedInvoice(row)}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Không có hóa đơn nào phù hợp với bộ lọc
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Detail Modal */}
      <Modal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        title={`Chi tiết hóa đơn ${selectedInvoice?.invoice_number}`}
        size="lg"
      >
        {selectedInvoice && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Số hóa đơn</label>
                <p className="font-medium">{selectedInvoice.invoice_number}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Căn hộ</label>
                <p className="font-medium">
                  {selectedInvoice.house?.room_number || 
                   houses.find(h => h.id === selectedInvoice.house_id)?.room_number ||
                   'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Kỳ thanh toán</label>
                <p className="font-medium">{selectedInvoice.period_month}/{selectedInvoice.period_year}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Tổng tiền</label>
                <p className="font-medium text-lg text-green-600">{formatCurrency(selectedInvoice.total_amount)}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Trạng thái</label>
                <p className="mt-1">
                  <StatusBadge status={selectedInvoice.status} type="fee" />
                </p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Hạn thanh toán</label>
                <p className="font-medium">{formatDate(selectedInvoice.due_date)}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Đã thanh toán</label>
                <p className="font-medium text-lg">
                  {selectedInvoice.paid_at 
                    ? formatCurrency(selectedInvoice.paid_amount || selectedInvoice.total_amount)
                    : formatCurrency('0')}
                </p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Ngày thanh toán</label>
                <p className="font-medium">{selectedInvoice.paid_at ? formatDate(selectedInvoice.paid_at) : 'Chưa thanh toán'}</p>
              </div>
            </div>
            
            {selectedInvoice.notes && (
              <div>
                <label className="text-sm text-muted-foreground">Ghi chú</label>
                <p className="font-medium mt-1">{selectedInvoice.notes}</p>
              </div>
            )}

            {selectedInvoice.payment_note && (
              <div>
                <label className="text-sm text-muted-foreground">Ghi chú thanh toán</label>
                <p className="font-medium mt-1">{selectedInvoice.payment_note}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={!!confirmingInvoice}
        onClose={() => {
          setConfirmingInvoice(null);
          setConfirmForm({ paidAmount: '', paymentNote: '' });
        }}
        title={`Xác nhận thanh toán ${confirmingInvoice?.invoice_number ?? ''}`}
        size="md"
        footer={
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setConfirmingInvoice(null);
                setConfirmForm({ paidAmount: '', paymentNote: '' });
              }}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              onClick={() => {
                if (!confirmingInvoice?.id) return;
                confirmMutation.mutate({
                  id: confirmingInvoice.id,
                  paidAmount: confirmForm.paidAmount || undefined,
                  paymentNote: confirmForm.paymentNote || undefined,
                });
              }}
              disabled={confirmMutation.isPending}
              className="flex-1"
            >
              {confirmMutation.isPending ? 'Đang xác nhận...' : 'Xác nhận'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Tổng tiền</p>
            <p className="font-semibold">{formatCurrency(String(confirmingInvoice?.total_amount ?? 0))}</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Số tiền đã thanh toán</label>
            <Input
              type="number"
              step="0.01"
              value={confirmForm.paidAmount}
              onChange={(e) => setConfirmForm({ ...confirmForm, paidAmount: e.target.value })}
              placeholder="Mặc định sẽ dùng tổng tiền nếu bỏ trống"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ghi chú thanh toán</label>
            <Textarea
              value={confirmForm.paymentNote}
              onChange={(e) => setConfirmForm({ ...confirmForm, paymentNote: e.target.value })}
              placeholder="Ví dụ: Chuyển khoản, tiền mặt..."
              className="h-20"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
