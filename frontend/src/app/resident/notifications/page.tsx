'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
} from '@/components/ui';
import { notificationService } from '@/services';
import { QUERY_KEYS, ROUTES } from '@/config/constants';
import { useAuth } from '@/hooks';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/utils/helpers';
import { NOTIFICATION_TYPE_LABELS } from '@/utils/labels';
import type { Notification, TableColumn } from '@/types';

export default function ResidentNotificationsPage() {
  const { user } = useAuth();
  const status = user?.status;
  const isActive = status === 'active';

  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortField, setSortField] = React.useState<string>('published_at');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage] = React.useState(10);
  const [selectedNotification, setSelectedNotification] = React.useState<Notification | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: [QUERY_KEYS.residentNotifications],
    queryFn: notificationService.getResidentNotifications,
    staleTime: 30000,
    enabled: isActive,
  });

  const markAsReadMutation = useMutation({
    mutationFn: notificationService.markAsRead,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.residentNotifications] });

      const previous = queryClient.getQueryData<Notification[]>([QUERY_KEYS.residentNotifications]);

      queryClient.setQueryData<Notification[]>([QUERY_KEYS.residentNotifications], (old) => {
        if (!old) return old;
        return old.map((n) => (n.id === id ? { ...n, is_read: true } : n));
      });

      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData([QUERY_KEYS.residentNotifications], context.previous);
      }
    },
  });

  // Filter - only show published and non-expired notifications
  const filteredData = React.useMemo(() => {
    const now = new Date();
    let filtered = notifications.filter((n) => {
      // Must be published
      if (!n.published_at) return false;
      if (new Date(n.published_at) > now) return false;
      
      // Must not be expired
      if (n.expires_at && new Date(n.expires_at) < now) return false;
      
      return true;
    });

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter((n) =>
        n.title.toLowerCase().includes(lowerSearch) ||
        n.content.toLowerCase().includes(lowerSearch)
      );
    }

    // Sort: unread first, then pinned
    return filtered.sort((a, b) => {
      // Unread first
      if (!a.is_read && b.is_read) return -1;
      if (a.is_read && !b.is_read) return 1;
      
      // Then pinned
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      
      return 0;
    });
  }, [notifications, searchTerm]);

  // Sort
  const sortedData = React.useMemo(() => {
    const sorted = [...filteredData];
    sorted.sort((a, b) => {
      const aValue = a[sortField as keyof Notification];
      const bValue = b[sortField as keyof Notification];

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

  const handleRowClick = React.useCallback((notification: Notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
    
    // Auto mark as read when viewing
    markAsReadMutation.mutate(notification.id);
  }, [markAsReadMutation]);

  const columns: TableColumn<Notification>[] = [
    {
      key: 'is_read',
      label: 'Trạng thái',
      width: '10%',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          {!value && <span className="h-2 w-2 bg-blue-500 rounded-full" title="Chưa đọc"></span>}
          {row.is_pinned && <Badge variant="default" className="text-xs">Ghim</Badge>}
        </div>
      ),
    },
    {
      key: 'title',
      label: 'Tiêu đề',
      sortable: true,
      width: '35%',
      render: (value, row) => (
        <span className={!row.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}>
          {value}
        </span>
      ),
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
      key: 'published_at',
      label: 'Ngày phát hành',
      sortable: true,
      render: (value) => formatDate(String(value)),
    },
  ];

  if (!isActive) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Thông báo</h1>
        {status === 'pending' ? (
          <p className="text-muted-foreground">Thông tin cư dân đang chờ quản lý xác thực. Vui lòng đợi phê duyệt để xem thông báo.</p>
        ) : (
          <div className="space-y-2">
            <p className="text-muted-foreground">Tài khoản chưa kích hoạt. Vui lòng hoàn tất đăng ký cư dân để xem thông báo.</p>
            <Link href={ROUTES.RESIDENT.PROFILE} className="inline-block">
              <Button>Đăng ký cư dân</Button>
            </Link>
          </div>
        )}
      </div>
    );
  }

  if (isLoading) {
    return <Loading text="Đang tải thông báo..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Thông báo</h1>
        <p className="text-muted-foreground mt-1">
          Các thông báo từ ban quản lý
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Danh sách thông báo ({filteredData.length})</CardTitle>
            <SearchInput
              placeholder="Tìm kiếm thông báo..."
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
            {selectedNotification.is_pinned && (
              <Badge variant="default" className="mb-2">
                Thông báo quan trọng
              </Badge>
            )}

            <div>
              <label className="text-sm font-medium text-gray-500">Tiêu đề</label>
              <p className="mt-1 text-lg font-semibold">{selectedNotification.title}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Nội dung</label>
              <div className="mt-2 p-4 bg-gray-50 rounded-md">
                <p className="whitespace-pre-wrap">{selectedNotification.content}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Loại thông báo</label>
                <Badge variant="secondary" className="mt-1">
                  {NOTIFICATION_TYPE_LABELS[selectedNotification.type as keyof typeof NOTIFICATION_TYPE_LABELS] || selectedNotification.type}
                </Badge>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Ngày phát hành</label>
                <p className="mt-1">
                  {selectedNotification.published_at 
                    ? formatDate(selectedNotification.published_at)
                    : '-'}
                </p>
              </div>
            </div>

            {selectedNotification.expires_at && (
              <div>
                <label className="text-sm font-medium text-gray-500">Có hiệu lực đến</label>
                <p className="mt-1 text-orange-600 font-medium">
                  {formatDate(selectedNotification.expires_at)}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
