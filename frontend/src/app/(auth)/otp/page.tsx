"use client";

import { OTPForm } from "@/components/auth/otp-form";
import { motion } from "framer-motion";
import { ShieldCheck, LockKeyhole, Building2 } from "lucide-react";

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

const NoiseSvg = () => (
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="fixed inset-0 h-full w-full opacity-[0.03] pointer-events-none mix-blend-overlay">
    <filter id="noiseFilter">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
    </filter>
    <rect width="100%" height="100%" filter="url(#noiseFilter)" />
  </svg>
);

export default function OTPPage() {
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
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-zinc-950 to-zinc-950 pointer-events-none z-0" />
        <NoiseSvg />
        
        {/* Animated Blobs (Màu Xanh Dương/Blue - Biểu tượng sự tin cậy) */}
        <motion.div
          animate={{ scale: [1, 1.25, 1], rotate: [0, 45, 0], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] z-0"
        />
         <motion.div
          animate={{ scale: [1.2, 1, 1.2], x: [0, 60, 0], y: [0, -60, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] bg-cyan-500/20 rounded-full blur-[100px] z-0"
        />
        
        {/* Nội dung */}
        <motion.div variants={itemVariants} className="relative z-20 flex items-center gap-3 text-xl font-bold tracking-tight">
           <div className="p-2.5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl shadow-xl shadow-blue-500/10">
             <Building2 className="w-6 h-6" />
           </div>
           <span className="bg-gradient-to-r from-white via-blue-100 to-blue-300 bg-clip-text text-transparent">Kogu Express</span>
        </motion.div>

        <motion.div variants={itemVariants} className="relative z-20 mt-auto max-w-md">
          <blockquote className="space-y-4 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-2xl shadow-blue-900/20">
            <div className="flex gap-1 text-blue-400">
               <ShieldCheck className="w-6 h-6 fill-blue-400/20" />
            </div>
            <p className="text-2xl font-medium leading-relaxed text-white/90 font-serif italic">
              "Xác thực hai lớp giúp bảo vệ tài khoản của bạn khỏi mọi truy cập trái phép. An toàn tuyệt đối."
            </p>
          </blockquote>
        </motion.div>
      </motion.div>

      {/* CỘT PHẢI: OTP Form */}
      <div className="relative flex items-center justify-center p-6 lg:p-12 bg-slate-50 dark:bg-zinc-900/50 backdrop-blur-xl z-10">
        {/* Background Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[150px] pointer-events-none -z-10" />

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[450px] relative z-20"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex flex-col space-y-3 text-center">
             <div className="flex justify-center mb-4">
              <motion.div whileHover={{ scale: 1.1, rotate: 10 }} className="p-4 bg-blue-500/10 rounded-2xl shadow-sm border border-blue-500/20">
                <LockKeyhole className="w-10 h-10 text-blue-600" />
              </motion.div>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 via-blue-600 to-cyan-600 dark:from-white dark:via-blue-400 dark:to-cyan-400 bg-clip-text text-transparent pb-1">
              Xác thực OTP
            </h1>
            <p className="text-base text-muted-foreground max-w-sm mx-auto">
              Vui lòng nhập mã 6 số chúng tôi vừa gửi đến email của bạn.
            </p>
          </motion.div>

          {/* Form Container */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -4, boxShadow: "0 20px 40px -15px rgba(37, 99, 235, 0.15)" }} // Blue shadow
            className="bg-white/70 dark:bg-zinc-800/70 backdrop-blur-xl p-8 rounded-3xl shadow-xl shadow-zinc-200/50 dark:shadow-zinc-950/50 border border-white/40 dark:border-white/10 transition-all duration-300"
          >
             <OTPForm mode="signup" />
          </motion.div>

          <motion.p variants={itemVariants} className="px-8 text-center text-xs text-muted-foreground">
             Không nhận được mã? Hãy kiểm tra cả hộp thư Spam hoặc thử gửi lại sau ít phút.
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}