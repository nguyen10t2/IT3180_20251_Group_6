"use client";

import { useRouteGuard } from "@/lib/hooks/useRouteGuard";
import { ResidentNavbar } from "@/components/layout/resident-navbar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function ResidentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useRouteGuard({
    allowedRoles: ["resident"],
    redirectTo: "/manager/dashboard",
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ResidentNavbar />
      <main className="flex-1">
        <div className="container mx-auto p-6 max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
