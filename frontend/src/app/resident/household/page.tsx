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
  Badge,
} from '@/components/ui';
import { residentService } from '@/services';
import { QUERY_KEYS, ROUTES } from '@/config/constants';
import { formatDate } from '@/utils/helpers';
import type { Resident, TableColumn } from '@/types';
import { useAuth } from '@/hooks';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function ResidentHouseholdPage() {
  const { user } = useAuth();
  const status = user?.status;
  const isActive = status === 'active';

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.residentHousehold],
    queryFn: residentService.getHousehold,
    staleTime: 30000,
    enabled: isActive,
  });

  const household = data?.household;

  const columns: TableColumn<Resident>[] = [
    {
      key: 'full_name',
      label: 'Họ tên',
    },
    {
      key: 'house_role',
      label: 'Vai trò',
      render: (value) => (
        <Badge variant={value === 'head' ? 'default' : 'secondary'}>
          {value === 'head' ? 'Chủ hộ' : 'Thành viên'}
        </Badge>
      ),
    },
    {
      key: 'phone',
      label: 'Số điện thoại',
    },
    {
      key: 'id_card',
      label: 'CCCD',
    },
    {
      key: 'move_in_date',
      label: 'Ngày vào ở',
      render: (value) => value ? formatDate(String(value)) : '-',
    },
  ];

  if (!isActive) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Thông tin hộ khẩu</h1>
        {status === 'pending' ? (
          <p className="text-muted-foreground">Thông tin cư dân đang chờ quản lý xác thực. Vui lòng đợi phê duyệt để xem hộ khẩu.</p>
        ) : (
          <div className="space-y-2">
            <p className="text-muted-foreground">Tài khoản chưa kích hoạt. Vui lòng đăng ký cư dân để xem hộ khẩu.</p>
            <Link href={ROUTES.RESIDENT.PROFILE} className="inline-block">
              <Button>Đăng ký cư dân</Button>
            </Link>
          </div>
        )}
      </div>
    );
  }

  if (isLoading) {
    return <Loading text="Đang tải thông tin hộ khẩu..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Thông tin hộ khẩu</h1>
        <p className="text-muted-foreground mt-1">
          Thông tin về căn hộ và các thành viên trong hộ
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin căn hộ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <label className="text-sm font-medium text-gray-500">Số phòng</label>
              <p className="text-lg font-semibold">{household?.room_number || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Số thành viên</label>
              <p className="text-lg font-semibold">{household?.members?.length || 0} người</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trạng thái</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="text-green-600">
              Đang hoạt động
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách thành viên ({household?.members?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {household?.members && household.members.length > 0 ? (
            <DataTable
              data={household.members}
              columns={columns}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Không có thông tin thành viên</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
