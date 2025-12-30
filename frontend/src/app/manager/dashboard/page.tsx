"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";

export default function ManagerDashboard() {
  const { user, signOut } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/signin");
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Manager Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
          >
            Đăng xuất
          </button>
        </div>
        
        <div className="border border-neutral-200 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-900">
          <h2 className="text-lg font-semibold mb-4">Thông tin user</h2>
          <pre className="text-sm bg-neutral-100 dark:bg-neutral-800 p-4 overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        <p className="mt-8 text-neutral-500 text-center">
          🚧 Dashboard đang được phát triển...
        </p>
      </div>
    </div>
  );
}
