'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  DataTable, 
  Button,
  SearchInput,
  Loading,
  StatusBadge,
  Modal,
} from '@/components/ui';
import { userService } from '@/services';
import { QUERY_KEYS } from '@/config/constants';
import { formatDate, getErrorMessage } from '@/utils/helpers';
import { CheckCircle, XCircle } from 'lucide-react';
import type { User, UserWithResident, TableColumn } from '@/types';
import { toast } from 'sonner';

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [showRejectModal, setShowRejectModal] = React.useState(false);
  const [showDetailModal, setShowDetailModal] = React.useState(false);
  const [rejectReason, setRejectReason] = React.useState('');
  const [userDetail, setUserDetail] = React.useState<UserWithResident | null>(null);
  const [loadingDetail, setLoadingDetail] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(10);
  const [sortConfig, setSortConfig] = React.useState<{ field: string; order: 'asc' | 'desc' } | null>(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: [QUERY_KEYS.users],
    queryFn: () => userService.getUsers({ limit: 1000 }),
    staleTime: 30000,
  });

  const { data: pendingUsers = [] } = useQuery({
    queryKey: [QUERY_KEYS.pendingUsers],
    queryFn: userService.getPendingUsers,
    staleTime: 30000,
  });

  const approveMutation = useMutation({
    mutationFn: userService.approveUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.users] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.pendingUsers] });
      toast.success('Đã phê duyệt người dùng');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      userService.rejectUser(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.users] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.pendingUsers] });
      setShowRejectModal(false);
      setRejectReason('');
      toast.success('Đã từ chối người dùng');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  // Search, sort, and pagination logic with useMemo
  const filteredData = React.useMemo(() => {
    if (!searchTerm.trim()) return users;
    const term = searchTerm.toLowerCase();
    return users.filter(user => 
      user.full_name?.toLowerCase().includes(term) || 
      user.email?.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  const sortedData = React.useMemo(() => {
    const sorted = [...filteredData].sort((a, b) => {
      // Priority: pending first
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      
      // Then by created_at
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    if (!sortConfig) return sorted;

    return sorted.sort((a, b) => {
      const aValue = a[sortConfig.field as keyof User];
      const bValue = b[sortConfig.field as keyof User];
      
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

  const handleApprove = React.useCallback((userId: string) => {
    if (confirm('Bạn có chắc chắn muốn phê duyệt người dùng này?')) {
      approveMutation.mutate(userId);
    }
  }, [approveMutation]);

  const handleViewDetail = React.useCallback(async (userId: string) => {
    if (!userId) {
      toast.error('ID người dùng không hợp lệ');
      return;
    }
    
    setLoadingDetail(true);
    setShowDetailModal(true);
    try {
      const detail = await userService.getUserById(userId);
      setUserDetail(detail);
    } catch (error) {
      toast.error(getErrorMessage(error));
      setShowDetailModal(false);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const handleReject = React.useCallback((user: User) => {
    setSelectedUser(user);
    setShowRejectModal(true);
  }, []);

  const handleRejectConfirm = React.useCallback(() => {
    if (selectedUser?.id && rejectReason.trim()) {
      rejectMutation.mutate({ id: selectedUser.id, reason: rejectReason });
    } else if (!selectedUser?.id) {
      toast.error('Không tìm thấy ID người dùng');
    }
  }, [selectedUser, rejectReason, rejectMutation]);

  const columns: TableColumn<User>[] = React.useMemo(() => [
    {
      key: 'full_name',
      label: 'Họ tên',
      sortable: true,
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
    },
    {
      key: 'status',
      label: 'Trạng thái',
      sortable: true,
      render: (value) => <StatusBadge status={String(value)} type="user" />,
    },
    {
      key: 'created_at',
      label: 'Ngày tạo',
      sortable: true,
      render: (value) => formatDate(String(value)),
    },
  ], []);

  if (isLoading) {
    return <Loading text="Đang tải danh sách người dùng..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quản lý người dùng</h1>
        <p className="text-muted-foreground mt-1">
          Quản lý và phê duyệt người dùng trong hệ thống
        </p>
      </div>

      {pendingUsers.length > 0 && (
        <Card className="border-yellow-200 dark:border-yellow-800">
          <CardHeader>
            <CardTitle className="text-yellow-600 dark:text-yellow-400">
              Có {pendingUsers.length} người dùng chờ phê duyệt
            </CardTitle>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Danh sách người dùng ({users.length})</CardTitle>
            <SearchInput
              placeholder="Tìm kiếm theo tên, email..."
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
            rowClassName={(row) => 
              row.status === 'pending' 
                ? 'bg-yellow-50 dark:bg-yellow-950/20 hover:bg-yellow-100 dark:hover:bg-yellow-950/30' 
                : ''
            }
          />
        </CardContent>
      </Card>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Từ chối người dùng"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              loading={rejectMutation.isPending}
              disabled={!rejectReason.trim()}
            >
              Từ chối
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p>Bạn có chắc chắn muốn từ chối người dùng này?</p>
          <div>
            <label className="block text-sm font-medium mb-2">
              Lý do từ chối <span className="text-destructive">*</span>
            </label>
            <textarea
              className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Nhập lý do từ chối..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      {/* User Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setUserDetail(null);
        }}
        title="Thông tin chi tiết người dùng"
        size="lg"
      >
        {loadingDetail ? (
          <Loading text="Đang tải thông tin..." />
        ) : userDetail ? (
          <div className="space-y-6">
            {/* User Info */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Thông tin tài khoản</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Họ tên</p>
                  <p className="font-medium">{userDetail.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{userDetail.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Trạng thái</p>
                  <StatusBadge status={userDetail.status} type="user" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ngày tạo</p>
                  <p className="font-medium">{formatDate(userDetail.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Resident Info */}
            {userDetail.resident ? (
              <div>
                <h3 className="text-lg font-semibold mb-3">Thông tin cư dân</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">CMND/CCCD</p>
                    <p className="font-medium">{userDetail.resident.id_card || 'Chưa có'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ngày sinh</p>
                    <p className="font-medium">
                      {userDetail.resident.date_of_birth 
                        ? formatDate(userDetail.resident.date_of_birth) 
                        : 'Chưa có'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Số điện thoại</p>
                    <p className="font-medium">{userDetail.resident.phone || 'Chưa có'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Giới tính</p>
                    <p className="font-medium">
                      {userDetail.resident.gender === 'male' ? 'Nam' : 
                       userDetail.resident.gender === 'female' ? 'Nữ' : 'Khác'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Nghề nghiệp</p>
                    <p className="font-medium">{userDetail.resident.occupation || 'Chưa có'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Vai trò trong hộ</p>
                    <p className="font-medium">
                      {userDetail.resident.house_role === 'owner' ? 'Chủ hộ' :
                       userDetail.resident.house_role === 'member' ? 'Thành viên' : 'Người thuê'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Tình trạng cư trú</p>
                    <p className="font-medium">
                      {userDetail.resident.residence_status === 'thuongtru' ? 'Thường trú' :
                       userDetail.resident.residence_status === 'tamtru' ? 'Tạm trú' :
                       userDetail.resident.residence_status === 'tamvang' ? 'Tạm vắng' : 'Đã chuyển đi'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Người dùng chưa có thông tin cư dân
              </div>
            )}

            {/* Actions for pending users */}
            {userDetail.status === 'pending' && (
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  className="flex-1"
                  onClick={() => {
                    handleApprove(userDetail.id);
                    setShowDetailModal(false);
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Phê duyệt
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    setSelectedUser(userDetail);
                    setShowDetailModal(false);
                    setShowRejectModal(true);
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Từ chối
                </Button>
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
