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
import { houseService, residentService } from '@/services';
import { QUERY_KEYS } from '@/config/constants';
import { formatNumber, getErrorMessage } from '@/utils/helpers';
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
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [showAddResidentModal, setShowAddResidentModal] = React.useState(false);
  const [showChangeHeadModal, setShowChangeHeadModal] = React.useState(false);
  const [newHeadResidentId, setNewHeadResidentId] = React.useState('');
  const [createFormData, setCreateFormData] = React.useState({
    room_number: '',
    room_type: 'normal',
    building: '',
    area: '',
  });
  const [addResidentFormData, setAddResidentFormData] = React.useState({
    full_name: '',
    id_card: '',
    date_of_birth: '',
    phone: '',
    email: '',
    gender: 'male',
    house_role: 'member',
    residence_status: 'thuongtru',
  });

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
    onError: (error) => toast.error(`Xóa hộ dân thất bại: ${getErrorMessage(error)}`),
  });

  const createHouseMutation = useMutation({
    mutationFn: (data: typeof createFormData) => 
      houseService.createHouse({
        room_number: data.room_number,
        room_type: data.room_type,
        building: data.building,
        area: data.area,
      }),
    onSuccess: () => {
      toast.success('Tạo căn hộ thành công');
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.houses] });
      setShowCreateModal(false);
      setCreateFormData({
        room_number: '',
        room_type: 'normal',
        building: '',
        area: '',
      });
    },
    onError: (error) => toast.error(`Tạo căn hộ thất bại: ${getErrorMessage(error)}`),
  });

  const addResidentMutation = useMutation({
    mutationFn: (data: typeof addResidentFormData) => {
      if (!houseDetail?.id) throw new Error('Không có house ID');
      return residentService.addResidentToHouse(houseDetail.id, {
        full_name: data.full_name,
        id_card: data.id_card,
        date_of_birth: data.date_of_birth,
        phone: data.phone,
        email: data.email,
        gender: data.gender,
        house_role: data.house_role,
        residence_status: data.residence_status,
      });
    },
    onSuccess: async () => {
      toast.success('Thêm cư dân thành công');
      setShowAddResidentModal(false);
      setAddResidentFormData({
        full_name: '',
        id_card: '',
        date_of_birth: '',
        phone: '',
        email: '',
        gender: 'male',
        house_role: 'member',
        residence_status: 'thuongtru',
      });
      // Refresh house detail để cập nhật danh sách cư dân
      if (houseDetail?.id) {
        try {
          const updated = await houseService.getHouseById(houseDetail.id);
          setHouseDetail(updated);
        } catch (error) {
          console.error('Failed to refresh house detail:', error);
        }
      }
    },
    onError: (error) => toast.error(`Thêm cư dân thất bại: ${getErrorMessage(error)}`),
  });

  const changeHeadMutation = useMutation({
    mutationFn: (data: { houseId: string; residentId: string }) =>
      houseService.updateHeadResident(data.houseId, data.residentId, 'Đổi chủ hộ'),
    onSuccess: async () => {
      toast.success('Đổi chủ hộ thành công');
      setShowChangeHeadModal(false);
      setNewHeadResidentId('');
      // Refresh house detail
      if (houseDetail?.id) {
        try {
          const updated = await houseService.getHouseById(houseDetail.id);
          setHouseDetail(updated);
        } catch (error) {
          console.error('Failed to refresh house detail:', error);
        }
      }
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.houses] });
    },
    onError: (error) => toast.error(`Đổi chủ hộ thất bại: ${getErrorMessage(error)}`),
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
      toast.error(`Tải thông tin căn hộ thất bại: ${getErrorMessage(error)}`);
      setShowDetailModal(false);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const handleCreateHouse = React.useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!createFormData.room_number.trim() || !createFormData.area.trim()) {
      toast.error('Vui lòng nhập số phòng và diện tích');
      return;
    }
    createHouseMutation.mutate(createFormData);
  }, [createFormData, createHouseMutation]);

  const handleAddResident = React.useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!addResidentFormData.full_name.trim() || !addResidentFormData.id_card.trim()) {
      toast.error('Vui lòng nhập họ tên và CCCD');
      return;
    }
    addResidentMutation.mutate(addResidentFormData);
  }, [addResidentFormData, addResidentMutation]);

  const handleChangeHead = React.useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!newHeadResidentId || !houseDetail?.id) {
      toast.error('Vui lòng chọn chủ hộ mới');
      return;
    }
    changeHeadMutation.mutate({
      houseId: houseDetail.id,
      residentId: newHeadResidentId,
    });
  }, [newHeadResidentId, houseDetail, changeHeadMutation]);

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
  ], [deleteMutation.isPending, deleteMutation]);

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
            <div className="flex items-center gap-3">
              <SearchInput
                placeholder="Tìm kiếm theo số phòng, tòa nhà..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="md:w-80"
              />
              <Button
                onClick={() => setShowCreateModal(true)}
                className="whitespace-nowrap"
              >
                + Tạo hộ mới
              </Button>
            </div>
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

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                onClick={() => setShowAddResidentModal(true)}
                className="whitespace-nowrap"
              >
                + Thêm cư dân
              </Button>
              {houseDetail.residents && houseDetail.residents.length > 1 && (
                <Button
                  variant="secondary"
                  onClick={() => setShowChangeHeadModal(true)}
                  className="whitespace-nowrap"
                >
                  Đổi chủ hộ
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setShowDetailModal(false)}
              >
                Đóng
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Create House Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Tạo căn hộ mới"
      >
        <form onSubmit={handleCreateHouse} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Số phòng <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={createFormData.room_number}
              onChange={(e) => setCreateFormData({ ...createFormData, room_number: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Ví dụ: 101, 201..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Loại phòng</label>
            <select
              value={createFormData.room_type}
              onChange={(e) => setCreateFormData({ ...createFormData, room_type: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="normal">Phòng thường</option>
              <option value="studio">Studio</option>
              <option value="penhouse">Penthouse</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tòa nhà</label>
              <input
                type="text"
                value={createFormData.building}
                onChange={(e) => setCreateFormData({ ...createFormData, building: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="A, B, C..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Diện tích (m²)</label>
              <input
                type="number"
                value={createFormData.area}
                onChange={(e) => setCreateFormData({ ...createFormData, area: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Ví dụ: 50"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateModal(false)}
              disabled={createHouseMutation.isPending}
            >
              Hủy
            </Button>
            <Button 
              type="submit"
              disabled={createHouseMutation.isPending}
            >
              {createHouseMutation.isPending ? 'Đang tạo...' : 'Tạo căn hộ'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Resident Modal */}
      <Modal
        isOpen={showAddResidentModal}
        onClose={() => setShowAddResidentModal(false)}
        title="Thêm cư dân vào căn hộ"
        size="lg"
      >
        <form onSubmit={handleAddResident} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={addResidentFormData.full_name}
                onChange={(e) => setAddResidentFormData({ ...addResidentFormData, full_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Nhập họ và tên"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                CCCD <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={addResidentFormData.id_card}
                onChange={(e) => setAddResidentFormData({ ...addResidentFormData, id_card: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Nhập CCCD"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Ngày sinh</label>
              <input
                type="date"
                value={addResidentFormData.date_of_birth}
                onChange={(e) => setAddResidentFormData({ ...addResidentFormData, date_of_birth: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Số điện thoại</label>
              <input
                type="tel"
                value={addResidentFormData.phone}
                onChange={(e) => setAddResidentFormData({ ...addResidentFormData, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Nhập số điện thoại"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={addResidentFormData.email}
                onChange={(e) => setAddResidentFormData({ ...addResidentFormData, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Nhập email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Giới tính</label>
              <select
                value={addResidentFormData.gender}
                onChange={(e) => setAddResidentFormData({ ...addResidentFormData, gender: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Vai trò trong hộ</label>
              <select
                value={addResidentFormData.house_role}
                onChange={(e) => setAddResidentFormData({ ...addResidentFormData, house_role: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="owner" disabled={!!houseDetail?.head_resident_id}>
                  Chủ hộ {houseDetail?.head_resident_id && '(Đã có chủ hộ)'}
                </option>
                <option value="member">Thành viên</option>
                <option value="tenant">Người thuê</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tình trạng cư trú</label>
              <select
                value={addResidentFormData.residence_status}
                onChange={(e) => setAddResidentFormData({ ...addResidentFormData, residence_status: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="thuongtru">Thường trú</option>
                <option value="tamtru">Tạm trú</option>
                <option value="tamvang">Tạm vắng</option>
                <option value="dachuyendi">Đã chuyển đi</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddResidentModal(false)}
              disabled={addResidentMutation.isPending}
            >
              Hủy
            </Button>
            <Button 
              type="submit"
              disabled={addResidentMutation.isPending}
            >
              {addResidentMutation.isPending ? 'Đang thêm...' : 'Thêm cư dân'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Change Head Resident Modal */}
      <Modal
        isOpen={showChangeHeadModal}
        onClose={() => setShowChangeHeadModal(false)}
        title="Đổi chủ hộ"
      >
        <form onSubmit={handleChangeHead} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Chủ hộ hiện tại
            </label>
            <p className="px-3 py-2 bg-gray-100 rounded-md">
              {houseDetail?.head_resident?.full_name || 'Chưa có'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Chọn chủ hộ mới <span className="text-red-500">*</span>
            </label>
            <select
              value={newHeadResidentId}
              onChange={(e) => setNewHeadResidentId(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            >
              <option value="">-- Chọn cư dân --</option>
              {houseDetail?.residents?.filter(r => r.id !== houseDetail.head_resident_id).map((resident) => (
                <option key={resident.id} value={resident.id}>
                  {resident.full_name} - {resident.id_card}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-sm text-yellow-800">
              ⚠️ Chủ hộ hiện tại sẽ được chuyển thành &quot;Thành viên&quot; sau khi đổi
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowChangeHeadModal(false)}
              disabled={changeHeadMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={changeHeadMutation.isPending}
            >
              {changeHeadMutation.isPending ? 'Đang đổi...' : 'Đổi chủ hộ'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

