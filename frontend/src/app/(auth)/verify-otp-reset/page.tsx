"use client";

import { OTPForm } from "@/components/auth/otp-form";
import { motion } from "framer-motion";
import { ShieldAlert, Fingerprint, Building2 } from "lucide-react";

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

export default function VerifyOtpResetPage() {
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
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/40 via-zinc-950 to-zinc-950 pointer-events-none z-0" />
        <NoiseSvg />
        
        {/* Animated Blobs (Màu Cam/Amber - Cảnh báo/Bảo mật) */}
        <motion.div
          animate={{ scale: [1, 1.25, 1], rotate: [0, -30, 0], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-600/20 rounded-full blur-[120px] z-0"
        />
         <motion.div
          animate={{ scale: [1.2, 1, 1.2], x: [0, 50, 0], y: [0, -50, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] bg-amber-500/20 rounded-full blur-[100px] z-0"
        />
        
        {/* Nội dung */}
        <motion.div variants={itemVariants} className="relative z-20 flex items-center gap-3 text-xl font-bold tracking-tight">
           <div className="p-2.5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl shadow-xl shadow-orange-500/10">
             <Building2 className="w-6 h-6" />
           </div>
           <span className="bg-gradient-to-r from-white via-orange-100 to-orange-300 bg-clip-text text-transparent">Kogu Express</span>
        </motion.div>

        <motion.div variants={itemVariants} className="relative z-20 mt-auto max-w-md">
          <blockquote className="space-y-4 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-2xl shadow-orange-900/20">
            <div className="flex gap-1 text-orange-400">
               <ShieldAlert className="w-6 h-6 fill-orange-400/20" />
            </div>
            <p className="text-2xl font-medium leading-relaxed text-white/90 font-serif italic">
              "Chúng tôi cần xác minh danh tính của bạn trước khi cấp quyền đặt lại mật khẩu. Vui lòng kiểm tra email."
            </p>
          </blockquote>
        </motion.div>
      </motion.div>

      {/* CỘT PHẢI: OTP Form (Reset Mode) */}
      <div className="relative flex items-center justify-center p-6 lg:p-12 bg-slate-50 dark:bg-zinc-900/50 backdrop-blur-xl z-10">
        {/* Background Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[150px] pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[150px] pointer-events-none -z-10" />

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[450px] relative z-20"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex flex-col space-y-3 text-center">
             <div className="flex justify-center mb-4">
              <motion.div whileHover={{ scale: 1.1, rotate: 10 }} className="p-4 bg-orange-500/10 rounded-2xl shadow-sm border border-orange-500/20">
                <Fingerprint className="w-10 h-10 text-orange-600" />
              </motion.div>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 via-orange-600 to-amber-600 dark:from-white dark:via-orange-400 dark:to-amber-400 bg-clip-text text-transparent pb-1">
              Xác thực khôi phục
            </h1>
            <p className="text-base text-muted-foreground max-w-sm mx-auto">
              Nhập mã bảo mật OTP 6 số để tiến hành đặt lại mật khẩu mới.
            </p>
          </motion.div>

          {/* Form Container */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -4, boxShadow: "0 20px 40px -15px rgba(249, 115, 22, 0.15)" }} // Orange shadow
            className="bg-white/70 dark:bg-zinc-800/70 backdrop-blur-xl p-8 rounded-3xl shadow-xl shadow-zinc-200/50 dark:shadow-zinc-950/50 border border-white/40 dark:border-white/10 transition-all duration-300"
          >
             {/* Gọi OTPForm với mode="reset" */}
             <OTPForm mode="reset" />
          </motion.div>

          <motion.p variants={itemVariants} className="px-8 text-center text-xs text-muted-foreground">
             Mã OTP chỉ có hiệu lực trong thời gian ngắn. Tuyệt đối không chia sẻ mã này cho bất kỳ ai.
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}