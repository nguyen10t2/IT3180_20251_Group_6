'use client';

import { useRequireAuth } from '@/hooks';
import { DashboardLayout } from '@/components/layout';
import { LayoutDashboard, FileText, Bell } from 'lucide-react';
import { ROUTES } from '@/config/constants';

const sidebarItems = [
  {
    label: 'Tổng quan',
    href: ROUTES.ACCOUNTANT.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    label: 'Hóa đơn',
    href: ROUTES.ACCOUNTANT.INVOICES,
    icon: FileText,
  },
  {
    label: 'Thông báo',
    href: ROUTES.ACCOUNTANT.NOTIFICATIONS,
    icon: Bell,
  },
];

export default function AccountantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useRequireAuth('accountant');

  return <DashboardLayout sidebarItems={sidebarItems}>{children}</DashboardLayout>;
}
