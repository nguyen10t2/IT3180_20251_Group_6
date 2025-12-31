"use client";

import { SignInForm } from "@/components/auth/signin-form";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import type { SignInFormValues } from "@/lib/validations/auth";

// Role IDs from backend: 1=admin, 2=manager, 3=resident, 4=accountant
const MANAGER_ROLE = 'manager';
const RESIDENT_ROLE = 'resident';

export default function SignInPage() {
  const { signIn, loading } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (data: SignInFormValues, reset: () => void) => {
    try {
      await signIn(data.email, data.password);
      
      const user = useAuthStore.getState().user;
      if (user?.role === MANAGER_ROLE || user?.role === RESIDENT_ROLE) {
        router.push("/manager/dashboard");
      } else {
        router.push("/resident/home");
      }
    } catch {
      reset();
    }
  };

  return <SignInForm onSubmit={handleSubmit} isLoading={loading} />;
}
