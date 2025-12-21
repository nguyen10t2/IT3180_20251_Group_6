"use client";

import { cn } from "@/lib/utils";
import { Building2, LayoutDashboard, Users, Receipt, Settings, LogOut, Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const routes = [
  { label: "Tổng quan", icon: LayoutDashboard, href: "/dashboard", color: "text-sky-500" },
  { label: "Cư dân & Căn hộ", icon: Users, href: "/dashboard/residents", color: "text-violet-500" },
  { label: "Quản lý Chi phí", icon: Receipt, href: "/dashboard/fees", color: "text-pink-700" },
  { label: "Lịch sử Giao dịch", icon: Wallet, href: "/dashboard/transactions", color: "text-orange-500" },
  { label: "Cài đặt hệ thống", icon: Settings, href: "/dashboard/settings", color: "text-gray-500" },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-slate-900 text-white border-r border-slate-800">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14 transition hover:opacity-75">
          <div className="relative mr-4 h-8 w-8">
            <Building2 className="h-8 w-8 text-blue-500" />
          </div>
          <h1 className="text-xl font-bold">
            Apartment<span className="text-blue-500">Management</span>
          </h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};