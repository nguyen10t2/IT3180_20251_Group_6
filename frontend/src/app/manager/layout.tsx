"use client";

import { useRouter } from "next/navigation";
import { useRouteGuard } from "@/lib/hooks/useRouteGuard";
import { ManagerNavbar } from "@/components/layout/manager-navbar";

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isLoading, isAuthorized } = useRouteGuard({
    allowedRoles: ["manager", "admin"],
    redirectTo: "/resident/home",
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-6 w-6 animate-spin border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center max-w-md p-8">
          <div className="p-4 border rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-foreground"
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
          <h1 className="text-xl font-semibold text-foreground">
            Không có quyền truy cập
          </h1>
          <p className="text-sm text-muted-foreground">
            Bạn không có quyền truy cập vào khu vực quản lý.
          </p>
          <button
            onClick={() => router.push("/resident/home")}
            className="mt-4 px-6 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-md"
          >
            Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ManagerNavbar />
      <main className="flex-1">
        <div className="container mx-auto p-6 max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
