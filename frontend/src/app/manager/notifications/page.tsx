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
  Badge,
  Modal,
  Pagination,
} from '@/components/ui';
import { notificationService } from '@/services';
import { QUERY_KEYS } from '@/config/constants';
import { formatDate } from '@/utils/helpers';
import { NOTIFICATION_TYPE_LABELS } from '@/utils/labels';
import type { NotificationWithRelations, TableColumn } from '@/types';

export default function NotificationsPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortField, setSortField] = React.useState<string>('created_at');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage] = React.useState(10);
  const [selectedNotification, setSelectedNotification] = React.useState<NotificationWithRelations | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: [QUERY_KEYS.notifications],
    queryFn: () => notificationService.getAllNotifications('manager'),
    staleTime: 30000,
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
            <SearchInput
              placeholder="Tìm kiếm theo tiêu đề, nội dung..."
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
    </div>
  );
}
