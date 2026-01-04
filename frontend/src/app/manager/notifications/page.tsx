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
  Badge,
  Modal,
  Pagination,
  Button,
} from '@/components/ui';
import { notificationService, houseService } from '@/services';
import { QUERY_KEYS } from '@/config/constants';
import { formatDate, getErrorMessage } from '@/utils/helpers';
import { NOTIFICATION_TYPE_LABELS } from '@/utils/labels';
import type { NotificationWithRelations, TableColumn } from '@/types';
import { toast } from 'sonner';

export default function NotificationsPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortField, setSortField] = React.useState<string>('created_at');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage] = React.useState(10);
  const [selectedNotification, setSelectedNotification] = React.useState<NotificationWithRelations | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({
    title: '',
    content: '',
    type: 'general',
    target: 'all',
    target_id: '',
    is_pinned: false,
    scheduled_at: '',
    expires_at: '',
  });

  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: [QUERY_KEYS.notifications],
    queryFn: () => notificationService.getAllNotifications('manager'),
    staleTime: 30000,
  });

  const { data: houses = [] } = useQuery({
    queryKey: [QUERY_KEYS.houses],
    queryFn: () => houseService.getAllHousesManager(),
    staleTime: 60000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationService.deleteNotification(id, 'manager'),
    onSuccess: () => {
      toast.success('Đã xóa thông báo');
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.notifications] });
    },
    onError: (error: unknown) => {
      console.error(error);
      toast.error(`Xóa thông báo thất bại: ${getErrorMessage(error)}`);
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => notificationService.createNotification(data, 'manager'),
    onSuccess: () => {
      toast.success('Tạo thông báo thành công');
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.notifications] });
      setIsCreateModalOpen(false);
      setFormData({
        title: '',
        content: '',
        type: 'general',
        target: 'all',
        target_id: '',
        is_pinned: false,
        scheduled_at: '',
        expires_at: '',
      });
    },
    onError: (error: unknown) => {
      console.error(error);
      toast.error(`Tạo thông báo thất bại: ${getErrorMessage(error)}`);
    },
  });

  // Filter
  const filteredData = React.useMemo(() => {
    if (!searchTerm) return notifications;
    const lowerSearch = searchTerm.toLowerCase();
    return notifications.filter((n) =>
      n.title.toLowerCase().includes(lowerSearch) ||
      n.content.toLowerCase().includes(lowerSearch)
    );
  }, [notifications, searchTerm]);

  // Sort
  const sortedData = React.useMemo(() => {
    const sorted = [...filteredData];
    sorted.sort((a, b) => {
      const aValue = a[sortField as keyof NotificationWithRelations];
      const bValue = b[sortField as keyof NotificationWithRelations];

      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredData, sortField, sortOrder]);

  // Paginate
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const handleSort = React.useCallback((field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  }, [sortField, sortOrder]);

  const handleRowClick = React.useCallback((notification: NotificationWithRelations) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
  }, []);

  const handleCreateSubmit = React.useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Vui lòng nhập tiêu đề và nội dung');
      return;
    }
    if (formData.target === 'household' && !formData.target_id) {
      toast.error('Vui lòng chọn hộ gia đình');
      return;
    }
    
    // Chuẩn bị data để submit
    const { target_id, ...rest } = formData;
    const submitData = formData.target === 'all' 
      ? rest
      : { ...rest, target_id };
    
    createMutation.mutate(submitData as any);
  }, [formData, createMutation]);

  const columns: TableColumn<NotificationWithRelations>[] = [
    {
      key: 'title',
      label: 'Tiêu đề',
      sortable: true,
      width: '30%',
    },
    {
      key: 'type',
      label: 'Loại',
      render: (value) => (
        <Badge variant="secondary">
          {NOTIFICATION_TYPE_LABELS[value as keyof typeof NOTIFICATION_TYPE_LABELS] || value}
        </Badge>
      ),
    },
    {
      key: 'target',
      label: 'Đối tượng',
      render: (value) => {
        const labels: Record<string, string> = {
          all: 'Tất cả',
          household: 'Hộ gia đình',
          individual: 'Cá nhân',
        };
        return <Badge variant="outline">{labels[String(value)] || value}</Badge>;
      },
    },
    {
      key: 'is_pinned',
      label: 'Ghim',
      render: (value) => (
        value ? <Badge>Đã ghim</Badge> : <span className="text-muted-foreground">-</span>
      ),
    },
    {
      key: 'published_at',
      label: 'Ngày phát hành',
      sortable: true,
      render: (value) => value ? formatDate(String(value)) : 'Chưa phát hành',
    },
    {
      key: 'created_at',
      label: 'Ngày tạo',
      sortable: true,
      render: (value) => formatDate(String(value)),
    },
    {
      key: 'actions',
      label: 'Hành động',
      width: '120px',
      render: (_, row) => (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="destructive"
            size="sm"
            disabled={deleteMutation.isPending}
            onClick={() => {
              if (!row.id) return;
              if (!confirm('Xác nhận xóa thông báo này?')) return;
              deleteMutation.mutate(row.id);
            }}
          >
            Xóa
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <Loading text="Đang tải danh sách thông báo..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quản lý thông báo</h1>
        <p className="text-muted-foreground mt-1">
          Tạo và quản lý thông báo cho cư dân
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Danh sách thông báo ({notifications.length})</CardTitle>
            <div className="flex items-center gap-3">
              <SearchInput
                placeholder="Tìm kiếm theo tiêu đề, nội dung..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="md:w-80"
              />
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="whitespace-nowrap"
              >
                + Tạo thông báo
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={paginatedData}
            columns={columns}
            onSort={handleSort}
            sortField={sortField}
            sortOrder={sortOrder}
            onRowClick={handleRowClick}
          />
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Chi tiết thông báo"
      >
        {selectedNotification && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Tiêu đề</label>
              <p className="mt-1 text-lg font-semibold">{selectedNotification.title}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Nội dung</label>
              <p className="mt-1 whitespace-pre-wrap">{selectedNotification.content}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Loại thông báo</label>
                <Badge variant="secondary" className="mt-1">
                  {NOTIFICATION_TYPE_LABELS[selectedNotification.type as keyof typeof NOTIFICATION_TYPE_LABELS] || selectedNotification.type}
                </Badge>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Đối tượng</label>
                <Badge variant="outline" className="mt-1">
                  {{
                    all: 'Tất cả',
                    household: 'Hộ gia đình',
                    individual: 'Cá nhân',
                  }[selectedNotification.target] || selectedNotification.target}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Ghim</label>
                <p className="mt-1">
                  {selectedNotification.is_pinned ? (
                    <Badge>Đã ghim</Badge>
                  ) : (
                    <span className="text-muted-foreground">Không</span>
                  )}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Ngày phát hành</label>
                <p className="mt-1">
                  {selectedNotification.published_at 
                    ? formatDate(selectedNotification.published_at)
                    : 'Chưa phát hành'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Ngày tạo</label>
                <p className="mt-1">{formatDate(selectedNotification.created_at)}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Người tạo</label>
                <p className="mt-1">
                  {selectedNotification.creator 
                    ? selectedNotification.creator.full_name
                    : '-'}
                </p>
              </div>
            </div>

            {selectedNotification.scheduled_at && (
              <div>
                <label className="text-sm font-medium text-gray-500">Ngày hẹn</label>
                <p className="mt-1">{formatDate(selectedNotification.scheduled_at)}</p>
              </div>
            )}

            {selectedNotification.expires_at && (
              <div>
                <label className="text-sm font-medium text-gray-500">Ngày hết hạn</label>
                <p className="mt-1">{formatDate(selectedNotification.expires_at)}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Tạo thông báo mới"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Nhập tiêu đề thông báo"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Nội dung <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3 py-2 border rounded-md min-h-32"
              placeholder="Nhập nội dung thông báo"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Loại thông báo</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="general">Thông báo chung</option>
                <option value="emergency">Khẩn cấp</option>
                <option value="event">Sự kiện</option>
                <option value="payment">Thanh toán</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Đối tượng</label>
              <select
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: e.target.value as any, target_id: '' })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="all">Tất cả</option>
                <option value="household">Hộ gia đình</option>
              </select>
            </div>
          </div>

          {formData.target === 'household' && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Chọn hộ gia đình <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.target_id}
                onChange={(e) => setFormData({ ...formData, target_id: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                <option value="">-- Chọn hộ --</option>
                {houses.map((house) => (
                  <option key={house.id} value={house.id}>
                    Phòng {house.room_number} {house.head_resident?.full_name ? `- ${house.head_resident.full_name}` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ngày hẹn (tùy chọn)</label>
              <input
                type="datetime-local"
                value={formData.scheduled_at}
                onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Ngày hết hạn (tùy chọn)</label>
              <input
                type="datetime-local"
                value={formData.expires_at}
                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_pinned}
                onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">Ghim thông báo</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={createMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Đang tạo...' : 'Tạo thông báo'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
