import { Sidebar } from "@/components/layout/sidebar";
import { MobileSidebar } from "@/components/layout/mobile-sidebar"; 

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full relative bg-slate-50">
      {/* Sidebar cho Desktop (Giữ nguyên, chỉ hiện khi màn hình to) */}
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80]">
        <Sidebar />
      </div>
      
      {/* Phần nội dung chính */}
      <main className="md:pl-72 min-h-screen">
        {/* Header cho Mobile (Chỗ chứa cái nút 3 gạch) */}
        <div className="flex items-center p-4 border-b bg-white shadow-sm md:hidden">
            <MobileSidebar /> 
            <span className="ml-4 font-bold text-slate-700"> Manager</span>
        </div>
        
        {/* Nội dung trang web */}
        <div className="p-8">
            {children}
        </div>
      </main>
    </div>
  );
}