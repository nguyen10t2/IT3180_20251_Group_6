import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
      <main className="flex flex-col items-center gap-8 p-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
          BLUEMON
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-md">
          Hệ thống quản lý chung cư thông minh
        </p>
        <div className="flex gap-4">
          <Link
            href="/signin"
            className="inline-flex h-11 items-center justify-center px-8 bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 transition-colors"
          >
            Đăng nhập
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-11 items-center justify-center px-8 border border-neutral-300 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800 transition-colors"
          >
            Đăng ký
          </Link>
        </div>
      </main>
    </div>
  );
}
