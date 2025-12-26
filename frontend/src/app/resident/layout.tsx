"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { Sidebar } from "@/components/layout/sidebar";
import { cn } from "@/lib/utils";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { loading, refreshTokenHandler, fetchMe } = useAuthStore();
  const [starting, setStarting] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const hasInitialized = useRef(false);

  useEffect(() => {
    const init = async () => {
      try {
        const currentState = useAuthStore.getState();
        const currentToken = currentState.accessToken;
        const currentUser = currentState.user;

        if (currentToken) {
          setIsAuthenticated(true);
          if (!currentUser) await fetchMe();
        } else {
          try {
            await refreshTokenHandler();
            const newState = useAuthStore.getState();
            if (newState.accessToken) {
              setIsAuthenticated(true);
              if (!newState.user) await fetchMe();
            } else {
              setIsAuthenticated(false);
            }
          } catch {
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error("Auth init error:", error);
        setIsAuthenticated(false);
      } finally {
        setStarting(false);
      }
    };

    if (hasInitialized.current) return;
    hasInitialized.current = true;
    init();
  }, [refreshTokenHandler, fetchMe]);

  if (starting || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Đang tải trang...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    router.replace("/signin");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      <main
        className={cn(
          "transition-all duration-300 min-h-screen",
          sidebarCollapsed ? "ml-20" : "ml-64",
          "p-6"
        )}
      >
        <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
           {children}
        </div>
      </main>
    </div>
  );
}
