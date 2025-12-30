import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Xác thực - Bluemon",
  description: "Đăng nhập vào hệ thống quản lý chung cư Bluemon",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid items-center justify-center p-4 bg-neutral-50 dark:bg-neutral-950">
      <div className="w-full max-w-sm">
        {children}
      </div>
    </div>
  );
}
