'use client';

import { useRequireAuth } from '@/hooks';
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
  useRequireAuth('resident');

  return <DashboardLayout sidebarItems={sidebarItems}>{children}</DashboardLayout>;
}
