"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema } from "@/lib/validations/auth";
import type { SignInFormValues } from "@/lib/validations/auth";
import Link from "next/link";
import Image from "next/image";

type SignInFormProps = {
  onSubmit: (data: SignInFormValues) => Promise<void>;
  isLoading?: boolean;
  className?: string;
};

export function SignInForm({
  className,
  onSubmit,
  isLoading = false,
}: SignInFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
  });

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
             <Link href="/">
                {/* Ensure logo is available, or use placeholder text if needed, keeping existing logic */}
                <Image
                  src="/logo.svg"
                  alt="Kogu Express"
                  width={48}
                  height={48}
                  className="size-12"
                  priority
                />
             </Link>
          </div>
          <CardTitle className="text-2xl">Chào mừng quay lại</CardTitle>
          <CardDescription>
            Đăng nhập tài khoản Kogu của bạn
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
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Mật khẩu</Label>
                  <Link
                    href="/forgot-password"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
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
      <div className="text-balance text-center text-xs text-muted-foreground">
        Bằng cách tiếp tục, bạn đồng ý với{" "}
        <Link href="#" className="underline underline-offset-4 hover:text-primary">
          Điều khoản dịch vụ
        </Link>{" "}
        và{" "}
        <Link href="#" className="underline underline-offset-4 hover:text-primary">
          Chính sách bảo mật
        </Link>
        .
      </div>
    </div>
  );
}
