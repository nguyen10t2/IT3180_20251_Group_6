'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent, Loading } from '@/components/ui';
import { useAuth } from '@/hooks';
import { feedbackService } from '@/services';
import { notificationService } from '@/services';
import { invoiceService } from '@/services';
import { QUERY_KEYS } from '@/config/constants';

export default function ResidentDashboard() {
  const { user } = useAuth();

  const { data: feedbacks = [], isLoading: feedbacksLoading } = useQuery({
    queryKey: [QUERY_KEYS.residentFeedbacks],
    queryFn: feedbackService.getResidentFeedbacks,
    staleTime: 30000,
  });

  const { data: notifications = [], isLoading: notificationsLoading } = useQuery({
    queryKey: [QUERY_KEYS.residentNotifications],
    queryFn: notificationService.getResidentNotifications,
    staleTime: 30000,
  });

  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: [QUERY_KEYS.residentInvoices],
    queryFn: invoiceService.getResidentInvoices,
    staleTime: 30000,
  });

  const isLoading = feedbacksLoading || notificationsLoading || invoicesLoading;

  // Calculate stats
  const totalFeedbacks = feedbacks.length;
  const unreadNotifications = notifications.filter(n => !n.is_read).length;
  const unpaidInvoices = invoices.filter(i => i.status === 'unpaid').length;

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
