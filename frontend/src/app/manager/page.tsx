'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent, Loading } from '@/components/ui';
import { dashboardService } from '@/services';
import { QUERY_KEYS } from '@/config/constants';
import { formatCurrency, formatNumber } from '@/utils/helpers';
import { Users, Home, FileText, MessageSquare, DollarSign } from 'lucide-react';

export default function ManagerDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.stats],
    queryFn: () => dashboardService.getStats('manager'),
  });

  if (isLoading) {
    return <Loading text="Đang tải dữ liệu..." />;
  }

  const statCards = [
    {
      title: 'Tổng căn hộ',
      value: formatNumber(stats?.totalHouses || 0),
      icon: Home,
      color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950',
    },
    {
      title: 'Tổng cư dân',
      value: formatNumber(stats?.totalResidents || 0),
      icon: Users,
      color: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950',
    },
    {
      title: 'Người dùng chờ duyệt',
      value: formatNumber(stats?.pendingUsers || 0),
      icon: Users,
      color: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950',
    },
    {
      title: 'Tổng doanh thu',
      value: formatCurrency(stats?.totalRevenue || 0),
      icon: DollarSign,
      color: 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950',
    },
  ];

  const invoiceStats = [
    {
      title: 'Hóa đơn chờ thanh toán',
      value: formatNumber(stats?.pendingInvoices || 0),
      color: 'text-yellow-600',
    },
    {
      title: 'Hóa đơn đã thanh toán',
      value: formatNumber(stats?.paidInvoices || 0),
      color: 'text-green-600',
    },
    {
      title: 'Hóa đơn quá hạn',
      value: formatNumber(stats?.overdueInvoices || 0),
      color: 'text-red-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tổng quan</h1>
        <p className="text-muted-foreground mt-1">
          Thống kê tổng quan hệ thống BlueMoon
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Invoice Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Thống kê hóa đơn</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {invoiceStats.map((stat) => (
              <div key={stat.title} className="border rounded-md p-4">
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feedback Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Phản ánh chờ xử lý</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-yellow-600">
              {formatNumber(stats?.pendingFeedbacks || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Phản ánh đã giải quyết</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-600">
              {formatNumber(stats?.resolvedFeedbacks || 0)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
