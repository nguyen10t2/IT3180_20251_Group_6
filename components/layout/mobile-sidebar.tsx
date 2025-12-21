"use client";

import { Menu } from "lucide-react";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger, 
  SheetTitle, 
  SheetDescription 
} from "@/components/ui/sheet";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation"; 

export const MobileSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  if (!isMounted) {
    return null;
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-slate-200/60">
          <Menu className="h-6 w-6 text-slate-700" />
        </Button>
      </SheetTrigger>
      
      <SheetContent side="left" className="p-0 bg-slate-900 border-none w-72 text-white">
        {/* 👇 BẮT BUỘC PHẢI THÊM ĐOẠN NÀY ĐỂ FIX LỖI */}
        <SheetTitle className="hidden">Menu</SheetTitle>
        <SheetDescription className="hidden">
            Mobile navigation sidebar
        </SheetDescription>
        {/* 👆 Kết thúc đoạn thêm */}

        <Sidebar />
      </SheetContent>
    </Sheet>
  );
};