"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Users,
  Building2,
  FileText,
  UserCheck,
  LogOut,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bell,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/useAuthStore";

const navigationItems = [
  {
    name: "Tổng quan",
    href: "/manager/dashboard",
    icon: Home,
  },
  {
    name: "Quản lý người dùng",
    href: "/manager/user",
    icon: Users,
  },
  {
    name: "Quản lý hộ gia đình",
    href: "/manager/household",
    icon: Building2,
  },
  {
    name: "Quản lý cư dân",
    href: "/manager/resident",
    icon: UserCheck,
  },
  {
    name: "Quản lý hóa đơn",
    href: "/manager/invoice",
    icon: FileText,
  },
  {
    name: "Thông báo",
    href: "/manager/notification",
    icon: Bell,
  },
  {
    name: "Phản hồi",
    href: "/manager/feedback",
    icon: MessageSquare,
  },
];

interface ManagerSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export function ManagerSidebar({ collapsed, setCollapsed }: ManagerSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuthStore();

  const handleSignOut = async () => {
    await signOut();
    router.push("/signin");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-background border-r flex flex-col transition-all duration-300 z-50",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b flex items-center justify-between h-16">
        <Link href="/manager/dashboard" className="flex items-center gap-2 overflow-hidden">
          <Image
            src="/logo.svg"
            alt="Logo"
            width={32}
            height={32}
            className="shrink-0 size-8"
          />
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="font-bold text-lg leading-none">
                IT3180-Group6
              </span>
              <span className="text-xs text-orange-500 font-medium">Manager</span>
            </div>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex ml-auto shrink-0 h-8 w-8"
        >
          {collapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <ChevronLeft className="size-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto py-4">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm",
                isActive
                  ? "bg-orange-50 text-orange-600 font-medium dark:bg-orange-950/30 dark:text-orange-400"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className="size-5 shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start px-2 gap-2 h-auto py-2",
                collapsed && "justify-center px-0"
              )}
            >
              <Avatar className="size-8 shrink-0">
                <AvatarImage src="" alt={user?.full_name || "User"} />
                <AvatarFallback className="bg-orange-500 text-white">
                  {user?.full_name ? getInitials(user.full_name) : "M"}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex flex-col items-start min-w-0 flex-1">
                  <span className="text-sm font-medium truncate w-full text-left">
                    {user?.full_name || "Manager"}
                  </span>
                  <span className="text-xs text-orange-500 truncate w-full text-left">
                    {user?.role === "admin" ? "Quản trị viên" : "Quản lý"}
                  </span>
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56" side={collapsed ? "right" : "bottom"}>
            <DropdownMenuLabel>Tài khoản quản lý</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/manager/settings" className="cursor-pointer">
                <Settings className="mr-2 size-4" />
                <span>Cài đặt</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 size-4" />
              <span>Đăng xuất</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}