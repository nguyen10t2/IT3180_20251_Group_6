'use client';

import { useAuthStore } from '@/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ROUTES } from '@/config/constants';
import { authService, userService } from '@/services';

export function useAuth() {
  const { user, isAuthenticated, setAuth, setUser, clearAuth } = useAuthStore();

  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  const isManager = (): boolean => {
    return hasRole('manager');
  };

  const isAccountant = (): boolean => {
    return hasRole('accountant');
  };

  const isResident = (): boolean => {
    return hasRole('resident');
  };

  return {
    user,
    isAuthenticated,
    setAuth,
    setUser,
    clearAuth,
    hasRole,
    isManager,
    isAccountant,
    isResident,
  };
}

export function useRequireAuth(requiredRole?: string) {
  const router = useRouter();
  const { user, isAuthenticated, hasHydrated, setAuth, clearAuth } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Wait for Zustand to hydrate
      if (!hasHydrated) {
        return;
      }

      // If already authenticated, just check role
      if (isAuthenticated && user) {
        setIsChecking(false);
        
        if (requiredRole && user.role !== requiredRole) {
          // Redirect to appropriate dashboard based on user role
          if (user.role === 'manager') {
            router.push(ROUTES.MANAGER.DASHBOARD);
          } else if (user.role === 'accountant') {
            router.push(ROUTES.ACCOUNTANT.DASHBOARD);
          } else if (user.role === 'resident') {
            router.push(ROUTES.RESIDENT.DASHBOARD);
          } else {
            router.push(ROUTES.LOGIN);
          }
        }
        return;
      }

      // Try to refresh token
      try {
        const refreshData = await authService.refreshToken();
        const userData = await userService.getCurrentUser();
        setAuth(userData, refreshData.accessToken);
        setIsChecking(false);
      } catch (error) {
        // Refresh failed, clear auth and redirect to login
        clearAuth();
        setIsChecking(false);
        router.push(ROUTES.LOGIN);
      }
    };

    checkAuth();
  }, [hasHydrated, isAuthenticated, user, requiredRole, router, setAuth, clearAuth]);

  return { user, isAuthenticated, isChecking };
}
