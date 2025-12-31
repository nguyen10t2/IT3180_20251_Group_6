"use client";

import { useState } from "react";
import { useRouteGuard } from "@/lib/hooks/useRouteGuard";
import { Sidebar } from "@/components/layout/resident-sidebar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function ResidentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const { isLoading } = useRouteGuard({
    allowedRoles: ["resident"],
    redirectTo: "/manager/dashboard",
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
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
