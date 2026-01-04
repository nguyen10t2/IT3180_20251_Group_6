'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Loading,
  Select,
} from '@/components/ui';
import { invoiceService, houseService } from '@/services';
import { QUERY_KEYS } from '@/config/constants';
import { formatCurrency } from '@/utils/helpers';
import type { InvoiceWithDetails, HouseWithResident } from '@/types';
import { toast } from 'sonner';

type ChartView = 'house' | 'month' | 'quarter' | 'year';

export default function AccountantReportsPage() {
  const [chartView, setChartView] = React.useState<ChartView>('house');

  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: [QUERY_KEYS.invoices, 'accountant'],
    queryFn: () => invoiceService.getAllInvoices(),
  });

  const { data: houses = [], isLoading: housesLoading } = useQuery({
    queryKey: [QUERY_KEYS.houses],
    queryFn: houseService.getAllHousesAccountant,
  });

  // Statistics by house
  const statsbyHouse = React.useMemo(() => {
    return houses.map((house) => {
      const houseInvoices = invoices.filter((i) => i.house_id === house.id);
      const totalAmount = houseInvoices.reduce((sum, i) => sum + parseFloat(i.total_amount || '0'), 0);
      const paidAmount = houseInvoices
        .filter((i) => i.paid_at !== null)
        .reduce((sum, i) => sum + parseFloat(i.paid_amount || i.total_amount || '0'), 0);
      const unpaidAmount = totalAmount - paidAmount;

      return {
        house,
        totalAmount,
        paidAmount,
        unpaidAmount,
        invoiceCount: houseInvoices.length,
        paidCount: houseInvoices.filter((i) => i.paid_at !== null).length,
        unpaidCount: houseInvoices.filter((i) => i.paid_at === null).length,
      };
    });
  }, [houses, invoices]);

  // Chart data by month
  const chartDataByMonth = React.useMemo(() => {
    const months: { [key: string]: { total: number; paid: number; unpaid: number } } = {};
    
    invoices.forEach((invoice) => {
      const monthKey = `${invoice.period_month}/${invoice.period_year}`;
      if (!months[monthKey]) {
        months[monthKey] = { total: 0, paid: 0, unpaid: 0 };
      }
      const amount = parseFloat(invoice.total_amount || '0');
      months[monthKey].total += amount;
      if (invoice.paid_at) {
        months[monthKey].paid += amount;
      } else {
        months[monthKey].unpaid += amount;
      }
    });

    return Object.entries(months)
      .sort((a, b) => {
        const [aMonth, aYear] = a[0].split('/').map(Number);
        const [bMonth, bYear] = b[0].split('/').map(Number);
        return aYear === bYear ? aMonth - bMonth : aYear - bYear;
      })
      .map(([month, data]) => ({
        period: month,
        total: Math.round(data.total),
        paid: Math.round(data.paid),
        unpaid: Math.round(data.unpaid),
      }))
      .slice(-12); // Last 12 months
  }, [invoices]);

  // Chart data by quarter
  const chartDataByQuarter = React.useMemo(() => {
    const quarters: { [key: string]: { total: number; paid: number; unpaid: number } } = {};
    
    invoices.forEach((invoice) => {
      const quarter = Math.ceil(invoice.period_month / 3);
      const quarterKey = `Q${quarter}/${invoice.period_year}`;
      if (!quarters[quarterKey]) {
        quarters[quarterKey] = { total: 0, paid: 0, unpaid: 0 };
      }
      const amount = parseFloat(invoice.total_amount || '0');
      quarters[quarterKey].total += amount;
      if (invoice.paid_at) {
        quarters[quarterKey].paid += amount;
      } else {
        quarters[quarterKey].unpaid += amount;
      }
    });

    return Object.entries(quarters)
      .sort((a, b) => {
        const [aQuarter, aYear] = a[0].match(/Q\d+|\/\d+/g)!;
        const [bQuarter, bYear] = b[0].match(/Q\d+|\/\d+/g)!;
        return parseInt(aYear) === parseInt(bYear) 
          ? parseInt(aQuarter) - parseInt(bQuarter) 
          : parseInt(aYear) - parseInt(bYear);
      })
      .map(([quarter, data]) => ({
        period: quarter,
        total: Math.round(data.total),
        paid: Math.round(data.paid),
        unpaid: Math.round(data.unpaid),
      }));
  }, [invoices]);

  // Chart data by year
  const chartDataByYear = React.useMemo(() => {
    const years: { [key: string]: { total: number; paid: number; unpaid: number } } = {};
    
    invoices.forEach((invoice) => {
      const yearKey = String(invoice.period_year);
      if (!years[yearKey]) {
        years[yearKey] = { total: 0, paid: 0, unpaid: 0 };
      }
      const amount = parseFloat(invoice.total_amount || '0');
      years[yearKey].total += amount;
      if (invoice.paid_at) {
        years[yearKey].paid += amount;
      } else {
        years[yearKey].unpaid += amount;
      }
    });

    return Object.entries(years)
      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
      .map(([year, data]) => ({
        period: year,
        total: Math.round(data.total),
        paid: Math.round(data.paid),
        unpaid: Math.round(data.unpaid),
      }));
  }, [invoices]);

  if (invoicesLoading || housesLoading) {
    return <Loading text="Đang tải dữ liệu..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Báo cáo thống kê</h1>
        <p className="text-muted-foreground mt-1">
          Xem thống kê và báo cáo chi tiết về hóa đơn
        </p>
      </div>

      {/* Statistics by House */}
      <Card>
        <CardHeader>
          <CardTitle>Thống kê theo căn hộ</CardTitle>
        </CardHeader>
        <CardContent>
          {statsbyHouse.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr className="text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Phòng</th>
                    <th className="pb-2 font-medium text-right">Tổng hóa đơn</th>
                    <th className="pb-2 font-medium text-right">Đã thanh toán</th>
                    <th className="pb-2 font-medium text-right">Chưa thanh toán</th>
                    <th className="pb-2 font-medium text-right">Số lượng</th>
                  </tr>
                </thead>
                <tbody>
                  {statsbyHouse.map((stat) => (
                    <tr key={stat.house.id} className="border-b last:border-b-0 hover:bg-gray-50">
                      <td className="py-3">Phòng {stat.house.room_number}</td>
                      <td className="py-3 text-right font-medium">
                        {formatCurrency(stat.totalAmount)}
                      </td>
                      <td className="py-3 text-right text-green-600">
                        {formatCurrency(stat.paidAmount)}
                      </td>
                      <td className="py-3 text-right text-orange-600">
                        {formatCurrency(stat.unpaidAmount)}
                      </td>
                      <td className="py-3 text-right text-gray-600">
                        {stat.paidCount}/{stat.invoiceCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Chưa có dữ liệu
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Thống kê</CardTitle>
            <Select
              value={chartView}
              onChange={(e) => setChartView(e.target.value as ChartView)}
              options={[
                { label: 'Theo tháng', value: 'month' },
                { label: 'Theo quý', value: 'quarter' },
                { label: 'Theo năm', value: 'year' },
                { label: 'Theo căn hộ', value: 'house' },
              ]}
            />
          </div>
        </CardHeader>
        <CardContent>
          {chartView === 'month' && (
            <div>
              <div className="text-sm text-muted-foreground mb-4">12 tháng gần nhất</div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr className="text-left text-muted-foreground">
                      <th className="pb-2 font-medium">Tháng</th>
                      <th className="pb-2 font-medium text-right">Tổng</th>
                      <th className="pb-2 font-medium text-right">Đã thanh toán</th>
                      <th className="pb-2 font-medium text-right">Chưa thanh toán</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartDataByMonth.map((data) => (
                      <tr key={data.period} className="border-b last:border-b-0 hover:bg-gray-50">
                        <td className="py-3">Tháng {data.period}</td>
                        <td className="py-3 text-right">{formatCurrency(data.total)}</td>
                        <td className="py-3 text-right text-green-600">{formatCurrency(data.paid)}</td>
                        <td className="py-3 text-right text-orange-600">{formatCurrency(data.unpaid)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {chartView === 'quarter' && (
            <div>
              <div className="text-sm text-muted-foreground mb-4">Thống kê theo quý</div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr className="text-left text-muted-foreground">
                      <th className="pb-2 font-medium">Quý</th>
                      <th className="pb-2 font-medium text-right">Tổng</th>
                      <th className="pb-2 font-medium text-right">Đã thanh toán</th>
                      <th className="pb-2 font-medium text-right">Chưa thanh toán</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartDataByQuarter.map((data) => (
                      <tr key={data.period} className="border-b last:border-b-0 hover:bg-gray-50">
                        <td className="py-3">{data.period}</td>
                        <td className="py-3 text-right">{formatCurrency(data.total)}</td>
                        <td className="py-3 text-right text-green-600">{formatCurrency(data.paid)}</td>
                        <td className="py-3 text-right text-orange-600">{formatCurrency(data.unpaid)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {chartView === 'year' && (
            <div>
              <div className="text-sm text-muted-foreground mb-4">Thống kê theo năm</div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr className="text-left text-muted-foreground">
                      <th className="pb-2 font-medium">Năm</th>
                      <th className="pb-2 font-medium text-right">Tổng</th>
                      <th className="pb-2 font-medium text-right">Đã thanh toán</th>
                      <th className="pb-2 font-medium text-right">Chưa thanh toán</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartDataByYear.map((data) => (
                      <tr key={data.period} className="border-b last:border-b-0 hover:bg-gray-50">
                        <td className="py-3">{data.period}</td>
                        <td className="py-3 text-right">{formatCurrency(data.total)}</td>
                        <td className="py-3 text-right text-green-600">{formatCurrency(data.paid)}</td>
                        <td className="py-3 text-right text-orange-600">{formatCurrency(data.unpaid)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {chartView === 'house' && (
            <div>
              <div className="text-sm text-muted-foreground mb-4">Top 10 căn hộ có doanh thu cao</div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr className="text-left text-muted-foreground">
                      <th className="pb-2 font-medium">Phòng</th>
                      <th className="pb-2 font-medium text-right">Tổng</th>
                      <th className="pb-2 font-medium text-right">Đã thanh toán</th>
                      <th className="pb-2 font-medium text-right">Chưa thanh toán</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statsbyHouse
                      .sort((a, b) => b.totalAmount - a.totalAmount)
                      .slice(0, 10)
                      .map((stat) => (
                        <tr key={stat.house.id} className="border-b last:border-b-0 hover:bg-gray-50">
                          <td className="py-3">Phòng {stat.house.room_number}</td>
                          <td className="py-3 text-right">{formatCurrency(stat.totalAmount)}</td>
                          <td className="py-3 text-right text-green-600">
                            {formatCurrency(stat.paidAmount)}
                          </td>
                          <td className="py-3 text-right text-orange-600">
                            {formatCurrency(stat.unpaidAmount)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
