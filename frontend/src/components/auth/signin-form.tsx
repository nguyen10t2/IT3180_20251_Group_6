"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema } from "@/lib/validations/auth";
import type { SignInFormValues } from "@/lib/validations/auth";
import Link from "next/link";
import { Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";

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
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <div className={cn("grid gap-6", className)}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-5">
          {/* EMAIL FIELD */}
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-foreground/80 font-medium">Email</Label>
            <div className="relative group">
              <div className="absolute left-3 top-2.5 text-muted-foreground group-focus-within:text-primary transition-colors">
                <Mail className="h-5 w-5" />
              </div>
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isLoading || isSubmitting}
                className="pl-10 h-11 bg-white/50 dark:bg-zinc-900/50 border-slate-200 dark:border-slate-800 focus-visible:ring-primary focus-visible:border-primary transition-all"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-xs font-medium text-red-500 animate-in fade-in slide-in-from-top-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* PASSWORD FIELD */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-foreground/80 font-medium">Mật khẩu</Label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-primary hover:text-primary/80 hover:underline transition-colors"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <div className="relative group">
              <div className="absolute left-3 top-2.5 text-muted-foreground group-focus-within:text-primary transition-colors">
                <Lock className="h-5 w-5" />
              </div>
              <Input
                id="password"
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                disabled={isLoading || isSubmitting}
                className="pl-10 pr-10 h-11 bg-white/50 dark:bg-zinc-900/50 border-slate-200 dark:border-slate-800 focus-visible:ring-primary focus-visible:border-primary transition-all"
                {...register("password")}
              />
               {/* Toggle Show Password */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs font-medium text-red-500 animate-in fade-in slide-in-from-top-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* SUBMIT BUTTON */}
          <Button 
            type="submit" 
            disabled={isLoading || isSubmitting}
            className="mt-2 h-11 w-full bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] group"
          >
            {isLoading || isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                Đăng nhập
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>
        </div>
      </form>

      {/* SIGN UP LINK */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200 dark:border-slate-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground bg-transparent backdrop-blur-sm">
            Hoặc
          </span>
        </div>
      </div>

      <div className="text-center text-sm">
        Chưa có tài khoản?{" "}
        <Link 
          href="/signup" 
          className="font-semibold text-primary hover:text-primary/80 hover:underline underline-offset-4 transition-all"
        >
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
}