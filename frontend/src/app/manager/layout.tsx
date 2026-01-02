'use client';

import { useRequireAuth } from '@/hooks';
import { DashboardLayout } from '@/components/layout';
import { 
  LayoutDashboard, 
  Users, 
  Home, 
  FileText, 
  MessageSquare, 
  Bell 
} from 'lucide-react';
import { ROUTES } from '@/config/constants';

const sidebarItems = [
  {
    label: 'Tổng quan',
    href: ROUTES.MANAGER.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    label: 'Người dùng',
    href: ROUTES.MANAGER.USERS,
    icon: Users,
  },
  {
    label: 'Cư dân',
    href: ROUTES.MANAGER.RESIDENTS,
    icon: Users,
  },
  {
    label: 'Căn hộ',
    href: ROUTES.MANAGER.HOUSES,
    icon: Home,
  },
  {
    label: 'Phản ánh',
    href: ROUTES.MANAGER.FEEDBACKS,
    icon: MessageSquare,
  },
  {
    label: 'Thông báo',
    href: ROUTES.MANAGER.NOTIFICATIONS,
    icon: Bell,
  },
];

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useRequireAuth('manager');

  return <DashboardLayout sidebarItems={sidebarItems}>{children}</DashboardLayout>;
}
