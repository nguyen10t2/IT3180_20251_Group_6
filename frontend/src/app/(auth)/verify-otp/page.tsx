'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Loading } from '@/components/ui';
import { authService } from '@/services';
import { otpSchema, type OtpFormData } from '@/utils/validation';
import { getErrorMessage } from '@/utils/helpers';
import { ROUTES } from '@/config/constants';

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get('email') || '';
  
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [canResend, setCanResend] = React.useState(false);
  const [countdown, setCountdown] = React.useState(60);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      email: emailFromUrl,
    },
  });

  React.useEffect(() => {
    if (emailFromUrl) {
      setValue('email', emailFromUrl);
    }
  }, [emailFromUrl, setValue]);

  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const verifyMutation = useMutation({
    mutationFn: authService.verifyOtp,
    onSuccess: () => {
      setSuccess('Xác thực thành công! Đang chuyển hướng...');
      setTimeout(() => {
        router.push(ROUTES.LOGIN);
      }, 2000);
    },
    onError: (err) => {
      setError(`Xác thực OTP thất bại: ${getErrorMessage(err)}`);
    },
  });

  const resendMutation = useMutation({
    mutationFn: (email: string) => authService.resendOtp(email),
    onSuccess: () => {
      setSuccess('Đã gửi lại mã OTP!');
      setCanResend(false);
      setCountdown(60);
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err) => {
      setError(`Gửi lại OTP thất bại: ${getErrorMessage(err)}`);
    },
  });

  const onSubmit = (data: OtpFormData) => {
    setError('');
    setSuccess('');
    verifyMutation.mutate(data);
  };

  const handleResend = () => {
    if (canResend && emailFromUrl) {
      setError('');
      resendMutation.mutate(emailFromUrl);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">Xác thực OTP</CardTitle>
          <p className="text-muted-foreground mt-2">
            Nhập mã OTP đã được gửi đến email của bạn
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100 text-sm p-3 rounded-md">
                {success}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              disabled
              value={emailFromUrl}
              {...register('email')}
            />

            <Input
              label="Mã OTP"
              type="text"
              placeholder="123456"
              maxLength={6}
              error={errors.code?.message}
              {...register('code')}
            />

            <Button
              type="submit"
              className="w-full"
              loading={verifyMutation.isPending}
            >
              Xác thực
            </Button>

            <div className="text-center text-sm">
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendMutation.isPending}
                  className="text-primary hover:underline"
                >
                  Gửi lại mã OTP
                </button>
              ) : (
                <span className="text-muted-foreground">
                  Gửi lại sau {countdown}s
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<Loading text="Đang tải..." />}>
      <VerifyOtpContent />
    </Suspense>
  );
}
