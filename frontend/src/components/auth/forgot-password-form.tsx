"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import type { ForgotPasswordFormValues } from "@/lib/validations/auth";
import { Mail, Loader2, Send } from "lucide-react";

type ForgotPasswordFormProps = {
  onSubmit: (email: string) => Promise<void>;
  isLoading?: boolean;
  className?: string;
};

export function ForgotPasswordForm({
  className,
  onSubmit,
  isLoading = false,
}: ForgotPasswordFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const handleFormSubmit = async (data: ForgotPasswordFormValues) => {
    await onSubmit(data.email);
  };

  return (
    <div className={cn("grid gap-6", className)}>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="grid gap-5">
          {/* EMAIL FIELD */}
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-foreground/80 font-medium">Email đăng ký</Label>
            <div className="relative group">
              <div className="absolute left-3 top-2.5 text-muted-foreground group-focus-within:text-amber-600 transition-colors">
                <Mail className="h-5 w-5" />
              </div>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                disabled={isLoading || isSubmitting}
                className="pl-10 h-11 bg-white/50 dark:bg-zinc-900/50 border-slate-200 dark:border-slate-800 focus-visible:ring-amber-500 focus-visible:border-amber-500 transition-all"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-xs font-medium text-red-500 animate-in fade-in slide-in-from-top-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* SUBMIT BUTTON */}
          <Button 
            type="submit" 
            disabled={isLoading || isSubmitting}
            className="mt-2 h-11 w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] group"
          >
            {isLoading || isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang gửi...
              </>
            ) : (
              <>
                Gửi mã xác thực
                <Send className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}