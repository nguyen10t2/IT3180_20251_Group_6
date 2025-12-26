"use client";

import { SignInForm } from "@/components/auth/signin-form";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import type { SignInFormValues } from "@/lib/validations/auth";

export default function SignInPage() {
  const { signIn, loading } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (data: SignInFormValues) => {
    try {
      await signIn(data.email, data.password);
      
      // Redirect based on user role
      const user = useAuthStore.getState().user;
      if (user?.role === "admin" || user?.role === "manager") {
        router.push("/manager/dashboard");
      } else {
        router.push("/resident/home");
      }
    } catch {
      // Error is handled in the store with toast
    }
  };

  return <SignInForm onSubmit={handleSubmit} isLoading={loading} />;
}
