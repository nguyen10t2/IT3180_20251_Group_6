"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema } from "@/lib/validations/auth";
import type { ResetPasswordFormValues } from "@/lib/validations/auth";
import { Lock, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";

type ResetPasswordFormProps = {
  onSubmit: (data: ResetPasswordFormValues) => Promise<void>;
  isLoading?: boolean;
  className?: string;
};

export function ResetPasswordForm({
  className,
  onSubmit,
  isLoading = false,
}: ResetPasswordFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  return (
    <div className={cn("grid gap-6", className)}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-5">
          {/* NEW PASSWORD FIELD */}
          <div className="grid gap-2">
            <Label htmlFor="newPassword" className="text-foreground/80 font-medium">Mật khẩu mới</Label>
            <div className="relative group">
              <div className="absolute left-3 top-2.5 text-muted-foreground group-focus-within:text-rose-600 transition-colors">
                <Lock className="h-5 w-5" />
              </div>
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                disabled={isLoading || isSubmitting}
                className="pl-10 pr-10 h-11 bg-white/50 dark:bg-zinc-900/50 border-slate-200 dark:border-slate-800 focus-visible:ring-rose-500 focus-visible:border-rose-500 transition-all"
                {...register("newPassword")}
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
            {errors.newPassword && (
              <p className="text-xs font-medium text-red-500 animate-in fade-in slide-in-from-top-1">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          {/* CONFIRM PASSWORD FIELD */}
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword" className="text-foreground/80 font-medium">Xác nhận mật khẩu</Label>
            <div className="relative group">
              <div className="absolute left-3 top-2.5 text-muted-foreground group-focus-within:text-rose-600 transition-colors">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                disabled={isLoading || isSubmitting}
                className="pl-10 pr-10 h-11 bg-white/50 dark:bg-zinc-900/50 border-slate-200 dark:border-slate-800 focus-visible:ring-rose-500 focus-visible:border-rose-500 transition-all"
                {...register("confirmPassword")}
              />
               <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs font-medium text-red-500 animate-in fade-in slide-in-from-top-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* SUBMIT BUTTON */}
          <Button 
            type="submit" 
            disabled={isLoading || isSubmitting}
            className="mt-2 h-11 w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white shadow-lg shadow-rose-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] group"
          >
            {isLoading || isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang cập nhật...
              </>
            ) : (
              <>
                Xác nhận đổi mật khẩu
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}