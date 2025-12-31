"use client";

import { useState } from "react";
import { useRouteGuard } from "@/lib/hooks/useRouteGuard";
import { ManagerSidebar } from "@/components/layout/manager-sidebar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const { isLoading } = useRouteGuard({
    allowedRoles: ["manager", "admin"],
    redirectTo: "/resident/home",
  });

  if (isLoading) {
    return <LoadingSpinner color="orange" />;
  }

  return (
    <div className="min-h-screen bg-background">
      <ManagerSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main
        className={`transition-all duration-300 ${
          collapsed ? "ml-20" : "ml-64"
        }`}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
