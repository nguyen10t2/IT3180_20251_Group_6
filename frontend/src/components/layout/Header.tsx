'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks';
import { Moon, Sun, Monitor, LogOut } from 'lucide-react';
import { useTheme } from '@/hooks';
import { Button } from '@/components/ui';
import { authService } from '@/services';
import { getInitials } from '@/utils/helpers';
import { ROUTES } from '@/config/constants';

export function Header() {
  const router = useRouter();
  const { user, clearAuth } = useAuth();
  const { theme, setTheme } = useTheme();
  const [showThemeMenu, setShowThemeMenu] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
      router.push(ROUTES.LOGIN);
    }
  };

  const themeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;
  const ThemeIcon = themeIcon;

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-primary">BlueMoon</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Switcher */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="h-9 w-9 p-0"
            >
              <ThemeIcon className="h-5 w-5" />
            </Button>
            
            {showThemeMenu && (
              <div className="absolute right-0 mt-2 w-40 rounded-md border bg-card shadow-lg">
                <button
                  onClick={() => {
                    setTheme('light');
                    setShowThemeMenu(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-accent"
                >
                  <Sun className="h-4 w-4" />
                  Sáng
                </button>
                <button
                  onClick={() => {
                    setTheme('dark');
                    setShowThemeMenu(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-accent"
                >
                  <Moon className="h-4 w-4" />
                  Tối
                </button>
                <button
                  onClick={() => {
                    setTheme('system');
                    setShowThemeMenu(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-accent"
                >
                  <Monitor className="h-4 w-4" />
                  Hệ thống
                </button>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium text-sm"
            >
              {getInitials(user?.full_name || '')}
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-md border bg-card shadow-lg">
                <div className="border-b px-4 py-3">
                  <p className="font-medium text-sm">{user?.full_name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-accent"
                >
                  <LogOut className="h-4 w-4" />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
