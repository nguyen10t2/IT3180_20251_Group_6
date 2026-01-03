'use client';

import { useAuth, useRequireAuth } from '@/hooks';
import { DashboardLayout } from '@/components/layout';
import { 
  LayoutDashboard, 
  User, 
  FileText, 
  MessageSquare, 
  Bell,
  Home,
} from 'lucide-react';
import { ROUTES } from '@/config/constants';

const sidebarItems = [
  {
    label: 'Tổng quan',
    href: ROUTES.RESIDENT.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    label: 'Hồ sơ',
    href: ROUTES.RESIDENT.PROFILE,
    icon: User,
  },
  {
    label: 'Hộ khẩu',
    href: ROUTES.RESIDENT.HOUSEHOLD,
    icon: Home,
  },
  {
    label: 'Hóa đơn',
    href: ROUTES.RESIDENT.INVOICES,
    icon: FileText,
  },
  {
    label: 'Phản ánh',
    href: ROUTES.RESIDENT.FEEDBACKS,
    icon: MessageSquare,
  },
  {
    label: 'Thông báo',
    href: ROUTES.RESIDENT.NOTIFICATIONS,
    icon: Bell,
  },
];

export default function ResidentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  useRequireAuth('resident');

  const isActive = user?.status === 'active';
  const visibleSidebarItems = isActive
    ? sidebarItems
    : sidebarItems.filter((item) => [ROUTES.RESIDENT.DASHBOARD, ROUTES.RESIDENT.PROFILE].includes(item.href));

  return <DashboardLayout sidebarItems={visibleSidebarItems}>{children}</DashboardLayout>;
}
