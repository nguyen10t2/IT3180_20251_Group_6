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
} from '@/components/ui';
import { residentService } from '@/services';
import { QUERY_KEYS } from '@/config/constants';
import { formatDate, getErrorMessage } from '@/utils/helpers';
import { GENDER_LABELS, RESIDENT_STATUS_LABELS, HOUSE_ROLE_LABELS } from '@/utils/labels';
import type { Resident, TableColumn } from '@/types';
import { toast } from 'sonner';

export default function ResidentsPage() {
  const [showDetailModal, setShowDetailModal] = React.useState(false);
  const [residentDetail, setResidentDetail] = React.useState<Resident | null>(null);
  const [loadingDetail, setLoadingDetail] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(10);
  const [sortConfig, setSortConfig] = React.useState<{ field: string; order: 'asc' | 'desc' } | null>(null);

  const { data: residents = [], isLoading } = useQuery({
    queryKey: [QUERY_KEYS.residents],
    queryFn: residentService.getAllResidents,
    staleTime: 30000,
  });

  // Search, sort, and pagination logic with useMemo
  const filteredData = React.useMemo(() => {
    if (!searchTerm.trim()) return residents;
    const term = searchTerm.toLowerCase();
    return residents.filter(resident => 
      resident.full_name?.toLowerCase().includes(term) || 
      resident.id_card?.toLowerCase().includes(term) ||
      resident.phone?.toLowerCase().includes(term) ||
      resident.email?.toLowerCase().includes(term)
    );
  }, [residents, searchTerm]);

  const sortedData = React.useMemo(() => {
    const sorted = [...filteredData].sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    if (!sortConfig) return sorted;

    return sorted.sort((a, b) => {
      const aValue = a[sortConfig.field as keyof Resident];
      const bValue = b[sortConfig.field as keyof Resident];
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      const comparison = String(aValue).localeCompare(String(bValue));
      return sortConfig.order === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortConfig]);

  const paginatedData = React.useMemo(() => {
    const start = (page - 1) * limit;
    return sortedData.slice(start, start + limit);
  }, [sortedData, page, limit]);

  const totalPages = Math.ceil(sortedData.length / limit);

  const requestSort = React.useCallback((field: string) => {
    setSortConfig(prev => {
      if (prev?.field === field) {
        return { field, order: prev.order === 'asc' ? 'desc' : 'asc' };
      }
      return { field, order: 'asc' };
    });
  }, []);

  const handleViewDetail = React.useCallback(async (residentId: string) => {
    if (!residentId) {
      toast.error('ID cư dân không hợp lệ');
      return;
    }
    
    setLoadingDetail(true);
    setShowDetailModal(true);
    try {
      const detail = await residentService.getResidentById(residentId);
      setResidentDetail(detail);
    } catch (error) {
      toast.error(getErrorMessage(error));
      setShowDetailModal(false);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const columns: TableColumn<Resident>[] = React.useMemo(() => [
    {
      key: 'full_name',
      label: 'Họ tên',
      sortable: true,
    },
    {
      key: 'id_card',
      label: 'CCCD',
      sortable: true,
    },
    {
      key: 'phone',
      label: 'Số điện thoại',
      sortable: true,
    },
    {
      key: 'gender',
      label: 'Giới tính',
      render: (value) => GENDER_LABELS[value as keyof typeof GENDER_LABELS] || value,
    },
    {
      key: 'house_role',
      label: 'Vai trò',
      render: (value) => (
        <Badge variant="outline">
          {HOUSE_ROLE_LABELS[value as keyof typeof HOUSE_ROLE_LABELS] || value}
        </Badge>
      ),
    },
    {
      key: 'residence_status',
      label: 'Tình trạng',
      render: (value) => (
        <Badge variant="secondary">
          {RESIDENT_STATUS_LABELS[value as keyof typeof RESIDENT_STATUS_LABELS] || value}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Ngày tạo',
      sortable: true,
      render: (value) => formatDate(String(value)),
    },
  ], []);

  if (isLoading) {
    return <Loading text="Đang tải danh sách cư dân..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quản lý cư dân</h1>
        <p className="text-muted-foreground mt-1">
          Danh sách tất cả cư dân trong chung cư
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Danh sách cư dân ({residents.length})</CardTitle>
            <SearchInput
              placeholder="Tìm kiếm theo tên, CCCD, SĐT..."
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
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            onRowClick={(row) => row.id && handleViewDetail(row.id)}
          />
        </CardContent>
      </Card>

      {/* Resident Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setResidentDetail(null);
        }}
        title="Thông tin chi tiết cư dân"
        size="lg"
      >
        {loadingDetail ? (
          <Loading text="Đang tải thông tin..." />
        ) : residentDetail ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Thông tin cá nhân</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Họ tên</p>
                  <p className="font-medium">{residentDetail.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CMND/CCCD</p>
                  <p className="font-medium">{residentDetail.id_card}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ngày sinh</p>
                  <p className="font-medium">
                    {residentDetail.date_of_birth 
                      ? formatDate(residentDetail.date_of_birth) 
                      : 'Chưa có'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Giới tính</p>
                  <p className="font-medium">
                    {GENDER_LABELS[residentDetail.gender as keyof typeof GENDER_LABELS] || residentDetail.gender}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Số điện thoại</p>
                  <p className="font-medium">{residentDetail.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{residentDetail.email || 'Chưa có'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nghề nghiệp</p>
                  <p className="font-medium">{residentDetail.occupation || 'Chưa có'}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Thông tin cư trú</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Vai trò trong hộ</p>
                  <Badge variant="outline">
                    {HOUSE_ROLE_LABELS[residentDetail.house_role as keyof typeof HOUSE_ROLE_LABELS] || residentDetail.house_role}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tình trạng cư trú</p>
                  <Badge variant="secondary">
                    {RESIDENT_STATUS_LABELS[residentDetail.residence_status as keyof typeof RESIDENT_STATUS_LABELS] || residentDetail.residence_status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ngày chuyển vào</p>
                  <p className="font-medium">
                    {residentDetail.move_in_date 
                      ? formatDate(residentDetail.move_in_date) 
                      : 'Chưa có'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ngày chuyển đi</p>
                  <p className="font-medium">
                    {residentDetail.move_out_date 
                      ? formatDate(residentDetail.move_out_date) 
                      : 'Chưa có'}
                  </p>
                </div>
                {residentDetail.move_out_reason && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Lý do chuyển đi</p>
                    <p className="font-medium">{residentDetail.move_out_reason}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Ngày tạo</p>
                  <p>{formatDate(residentDetail.created_at)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Cập nhật lần cuối</p>
                  <p>{formatDate(residentDetail.updated_at)}</p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
