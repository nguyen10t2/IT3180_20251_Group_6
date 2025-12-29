"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema } from "@/lib/validations/auth";
import type { SignUpFormValues } from "@/lib/validations/auth";
import Link from "next/link";
import { User, Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";

type SignUpFormProps = {
  onSubmit: (data: SignUpFormValues) => Promise<void>;
  isLoading?: boolean;
  className?: string;
};

export function SignUpForm({
  className,
  onSubmit,
  isLoading = false,
}: SignUpFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      role: "resident",
    },
  });

  return (
    <div className={cn("grid gap-6", className)}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-5">
          {/* FULL NAME FIELD */}
          <div className="grid gap-2">
            <Label htmlFor="fullname" className="text-foreground/80 font-medium">Họ và tên</Label>
            <div className="relative group">
              <div className="absolute left-3 top-2.5 text-muted-foreground group-focus-within:text-emerald-600 transition-colors">
                <User className="h-5 w-5" />
              </div>
              <Input
                id="fullname"
                placeholder="Nguyễn Văn A"
                disabled={isLoading || isSubmitting}
                className="pl-10 h-11 bg-white/50 dark:bg-zinc-900/50 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 transition-all"
                {...register("fullname")}
              />
            </div>
            {errors.fullname && (
              <p className="text-xs font-medium text-red-500 animate-in fade-in slide-in-from-top-1">
                {errors.fullname.message}
              </p>
            )}
          </div>

          {/* EMAIL FIELD */}
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-foreground/80 font-medium">Email</Label>
            <div className="relative group">
              <div className="absolute left-3 top-2.5 text-muted-foreground group-focus-within:text-emerald-600 transition-colors">
                <Mail className="h-5 w-5" />
              </div>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                disabled={isLoading || isSubmitting}
                className="pl-10 h-11 bg-white/50 dark:bg-zinc-900/50 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 transition-all"
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
            <Label htmlFor="password" className="text-foreground/80 font-medium">Mật khẩu</Label>
            <div className="relative group">
              <div className="absolute left-3 top-2.5 text-muted-foreground group-focus-within:text-emerald-600 transition-colors">
                <Lock className="h-5 w-5" />
              </div>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                disabled={isLoading || isSubmitting}
                className="pl-10 pr-10 h-11 bg-white/50 dark:bg-zinc-900/50 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 transition-all"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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
            className="mt-2 h-11 w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] group"
          >
            {isLoading || isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang khởi tạo...
              </>
            ) : (
              <>
                Đăng ký ngay
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>
        </div>
      </form>

      {/* LOGIN LINK */}
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
        Đã có tài khoản?{" "}
        <Link 
          href="/signin" 
          className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline underline-offset-4 transition-all"
        >
          Đăng nhập ngay
        </Link>
      </div>
    </div>
  );
}