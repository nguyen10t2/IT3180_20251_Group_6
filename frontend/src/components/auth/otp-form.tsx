"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";
import otpService from "@/services/otpService";
import { authService } from "@/services/authService";
import { toast } from "sonner";
import Link from "next/link";
import { Loader2, ArrowRight, RefreshCcw, ArrowLeft } from "lucide-react";

type OTPFormProps = {
  mode?: "signup" | "reset";
  className?: string;
};

export function OTPForm({ className, mode = "signup" }: OTPFormProps) {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);

  const emailKey = mode === "signup" ? "signupEmail" : "resetEmail";
  const errorMessage =
    mode === "signup"
      ? "Không tìm thấy email đăng ký. Vui lòng quay lại."
      : "Không tìm thấy email. Vui lòng quay lại.";
  const successRoute = mode === "signup" ? "/signin" : "/reset-password";
  const backRoute = mode === "signup" ? "/signup" : "/forgot-password";

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const email = localStorage.getItem(emailKey) || "";
    if (!email) {
      setError(errorMessage);
      setLoading(false);
      return;
    }

    if (!otp || otp.length !== 6) {
      setError("Vui lòng nhập đầy đủ 6 chữ số");
      setLoading(false);
      return;
    }

    try {
      const resp =
        mode === "signup"
          ? await otpService.verifyOtp({ email, otp })
          : await authService.verifyOtpForReset(email, otp);

      toast.success(resp.message || "Xác thực thành công");

      if (mode === "signup") {
        localStorage.removeItem(emailKey);
      }
      // Lưu ý: Flow reset password không xóa email ngay để dùng ở trang đặt lại mật khẩu

      router.push(successRoute);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const errMsg = error.response?.data?.message || "Mã OTP không chính xác";
      setError(errMsg);
      toast.error(errMsg);
      setLoading(false);
    }
  };

  const onResend = async (e: React.MouseEvent) => {
    e.preventDefault();
    setError("");
    setResending(true);

    const email = localStorage.getItem(emailKey) || "";
    if (!email) {
      setError(errorMessage);
      setResending(false);
      return;
    }

    try {
      const resp =
        mode === "signup"
          ? await otpService.resendOtp({ email })
          : await authService.forgetPassword(email);

      toast.success(resp.message || "Đã gửi lại mã OTP mới");
    } catch (err: unknown) {
      const error = err as any;
      if (error?.response?.status === 429) {
         toast.error("Vui lòng đợi vài giây trước khi gửi lại.");
         return;
      }
      toast.error("Lỗi khi gửi lại mã OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className={cn("grid gap-6", className)}>
      <form onSubmit={onSubmit}>
        <div className="grid gap-8">
          <div className="flex flex-col items-center gap-4">
            <Label htmlFor="otp" className="sr-only">One-Time Password</Label>
            {/* Input OTP Custom Style */}
            <div className="flex justify-center w-full">
                <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => {
                    setOtp(value);
                    if (error) setError("");
                }}
                className="gap-2 sm:gap-3"
                >
                <InputOTPGroup>
                    <InputOTPSlot index={0} className="h-12 w-10 sm:h-14 sm:w-12 text-lg border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-blue-500/20" />
                    <InputOTPSlot index={1} className="h-12 w-10 sm:h-14 sm:w-12 text-lg border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-blue-500/20" />
                    <InputOTPSlot index={2} className="h-12 w-10 sm:h-14 sm:w-12 text-lg border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-blue-500/20" />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                    <InputOTPSlot index={3} className="h-12 w-10 sm:h-14 sm:w-12 text-lg border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-blue-500/20" />
                    <InputOTPSlot index={4} className="h-12 w-10 sm:h-14 sm:w-12 text-lg border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-blue-500/20" />
                    <InputOTPSlot index={5} className="h-12 w-10 sm:h-14 sm:w-12 text-lg border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-blue-500/20" />
                </InputOTPGroup>
                </InputOTP>
            </div>

            {error && (
               <div className="flex items-center gap-2 text-sm font-medium text-red-500 bg-red-50 dark:bg-red-900/10 px-3 py-2 rounded-lg animate-in fade-in slide-in-from-top-1 w-full justify-center border border-red-200 dark:border-red-900/20">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  {error}
               </div>
            )}
          </div>

          <div className="space-y-4">
            <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] group font-semibold text-base"
            >
                {loading ? (
                <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Đang xác thực...
                </>
                ) : (
                <>
                    Xác nhận mã OTP
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </>
                )}
            </Button>

            <div className="flex items-center justify-between text-sm pt-2">
                <Link
                    href={backRoute}
                    className="flex items-center text-muted-foreground hover:text-foreground transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />
                    Quay lại
                </Link>

                <button
                    type="button"
                    className="flex items-center font-medium text-blue-600 hover:text-blue-700 hover:underline underline-offset-4 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    onClick={onResend}
                    disabled={resending}
                >
                    {resending ? (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                        <RefreshCcw className="w-3 h-3 mr-1" />
                    )}
                    Gửi lại mã
                </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}