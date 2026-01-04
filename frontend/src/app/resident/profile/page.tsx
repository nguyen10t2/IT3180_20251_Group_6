'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Select, Loading } from '@/components/ui';
import { residentService, houseService } from '@/services';
import { QUERY_KEYS } from '@/config/constants';
import { createResidentSchema, type CreateResidentFormData } from '@/utils/validation';
import { getErrorMessage } from '@/utils/helpers';
import { toast } from 'sonner';

export default function ResidentProfilePage() {
  const queryClient = useQueryClient();
  const [selectedHouseId, setSelectedHouseId] = React.useState<string>('');
  const [selectedHouseHasOwner, setSelectedHouseHasOwner] = React.useState(false);

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.resident],
    queryFn: residentService.getCurrentResident,
  });

  const { data: houses = [], isLoading: housesLoading } = useQuery({
    queryKey: [QUERY_KEYS.houses],
    queryFn: houseService.getAllHouses,
    enabled: data?.isNewResident === true,
  });

  // Kiểm tra xem hộ đã chọn có chủ hộ chưa
  React.useEffect(() => {
    if (selectedHouseId && houses.length > 0) {
      const house = houses.find(h => h.id === selectedHouseId);
      setSelectedHouseHasOwner(!!house?.head_resident_id);
    }
  }, [selectedHouseId, houses]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateResidentFormData>({
    resolver: zodResolver(createResidentSchema),
    values: data?.userInfo || undefined,
  });

  const createMutation = useMutation({
    mutationFn: residentService.createResident,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.resident] });
      toast.success('Đã tạo hồ sơ cư dân thành công');
    },
    onError: (error) => {
      toast.error(`Cập nhật thông tin thất bại: ${getErrorMessage(error)}`);
    },
  });

  const onSubmit = (formData: CreateResidentFormData) => {
    createMutation.mutate(formData);
  };

  if (isLoading) {
    return <Loading text="Đang tải thông tin..." />;
  }

  if (housesLoading && data?.isNewResident) {
    return <Loading text="Đang tải danh sách phòng..." />;
  }

  if (data?.resident && !data.isNewResident) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Hồ sơ cư dân</h1>
          <p className="text-muted-foreground mt-1">
            Thông tin cá nhân của bạn
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Thông tin cá nhân</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Họ và tên</p>
                <p className="font-medium">{data.resident.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CCCD</p>
                <p className="font-medium">{data.resident.id_card}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Số điện thoại</p>
                <p className="font-medium">{data.resident.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{data.resident.email || 'Chưa cập nhật'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Đăng ký thông tin cư dân</h1>
        <p className="text-muted-foreground mt-1">
          Vui lòng cung cấp thông tin để hoàn tất đăng ký
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin cá nhân</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Họ và tên"
                error={errors.full_name?.message}
                {...register('full_name')}
              />

              <Input
                label="CCCD"
                error={errors.id_card?.message}
                {...register('id_card')}
              />

              <Input
                label="Ngày sinh"
                type="date"
                error={errors.date_of_birth?.message}
                {...register('date_of_birth')}
              />

              <Input
                label="Số điện thoại"
                error={errors.phone?.message}
                {...register('phone')}
              />

              <Input
                label="Email"
                type="email"
                error={errors.email?.message}
                {...register('email')}
              />

              <Select
                label="Giới tính"
                error={errors.gender?.message}
                options={[
                  { label: 'Chọn giới tính', value: '', disabled: true },
                  { label: 'Nam', value: 'male' },
                  { label: 'Nữ', value: 'female' },
                  { label: 'Khác', value: 'other' },
                ]}
                {...register('gender')}
              />

              <Input
                label="Nghề nghiệp"
                error={errors.occupation?.message}
                {...register('occupation')}
              />

              <Select
                label="Vai trò trong hộ"
                error={errors.house_role?.message}
                options={[
                  { label: 'Chọn vai trò', value: '', disabled: true },
                  { label: selectedHouseHasOwner ? 'Chủ hộ (Đã có chủ hộ)' : 'Chủ hộ', value: 'owner', disabled: selectedHouseHasOwner },
                  { label: 'Thành viên', value: 'member' },
                  { label: 'Người thuê', value: 'tenant' },
                ]}
                {...register('house_role')}
              />

              <Select
                label="Tình trạng cư trú"
                error={errors.residence_status?.message}
                options={[
                  { label: 'Chọn tình trạng', value: '', disabled: true },
                  { label: 'Thường trú', value: 'thuongtru' },
                  { label: 'Tạm trú', value: 'tamtru' },
                  { label: 'Tạm vắng', value: 'tamvang' },
                ]}
                {...register('residence_status')}
              />

              <Select
                label="Phòng/căn hộ"
                error={errors.house_id?.message}
                options={[
                  { label: 'Chọn phòng', value: '', disabled: true },
                  ...houses.map((house) => ({
                    label: `Phòng ${house.room_number}`,
                    value: house.id,
                  })),
                ]}
                {...register('house_id', {
                  onChange: (e) => setSelectedHouseId(e.target.value)
                })}
              />
            </div>

            <Button type="submit" loading={createMutation.isPending}>
              Đăng ký
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
