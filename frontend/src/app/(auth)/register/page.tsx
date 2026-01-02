'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { authService } from '@/services';
import { registerSchema, type RegisterFormData } from '@/utils/validation';
import { getErrorMessage } from '@/utils/helpers';
import { ROUTES } from '@/config/constants';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = React.useState('');
  const [email, setEmail] = React.useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (_, variables) => {
      setEmail(variables.email);
      router.push(`${ROUTES.VERIFY_OTP}?email=${encodeURIComponent(variables.email)}`);
    },
    onError: (err) => {
      setError(getErrorMessage(err));
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    setError('');
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">BlueMoon</CardTitle>
          <p className="text-muted-foreground mt-2">Tạo tài khoản mới</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            <Input
              label="Họ và tên"
              type="text"
              placeholder="Nguyễn Văn A"
              error={errors.name?.message}
              {...register('name')}
            />

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
              helperText="Tối thiểu 6 ký tự"
              {...register('password')}
            />

            <Button
              type="submit"
              className="w-full"
              loading={registerMutation.isPending}
            >
              Đăng ký
            </Button>

            <div className="text-center text-sm">
              Đã có tài khoản?{' '}
              <Link href={ROUTES.LOGIN} className="text-primary hover:underline">
                Đăng nhập ngay
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
