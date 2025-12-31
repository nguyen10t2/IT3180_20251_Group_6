"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";
import {
  Users,
  Building2,
  FileText,
  UserCheck,
  ArrowRight,
  Clock,
} from "lucide-react";

interface DashboardStats {
  pendingUsers: number;
  totalHouseholds: number;
  pendingInvoices: number;
  totalResidents: number;
}

export default function ManagerDashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    pendingUsers: 0,
    totalHouseholds: 0,
    pendingInvoices: 0,
    totalResidents: 0,
  });
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [pendingUsersRes, householdsRes, residentsRes, invoicesRes] =
        await Promise.all([
          axiosInstance.get("/api/manager/users/pending"),
          axiosInstance.get("/api/manager/households"),
          axiosInstance.get("/api/manager/residents"),
          axiosInstance.get("/api/manager/invoices"),
        ]);

      const pendingUsersData = pendingUsersRes.data.users || [];
      const householdsData = householdsRes.data.houseHolds || [];
      const residentsData = residentsRes.data.residents || [];
      const invoicesData = invoicesRes.data.invoices || [];
      const pendingInvoicesCount = invoicesData.filter(
        (inv: any) => inv.status === "pending"
      ).length;

      setPendingUsers(pendingUsersData.slice(0, 5));
      setStats({
        pendingUsers: pendingUsersData.length,
        totalHouseholds: householdsData.length,
        pendingInvoices: pendingInvoicesCount,
        totalResidents: residentsData.length,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: "Chờ duyệt",
      value: stats.pendingUsers,
      description: "Người dùng mới",
      icon: UserCheck,
      href: "/manager/users?filter=pending",
    },
    {
      title: "Hộ gia đình",
      value: stats.totalHouseholds,
      description: "Tổng số",
      icon: Building2,
      href: "/manager/households",
    },
    {
      title: "Hóa đơn chưa TT",
      value: stats.pendingInvoices,
      description: "Tháng này",
      icon: FileText,
      href: "/manager/invoices?filter=pending",
    },
    {
      title: "Cư dân",
      value: stats.totalResidents,
      description: "Đã đăng ký",
      icon: Users,
      href: "/manager/residents",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin border-2 border-neutral-900 border-t-transparent dark:border-white dark:border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
          Xin chào, {user?.full_name || "Quản lý"}
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Tổng quan hệ thống quản lý chung cư BlueMoon
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <button
            key={stat.title}
            onClick={() => router.push(stat.href)}
            className="p-4 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors text-left"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-neutral-500 uppercase tracking-wide">
                {stat.title}
              </span>
              <stat.icon className="h-4 w-4 text-neutral-400" />
            </div>
            <div className="text-2xl font-semibold text-neutral-900 dark:text-white">
              {stat.value}
            </div>
            <p className="text-xs text-neutral-500 mt-1">{stat.description}</p>
          </button>
        ))}
      </div>

      {/* Pending Users */}
      <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-neutral-500" />
            <h2 className="font-medium text-neutral-900 dark:text-white">
              Người dùng chờ duyệt
            </h2>
          </div>
          <button
            onClick={() => router.push("/manager/users?filter=pending")}
            className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1"
          >
            Xem tất cả
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
        <div className="p-4">
          {pendingUsers.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              <UserCheck className="h-8 w-8 mx-auto mb-2 text-neutral-300 dark:text-neutral-600" />
              <p className="text-sm">Không có người dùng nào đang chờ duyệt</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {pendingUsers.map((pendingUser) => (
                <div
                  key={pendingUser.user_id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 flex items-center justify-center border border-neutral-200 dark:border-neutral-700 text-neutral-500">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">
                        {pendingUser.fullname}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {pendingUser.email}
                        {pendingUser.room_number &&
                          ` • Phòng ${pendingUser.room_number}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push("/manager/users")}
                    className="text-xs px-3 py-1.5 bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
                  >
                    Duyệt
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
            <h2 className="font-medium text-neutral-900 dark:text-white">
              Thao tác nhanh
            </h2>
          </div>
          <div className="p-2">
            {[
              {
                label: "Duyệt người dùng mới",
                desc: "Xem và phê duyệt các tài khoản đang chờ",
                href: "/manager/users?filter=pending",
                icon: UserCheck,
              },
              {
                label: "Quản lý hộ gia đình",
                desc: "Thêm, sửa, xóa thông tin căn hộ",
                href: "/manager/households",
                icon: Building2,
              },
              {
                label: "Quản lý hóa đơn",
                desc: "Tạo và theo dõi thanh toán hóa đơn",
                href: "/manager/invoices",
                icon: FileText,
              },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => router.push(item.href)}
                className="w-full flex items-center gap-3 p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-left"
              >
                <item.icon className="h-4 w-4 text-neutral-500" />
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                    {item.label}
                  </p>
                  <p className="text-xs text-neutral-500">{item.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
            <h2 className="font-medium text-neutral-900 dark:text-white">
              Trạng thái hệ thống
            </h2>
          </div>
          <div className="p-4 space-y-3">
            {[
              { name: "API Server", status: "Hoạt động" },
              { name: "Database", status: "Hoạt động" },
            ].map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between py-2"
              >
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-neutral-900 dark:bg-white" />
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">
                    {item.name}
                  </span>
                </div>
                <span className="text-xs text-neutral-500">{item.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
