"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";

type AllowedRole = "manager" | "admin" | "resident";

interface UseRouteGuardOptions {
  allowedRoles: AllowedRole[];
  redirectTo: string;
}

export function useRouteGuard({ allowedRoles, redirectTo }: UseRouteGuardOptions) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuthStore();
  const [isAuthorized, setIsAuthorized] = useState(false);

  const checkAuthorization = useCallback(() => {
    // Still loading auth state
    if (loading) return;

    // Not authenticated
    if (!user) {
      const searchParams = new URLSearchParams({ redirect: pathname });
      router.replace(`/signin?${searchParams.toString()}`);
      return;
    }

    // Check role
    const hasPermission = allowedRoles.includes(user.role as AllowedRole);
    
    if (!hasPermission) {
      router.replace(redirectTo);
      return;
    }

    setIsAuthorized(true);
  }, [user, loading, allowedRoles, redirectTo, router, pathname]);

  useEffect(() => {
    checkAuthorization();
  }, [checkAuthorization]);

  return { isAuthorized, isLoading: loading || !isAuthorized };
}
