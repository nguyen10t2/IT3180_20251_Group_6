'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent, Loading, Button } from '@/components/ui';
import { useAuth } from '@/hooks';
import { feedbackService, notificationService, invoiceService, residentService } from '@/services';
import { QUERY_KEYS, ROUTES } from '@/config/constants';

export default function ResidentDashboard() {
  const { user } = useAuth();
  const status = user?.status;
  const isActive = status === 'active';

  const inactiveContent = (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Chào mừng, {user?.full_name}!</h1>
      <p className="text-muted-foreground">
        Tài khoản của bạn chưa được kích hoạt. Vui lòng hoàn tất đăng ký cư dân để tiếp tục.
      </p>
      <Link href={ROUTES.RESIDENT.PROFILE} className="inline-block">
        <Button>Đăng ký cư dân</Button>
      </Link>
    </div>
  );

  const pendingContent = (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Chào mừng, {user?.full_name}!</h1>
      <p className="text-muted-foreground">
        Thông tin cư dân của bạn đang chờ quản lý xác thực. Vui lòng đợi phê duyệt để truy cập các chức năng.
      </p>
    </div>
  );

  const { data: residentData, isLoading: residentLoading } = useQuery({
    queryKey: [QUERY_KEYS.resident],
    queryFn: residentService.getCurrentResident,
  });

  const isResident = Boolean(residentData?.resident && residentData.isNewResident === false);

  const { data: feedbacks = [], isLoading: feedbacksLoading } = useQuery({
    queryKey: [QUERY_KEYS.residentFeedbacks],
    queryFn: feedbackService.getResidentFeedbacks,
    staleTime: 30000,
    enabled: isResident && isActive,
  });

  const { data: notifications = [], isLoading: notificationsLoading } = useQuery({
    queryKey: [QUERY_KEYS.residentNotifications],
    queryFn: notificationService.getResidentNotifications,
    staleTime: 30000,
    enabled: isResident && isActive,
  });

  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: [QUERY_KEYS.residentInvoices],
    queryFn: invoiceService.getResidentInvoices,
    staleTime: 30000,
    enabled: isResident && isActive,
  });

  const isLoading = residentLoading || feedbacksLoading || notificationsLoading || invoicesLoading;

  if (residentLoading) {
    return <Loading text="Đang kiểm tra hồ sơ cư dân..." />;
  }

  if (!isActive) {
    if (status === 'pending') return pendingContent;
    return inactiveContent;
  }

  if (!isResident) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Chào mừng, {user?.full_name}!</h1>
        <p className="text-muted-foreground">
          Bạn chưa có hồ sơ cư dân. Vui lòng hoàn tất đăng ký để truy cập các chức năng hóa đơn, phản ánh và thông báo.
        </p>
        <Link href={ROUTES.RESIDENT.PROFILE} className="inline-block">
          <Button>Đăng ký cư dân</Button>
        </Link>
      </div>
    );
  }

  // Calculate stats
  const totalFeedbacks = feedbacks.length;
  const unreadNotifications = notifications.filter(n => !n.is_read).length;
  const unpaidInvoices = invoices.filter(i => ['pending', 'overdue'].includes(String(i.status))).length;

  if (isLoading) {
    return <Loading text="Đang tải dữ liệu..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Xin chào, {user?.full_name}!</h1>
        <p className="text-muted-foreground mt-1">
          Chào mừng bạn đến với hệ thống BlueMoon
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Hóa đơn chưa thanh toán</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{unpaidInvoices}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {unpaidInvoices === 0 ? 'Tất cả đã thanh toán' : 'Cần thanh toán'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Phản ánh của tôi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalFeedbacks}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {totalFeedbacks === 0 ? 'Chưa có phản ánh' : 'Đã gửi'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thông báo chưa đọc</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{unreadNotifications}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {unreadNotifications === 0 ? 'Không có thông báo mới' : 'Thông báo mới'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
