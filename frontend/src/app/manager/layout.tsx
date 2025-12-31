"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRouteGuard } from "@/lib/hooks/useRouteGuard";
import { ManagerSidebar } from "@/components/layout/manager-sidebar";

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const { isLoading, isAuthorized } = useRouteGuard({
    allowedRoles: ["manager", "admin"],
    redirectTo: "/resident/home",
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-neutral-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-6 w-6 animate-spin border-2 border-neutral-900 border-t-transparent dark:border-white dark:border-t-transparent" />
          <p className="text-sm text-neutral-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-neutral-950">
        <div className="flex flex-col items-center gap-4 text-center max-w-md p-8">
          <div className="p-4 border border-neutral-200 dark:border-neutral-800">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-neutral-900 dark:text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="square"
                strokeLinejoin="miter"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">
            Không có quyền truy cập
          </h1>
          <p className="text-sm text-neutral-500">
            Bạn không có quyền truy cập vào khu vực quản lý.
          </p>
          <button
            onClick={() => router.push("/resident/home")}
            className="mt-4 px-6 py-2 bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 transition-colors"
          >
            Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <ManagerSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main
        className={`transition-all duration-200 ${
          collapsed ? "ml-20" : "ml-64"
        }`}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
