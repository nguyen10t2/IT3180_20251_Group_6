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
  Button,
} from '@/components/ui';
import { houseService } from '@/services';
import { QUERY_KEYS } from '@/config/constants';
import { formatNumber, getErrorMessage, formatDate } from '@/utils/helpers';
import { GENDER_LABELS, HOUSE_ROLE_LABELS, RESIDENT_STATUS_LABELS } from '@/utils/labels';
import type { HouseWithResident, TableColumn } from '@/types';
import { toast } from 'sonner';

export default function HousesPage() {
  const [showDetailModal, setShowDetailModal] = React.useState(false);
  const [houseDetail, setHouseDetail] = React.useState<HouseWithResident | null>(null);
  const [loadingDetail, setLoadingDetail] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(10);
  const [sortConfig, setSortConfig] = React.useState<{ field: string; order: 'asc' | 'desc' } | null>(null);

  const queryClient = useQueryClient();

  const { data: houses = [], isLoading } = useQuery({
    queryKey: [QUERY_KEYS.houses],
    queryFn: houseService.getAllHousesManager,
    staleTime: 30000,
  });

  const deleteMutation = useMutation({
    mutationFn: houseService.deleteHouse,
    onSuccess: () => {
      toast.success('Đã xóa hộ dân');
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.houses] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  // Search, sort, and pagination logic with useMemo
  const filteredData = React.useMemo(() => {
    if (!searchTerm.trim()) return houses;
    const term = searchTerm.toLowerCase();
    return houses.filter(house => 
      house.room_number?.toLowerCase().includes(term) || 
      house.building?.toLowerCase().includes(term)
    );
  }, [houses, searchTerm]);

  const sortedData = React.useMemo(() => {
    const sorted = [...filteredData].sort((a, b) => {
      return a.room_number.localeCompare(b.room_number);
    });

    if (!sortConfig) return sorted;

    return sorted.sort((a, b) => {
      const aValue = a[sortConfig.field as keyof HouseWithResident];
      const bValue = b[sortConfig.field as keyof HouseWithResident];
      
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

  const handleViewDetail = React.useCallback(async (houseId: string) => {
    if (!houseId) {
      toast.error('ID căn hộ không hợp lệ');
      return;
    }
    
    setLoadingDetail(true);
    setShowDetailModal(true);
    try {
      const detail = await houseService.getHouseById(houseId);
      setHouseDetail(detail);
    } catch (error) {
      toast.error(getErrorMessage(error));
      setShowDetailModal(false);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const columns: TableColumn<HouseWithResident>[] = React.useMemo(() => [
    {
      key: 'room_number',
      label: 'Số phòng',
      sortable: true,
    },
    {
      key: 'room_type',
      label: 'Loại phòng',
      render: (value) => (
        <Badge variant="secondary">{String(value).toUpperCase()}</Badge>
      ),
    },
    {
      key: 'building',
      label: 'Tòa nhà',
      render: (value) => value || 'N/A',
    },
    {
      key: 'area',
      label: 'Diện tích (m²)',
      render: (value) => formatNumber(String(value)),
    },
    {
      key: 'head_resident',
      label: 'Chủ hộ',
      render: (_, row) => row.head_resident?.full_name || 'Chưa có',
    },
    {
      key: 'has_vehicle',
      label: 'Phương tiện',
      render: (_, row) => {
        if (!row.has_vehicle) return 'Không';
        const vehicles = [];
        if (row.motorbike_count > 0) vehicles.push(`${row.motorbike_count} xe máy`);
        if (row.car_count > 0) vehicles.push(`${row.car_count} ô tô`);
        return vehicles.join(', ');
      },
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (value) => (
        <Badge variant={value === 'active' ? 'default' : 'secondary'}>
          {value === 'active' ? 'Hoạt động' : 'Không hoạt động'}
        </Badge>
      ),
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
              if (!confirm('Xác nhận xóa hộ dân này?')) return;
              deleteMutation.mutate(row.id);
            }}
          >
            Xóa
          </Button>
        </div>
      ),
    },
  ], [deleteMutation.isPending]);

  if (isLoading) {
    return <Loading text="Đang tải danh sách căn hộ..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quản lý căn hộ</h1>
        <p className="text-muted-foreground mt-1">
          Danh sách tất cả căn hộ trong chung cư
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Danh sách căn hộ ({houses.length})</CardTitle>
            <SearchInput
              placeholder="Tìm kiếm theo số phòng, tòa nhà..."
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

      {/* House Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setHouseDetail(null);
        }}
        title="Thông tin chi tiết căn hộ"
        size="lg"
      >
        {loadingDetail ? (
          <Loading text="Đang tải thông tin..." />
        ) : houseDetail ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Thông tin căn hộ</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Số phòng</p>
                  <p className="font-medium">{houseDetail.room_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Loại phòng</p>
                  <Badge variant="secondary">{houseDetail.room_type.toUpperCase()}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tòa nhà</p>
                  <p className="font-medium">{houseDetail.building || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Diện tích</p>
                  <p className="font-medium">{formatNumber(String(houseDetail.area))} m²</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Trạng thái</p>
                  <Badge variant={houseDetail.status === 'active' ? 'default' : 'secondary'}>
                    {houseDetail.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Thông tin chủ hộ</h3>
              {houseDetail.head_resident ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Họ tên</p>
                    <p className="font-medium">{houseDetail.head_resident.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Số điện thoại</p>
                    <p className="font-medium">{houseDetail.head_resident.phone || 'Chưa có'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{houseDetail.head_resident.email || 'Chưa có'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">CMND/CCCD</p>
                    <p className="font-medium">{houseDetail.head_resident.id_card || 'Chưa có'}</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Chưa có chủ hộ</p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Phương tiện</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Xe máy</p>
                  <p className="font-medium">{houseDetail.motorbike_count || 0} chiếc</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ô tô</p>
                  <p className="font-medium">{houseDetail.car_count || 0} chiếc</p>
                </div>
              </div>
            </div>

            {houseDetail.residents && houseDetail.residents.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Danh sách thành viên ({houseDetail.residents.length} người)
                </h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium">Họ tên</th>
                        <th className="px-4 py-3 text-left font-medium">CCCD</th>
                        <th className="px-4 py-3 text-left font-medium">Giới tính</th>
                        <th className="px-4 py-3 text-left font-medium">SĐT</th>
                        <th className="px-4 py-3 text-left font-medium">Vai trò</th>
                        <th className="px-4 py-3 text-left font-medium">Tình trạng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {houseDetail.residents.map((resident, index) => (
                        <tr key={resident.id} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {resident.full_name}
                              {resident.id === houseDetail.head_resident_id && (
                                <Badge variant="default" className="text-xs">Chủ hộ</Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">{resident.id_card}</td>
                          <td className="px-4 py-3">
                            {GENDER_LABELS[resident.gender as keyof typeof GENDER_LABELS] || resident.gender}
                          </td>
                          <td className="px-4 py-3">{resident.phone}</td>
                          <td className="px-4 py-3">
                            <Badge variant="outline">
                              {HOUSE_ROLE_LABELS[resident.house_role as keyof typeof HOUSE_ROLE_LABELS] || resident.house_role}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="secondary">
                              {RESIDENT_STATUS_LABELS[resident.residence_status as keyof typeof RESIDENT_STATUS_LABELS] || resident.residence_status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {houseDetail.notes && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Ghi chú</h3>
                <p className="text-sm">{houseDetail.notes}</p>
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
