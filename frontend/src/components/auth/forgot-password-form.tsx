"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import type { ForgotPasswordFormValues } from "@/lib/validations/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authService } from "@/services/authService";
import { toast } from "sonner";
import Link from "next/link";

type ForgotPasswordFormProps = {
  className?: string;
};

export function ForgotPasswordForm({ className }: ForgotPasswordFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setLoading(true);
    try {
      await authService.forgotPassword(data.email);
      localStorage.setItem("resetEmail", data.email);
      toast.success("Mã OTP đã được gửi đến email của bạn");
      router.push("/verify-otp-reset");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
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
          <CardTitle className="text-xl">Quên mật khẩu</CardTitle>
          <CardDescription>
            Nhập email của bạn để nhận mã xác thực
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
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
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Đang gửi..." : "Gửi mã xác thực"}
              </Button>
              <Link href="/signin">
                <Button type="button" variant="ghost" className="w-full">
                  Quay lại đăng nhập
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
