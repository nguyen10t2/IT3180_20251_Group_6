'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { authService, userService } from '@/services';
import { useAuthStore } from '@/store';
import { loginSchema, type LoginFormData } from '@/utils/validation';
import { getErrorMessage } from '@/utils/helpers';
import { ROUTES } from '@/config/constants';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [error, setError] = React.useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: async (data) => {
      try {
        // First set the token in store
        const tempUser = { 
          id: '', email: '', full_name: '', avatar_url: null, 
          resident_id: null, role: '', status: '', email_verified: false, 
          approved_by: null, approved_at: null, rejected_reason: null, 
          last_login_at: null, last_login_ip: null, failed_login_attempts: 0, 
          locked_until: null, deleted_at: null, created_at: '', updated_at: '' 
        };
        setAuth(tempUser, data.accessToken);
        
        // Wait a bit for Zustand persist to save
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Get user info
        const user = await userService.getCurrentUser();
        setAuth(user, data.accessToken);

        // Redirect based on role
        if (user.role === 'manager') {
          router.push(ROUTES.MANAGER.DASHBOARD);
        } else if (user.role === 'accountant') {
          router.push(ROUTES.ACCOUNTANT.DASHBOARD);
        } else if (user.role === 'resident') {
          router.push(ROUTES.RESIDENT.DASHBOARD);
        }
      } catch (err) {
        setError(`Lấy thông tin người dùng thất bại: ${getErrorMessage(err)}`);
      }
    },
    onError: (err) => {
      setError(`Đăng nhập thất bại: ${getErrorMessage(err)}`);
    },
  });

  const onSubmit = (data: LoginFormData) => {
    setError('');
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">BlueMoon</CardTitle>
          <p className="text-muted-foreground mt-2">Đăng nhập vào hệ thống</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              placeholder="example@email.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Mật khẩu"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            <Button
              type="submit"
              className="w-full"
              loading={loginMutation.isPending}
            >
              Đăng nhập
            </Button>

            <div className="text-center text-sm space-y-2">
              <Link
                href={ROUTES.FORGOT_PASSWORD}
                className="text-primary hover:underline block"
              >
                Quên mật khẩu?
              </Link>
              <div>
                Chưa có tài khoản?{' '}
                <Link href={ROUTES.REGISTER} className="text-primary hover:underline">
                  Đăng ký ngay
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
