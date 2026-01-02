'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent, Loading } from '@/components/ui';
import { dashboardService } from '@/services';
import { QUERY_KEYS } from '@/config/constants';
import { FileText, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';

export default function AccountantDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.stats, 'accountant'],
    queryFn: () => dashboardService.getStats('accountant'),
  });

  if (isLoading) {
    return <Loading text="Đang tải thống kê..." />;
  }

  const statCards = [
    {
      title: 'Tổng hóa đơn',
      value: stats?.totalInvoices || 0,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Chờ thanh toán',
      value: stats?.pendingInvoices || 0,
      icon: AlertCircle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Đã thanh toán',
      value: stats?.paidInvoices || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Quá hạn',
      value: stats?.overdueInvoices || 0,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tổng quan</h1>
        <p className="text-muted-foreground mt-1">
          Thống kê tài chính và hóa đơn
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-full`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
