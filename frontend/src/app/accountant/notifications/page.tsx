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
} from '@/components/ui';
import { notificationService } from '@/services';
import { QUERY_KEYS } from '@/config/constants';
import { useSearch, usePagination, useSort } from '@/hooks';
import { formatDate } from '@/utils/helpers';
import { NOTIFICATION_TYPE_LABELS } from '@/utils/labels';
import type { NotificationWithRelations, TableColumn } from '@/types';

export default function AccountantNotificationsPage() {
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: [QUERY_KEYS.notifications, 'accountant'],
    queryFn: () => notificationService.getAllNotifications('accountant'),
  });

  const { searchTerm, setSearchTerm, filteredData } = useSearch(notifications, [
    'title',
    'content',
  ]);

  const { sortedData, sortConfig, requestSort } = useSort(filteredData);

  const { data: paginatedData, ...pagination } = usePagination(sortedData, {
    initialLimit: 10,
  });

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
          Tạo và quản lý thông báo liên quan đến hóa đơn
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
