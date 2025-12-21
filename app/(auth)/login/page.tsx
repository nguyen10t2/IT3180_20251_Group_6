"use client"; 

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Building2, KeyRound, Mail, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react"; 

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      {/* Hiệu ứng nền */}
      <div className="absolute inset-0 bg-slate-100 bg-[size:20px_20px] opacity-20 [mask-image:linear-gradient(to_bottom,white,transparent)]" />
      
      <Card className="w-full max-w-[400px] shadow-2xl border-t-4 border-t-blue-600 z-10">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto bg-blue-100 p-3 rounded-full w-fit mb-2">
            <Building2 className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">
            Ban Quản Lý
          </CardTitle>
          <CardDescription>
            Đăng nhập hệ thống quản lý chung cư
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Phần Email giữ nguyên */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input id="email" placeholder="admin@chungcu.com" className="pl-9" />
            </div>
          </div>
          
          {/* Phần Mật khẩu có chỉnh sửa */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label htmlFor="password">Mật khẩu</Label>
                <Link href="#" className="text-xs text-blue-600 hover:underline">Quên mật khẩu ?</Link>
            </div>
            <div className="relative">
              <KeyRound className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                className="pl-9 pr-10" 
              />

              <button
                type="button" // Quan trọng: type="button" để không bị submit form nhầm
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" /> 
                ) : (
                  <Eye className="h-4 w-4" />    
                )}
              </button>
            </div>
          </div>

          <Button className="w-full bg-blue-600 hover:bg-blue-700 font-bold transition-all hover:scale-[1.02]">
            Đăng nhập 
          </Button>
        </CardContent>
        
        <CardFooter className="flex justify-center border-t p-4 bg-slate-50">
          <p className="text-xs text-slate-500">
            Hệ thống quản lý chung cư - Nhóm 6
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}