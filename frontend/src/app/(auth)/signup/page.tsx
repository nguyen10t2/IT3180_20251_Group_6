"use client";

import { SignUpForm } from "@/components/auth/signup-form";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import type { SignUpFormValues } from "@/lib/validations/auth";
import { motion } from "framer-motion";
import { Building2, Sparkles, ShieldCheck } from "lucide-react";

// --- Animation Configs ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  },
};

// --- Noise Texture SVG ---
const NoiseSvg = () => (
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="fixed inset-0 h-full w-full opacity-[0.03] pointer-events-none mix-blend-overlay">
    <filter id="noiseFilter">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
    </filter>
    <rect width="100%" height="100%" filter="url(#noiseFilter)" />
  </svg>
);

export default function SignUpPage() {
  const { signUp, loading } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (data: SignUpFormValues) => {
    try {
      await signUp(data.fullname, data.email, data.password, data.role);
      router.push("/otp");
    } catch {
      // Error handled in store
    }
  };

  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2 overflow-hidden bg-background relative">
      {/* CỘT TRÁI: Branding (Chỉ hiện trên PC) */}
      <motion.div 
        initial="hidden"
        animate="show"
        variants={containerVariants}
        className="hidden lg:flex relative flex-col justify-between p-12 bg-zinc-950 text-white overflow-hidden"
      >
        {/* Nền động */}
        <div className="absolute inset-0 bg-zinc-950" />
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-900/40 via-zinc-950 to-zinc-950 pointer-events-none z-0" />
        <NoiseSvg />
        
        {/* Animated Blobs (Màu Xanh Ngọc & Teal) */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[120px] z-0"
        />
         <motion.div
          animate={{ scale: [1.1, 1, 1.1], x: [0, -50, 0], y: [0, 50, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/3 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] bg-teal-500/20 rounded-full blur-[100px] z-0"
        />
        
        {/* Nội dung */}
        <motion.div variants={itemVariants} className="relative z-20 flex items-center gap-3 text-xl font-bold tracking-tight">
           <div className="p-2.5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl shadow-xl shadow-emerald-500/10">
             <Building2 className="w-6 h-6" />
           </div>
           <span className="bg-gradient-to-r from-white via-emerald-100 to-emerald-300 bg-clip-text text-transparent">Kogu Express</span>
        </motion.div>

        <motion.div variants={itemVariants} className="relative z-20 mt-auto max-w-md">
          <blockquote className="space-y-4 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-2xl shadow-emerald-900/20">
            <div className="flex gap-1 text-emerald-400">
               <ShieldCheck className="w-6 h-6 fill-emerald-400/20" />
            </div>
            <p className="text-2xl font-medium leading-relaxed text-white/90 font-serif italic">
              "Gia nhập cộng đồng cư dân thông minh. Quản lý căn hộ và dịch vụ tiện ích ngay trong tầm tay."
            </p>
          </blockquote>
        </motion.div>
      </motion.div>

      {/* CỘT PHẢI: Sign Up Form */}
      <div className="relative flex items-center justify-center p-6 lg:p-12 bg-slate-50 dark:bg-zinc-900/50 backdrop-blur-xl z-10">
        {/* Background Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[150px] pointer-events-none -z-10" />

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[450px] relative z-20"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex flex-col space-y-3 text-center">
             <div className="flex justify-center mb-4 lg:hidden">
              <motion.div whileHover={{ scale: 1.1, rotate: -5 }} className="p-4 bg-emerald-500/10 rounded-2xl shadow-sm border border-emerald-500/20">
                <Building2 className="w-10 h-10 text-emerald-600" />
              </motion.div>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 via-emerald-600 to-teal-600 dark:from-white dark:via-emerald-400 dark:to-teal-400 bg-clip-text text-transparent pb-1">
              Tạo tài khoản mới
            </h1>
            <p className="text-base text-muted-foreground max-w-sm mx-auto">
              Nhập thông tin cá nhân để bắt đầu hành trình của bạn.
            </p>
          </motion.div>

          {/* Form Container */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -4, boxShadow: "0 20px 40px -15px rgba(16, 185, 129, 0.15)" }} // Emerald shadow
            className="bg-white/70 dark:bg-zinc-800/70 backdrop-blur-xl p-8 rounded-3xl shadow-xl shadow-zinc-200/50 dark:shadow-zinc-950/50 border border-white/40 dark:border-white/10 transition-all duration-300"
          >
             <SignUpForm onSubmit={handleSubmit} isLoading={loading} />
          </motion.div>

          <motion.p variants={itemVariants} className="px-8 text-center text-sm text-muted-foreground">
            Bằng việc đăng ký, bạn đồng ý với{" "}
            <a href="#" className="underline underline-offset-4 hover:text-emerald-600 font-medium transition-colors">
              Điều khoản
            </a>{" "}
            và{" "}
            <a href="#" className="underline underline-offset-4 hover:text-emerald-600 font-medium transition-colors">
              Chính sách bảo mật
            </a>.
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}