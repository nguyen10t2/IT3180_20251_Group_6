"use client";

import { SignInForm } from "@/components/auth/signin-form";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import type { SignInFormValues } from "@/lib/validations/auth";
import { motion } from "framer-motion";
import { Building2, Quote, Sparkles } from "lucide-react";

// --- Animation Variants ---
// Hiệu ứng xuất hiện tuần tự cho các phần tử con
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Mỗi phần tử con hiện cách nhau 0.15s
      delayChildren: 0.2,
    },
  },
};

// Hiệu ứng trượt lên và hiện dần cho từng phần tử
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  },
};

// --- Noise Texture SVG (Dùng làm nền) ---
const NoiseSvg = () => (
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="fixed inset-0 h-full w-full opacity-[0.03] pointer-events-none mix-blend-overlay">
    <filter id="noiseFilter">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
    </filter>
    <rect width="100%" height="100%" filter="url(#noiseFilter)" />
  </svg>
);

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

  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2 overflow-hidden bg-background relative">
      {/* CỘT TRÁI: Branding & Visuals (Chỉ hiện trên màn hình lớn) */}
      <motion.div 
        initial="hidden"
        animate="show"
        variants={containerVariants}
        className="hidden lg:flex relative flex-col justify-between p-12 bg-zinc-950 text-white overflow-hidden"
      >
        {/* --- Layer Nền Sống Động --- */}
        <div className="absolute inset-0 bg-zinc-950" />
        {/* Gradient nền chính */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 via-zinc-950 to-zinc-950 pointer-events-none z-0" />
        {/* Lớp nhiễu hạt tạo texture cao cấp */}
        <NoiseSvg />
        
        {/* Các khối sáng di chuyển (Animated Blobs) */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/30 rounded-full blur-[120px] z-0"
        />
         <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, 100, 0],
            y: [0, -50, 0],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] z-0"
        />
        
        {/* --- Nội dung Cột Trái --- */}
        <motion.div variants={itemVariants} className="relative z-20 flex items-center gap-3 text-xl font-bold tracking-tight">
           <div className="p-2.5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl shadow-xl shadow-indigo-500/10">
             <Building2 className="w-6 h-6" />
           </div>
           <span className="bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">Kogu Express</span>
        </motion.div>

        <motion.div variants={itemVariants} className="relative z-20 mt-auto max-w-md">
          <blockquote className="space-y-4 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-2xl shadow-indigo-900/20">
            <div className="flex gap-1 text-indigo-400">
               <Sparkles className="w-5 h-5 fill-indigo-400/30" />
            </div>
            <p className="text-2xl font-medium leading-relaxed text-white/90 font-serif italic">
              "Kiến tạo không gian sống hiện đại, nơi công nghệ kết nối cộng đồng và nâng tầm trải nghiệm cư dân."
            </p>
            <footer className="text-sm text-indigo-200/80 flex items-center gap-2 pt-2 border-t border-white/10 font-semibold uppercase tracking-wider">
              <Quote className="w-4 h-4 rotate-180" /> Tầm nhìn Kogu
            </footer>
          </blockquote>
        </motion.div>
      </motion.div>

      {/* CỘT PHẢI: Login Form */}
      <div className="relative flex items-center justify-center p-6 lg:p-12 bg-slate-50 dark:bg-zinc-900/50 backdrop-blur-xl z-10">
         {/* Hình nền mờ trang trí bên phải */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none -z-10" />

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[450px] relative z-20"
        >
          {/* Header của Form */}
          <motion.div variants={itemVariants} className="flex flex-col space-y-3 text-center">
            <div className="flex justify-center mb-4 lg:hidden">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="p-4 bg-primary/10 rounded-2xl shadow-sm border border-primary/20"
              >
                <Building2 className="w-10 h-10 text-primary" />
              </motion.div>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 via-primary to-indigo-600 dark:from-white dark:via-primary dark:to-indigo-400 bg-clip-text text-transparent pb-1">
              Chào mừng trở lại!
            </h1>
            <p className="text-base text-muted-foreground max-w-sm mx-auto">
              Cổng thông tin cư dân Kogu Express. Vui lòng đăng nhập để tiếp tục.
            </p>
          </motion.div>

          {/* Form Container với hiệu ứng Glassmorphism nhẹ và Hover */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -4, boxShadow: "0 20px 40px -15px rgba(var(--primary), 0.15)" }}
            className="bg-white/70 dark:bg-zinc-800/70 backdrop-blur-xl p-8 rounded-3xl shadow-xl shadow-zinc-200/50 dark:shadow-zinc-950/50 border border-white/40 dark:border-white/10 transition-all duration-300"
          >
             {/* Đây là nơi component SignInForm cũ của bạn được render */}
             <SignInForm onSubmit={handleSubmit} isLoading={loading} />
          </motion.div>

          <motion.p variants={itemVariants} className="px-8 text-center text-sm text-muted-foreground">
            Bằng việc tiếp tục, bạn đồng ý với{" "}
            <a href="#" className="underline underline-offset-4 hover:text-primary font-medium transition-colors">
              Điều khoản
            </a>{" "}
            và{" "}
            <a href="#" className="underline underline-offset-4 hover:text-primary font-medium transition-colors">
              Chính sách bảo mật
            </a>
            .
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}