"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authService } from "@/services/authService";
import { toast } from "sonner";
import Link from "next/link";

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
      ? "Không tìm thấy email đăng ký. Vui lòng quay lại trang đăng ký."
      : "Không tìm thấy email. Vui lòng quay lại trang quên mật khẩu.";
  const successRoute = mode === "signup" ? "/signin" : "/reset-password";

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
      setError("Vui lòng nhập đầy đủ mã 6 chữ số");
      setLoading(false);
      return;
    }

    try {
      const resp =
        mode === "signup"
          ? await authService.verifyOtp(email, otp)
          : await authService.verifyOtpForReset(email, otp);

      toast.success(resp.message || "Xác thực thành công");

      if (mode === "signup") {
        localStorage.removeItem(emailKey);
      }

      router.push(successRoute);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const errMsg = error.response?.data?.message || "Xác thực không thành công";
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
          ? await authService.resendOtp(email)
          : await authService.forgotPassword(email);

      toast.success(resp.message || "Mã OTP đã được gửi lại");
    } catch (err: unknown) {
      const error = err as {
        response?: {
          status?: number;
          data?: { retry_after?: number; error?: string; message?: string };
        };
        message?: string;
      };

      if (error?.response?.status === 429) {
        const retryAfter = error?.response?.data?.retry_after;
        const msg = retryAfter
          ? `Vui lòng đợi ${retryAfter} giây trước khi gửi lại OTP`
          : error?.response?.data?.error || "Bạn đang gửi yêu cầu quá nhanh. Vui lòng đợi một chút.";
        toast.error(msg);
        return;
      }

      const msg = error?.response?.data?.error || error?.message || "Lỗi khi gửi lại mã OTP";
      toast.error(msg);
    } finally {
      setResending(false);
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
          <CardTitle className="text-xl">Xác thực OTP</CardTitle>
          <CardDescription>
            {mode === "signup"
              ? "Nhập mã OTP đã gửi đến email của bạn để hoàn tất đăng ký"
              : "Nhập mã OTP để xác nhận đặt lại mật khẩu"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <div className="grid gap-4">
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              {error && <p className="text-sm text-red-600 text-center">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
                {loading ? "Đang xác thực..." : "Xác thực"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={onResend}
                disabled={resending}
              >
                {resending ? "Đang gửi lại..." : "Gửi lại mã OTP"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
