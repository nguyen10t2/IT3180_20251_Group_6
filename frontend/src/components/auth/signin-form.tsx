"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema } from "@/lib/validations/auth";
import type { SignInFormValues } from "@/lib/validations/auth";
import Link from "next/link";

type SignInFormProps = {
  onSubmit: (data: SignInFormValues, reset: () => void) => Promise<void>;
  isLoading?: boolean;
  className?: string;
};

export function SignInForm({ className, onSubmit, isLoading = false }: SignInFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
  });

  const handleFormSubmit = async (data: SignInFormValues) => {
    await onSubmit(data, reset);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Link href="/" className="text-2xl font-bold tracking-tight">
              BLUEMON
            </Link>
          </div>
          <CardTitle className="text-xl">Chào mừng quay lại</CardTitle>
          <CardDescription>Đăng nhập tài khoản của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Mật khẩu</Label>
                  <Link
                    href="/forgot-password"
                    className="ml-auto text-sm hover:underline"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
                <Input id="password" type="password" {...register("password")} />
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting || isLoading}>
                {isSubmitting || isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Chưa có tài khoản?{" "}
              <Link href="/signup" className="underline underline-offset-4">
                Đăng ký
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-center text-xs text-neutral-500">
        Bằng cách tiếp tục, bạn đồng ý với{" "}
        <Link href="#" className="underline hover:text-neutral-900 dark:hover:text-white">
          Điều khoản dịch vụ
        </Link>{" "}
        và{" "}
        <Link href="#" className="underline hover:text-neutral-900 dark:hover:text-white">
          Chính sách bảo mật
        </Link>
      </div>
    </div>
  );
}
