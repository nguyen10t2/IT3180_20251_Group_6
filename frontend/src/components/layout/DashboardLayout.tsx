'use client';

import React from 'react';
import { Header } from './Header';
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/helpers';

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebarItems: Array<{
    label: string;
    href: string;
    icon: LucideIcon;
  }>;
}

export function DashboardLayout({ children, sidebarItems }: DashboardLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <Header />
      {/* Horizontal Navigation Bar */}
      <nav className="border-b bg-card">
        <div className="flex items-center gap-1 px-4 py-2 overflow-x-auto">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}
