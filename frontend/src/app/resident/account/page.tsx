"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/stores/useAuthStore";
import { residentService, Resident, HouseHold, CreateResidentData } from "@/services/residentService";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton"; // Cần thêm component này
import {
  Mail, User as UserIcon, Calendar, Phone, Briefcase, CreditCard, Home,
  Loader2, Save, X, AlertCircle, Send, Clock, CheckCircle2, MapPin, ShieldCheck
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// --- Animation Configs ---
const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, when: "beforeChildren" }
  }
};

const cardUpVariants = {
  hidden: { y: 40, opacity: 0, scale: 0.98 },
  visible: {
    y: 0, opacity: 1, scale: 1,
    transition: { type: "spring", stiffness: 90, damping: 15 }
  }
};

// --- Helper Components Styled ---
function Badge({ children, variant = "default", className }: { children: React.ReactNode, variant?: string, className?: string }) {
  const variants: Record<string, string> = {
    default: "bg-primary/10 text-primary border-primary/20 ring-primary/30",
    secondary: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300",
    success: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 ring-emerald-500/30",
    warning: "bg-amber-500/10 text-amber-600 border-amber-500/20 ring-amber-500/30",
    destructive: "bg-rose-500/10 text-rose-600 border-rose-500/20 ring-rose-500/30",
  };
  return (
    <span className={cn(`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-all ring-1 ring-inset`, variants[variant], className)}>
      {children}
    </span>
  );
}

function Select({ value, onChange, children, className = "" }: any) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`flex h-11 w-full appearance-none rounded-lg border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all backdrop-blur-sm ${className}`}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">
        <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
      </div>
    </div>
  );
}

// Component hiển thị khi đang tải (Skeleton)
const ProfileSkeleton = () => (
  <div className="grid gap-8 md:grid-cols-3 h-full">
    <Card className="md:col-span-1 h-[450px] flex flex-col overflow-hidden border-muted/40 shadow-sm">
        <Skeleton className="h-36 w-full bg-muted/60" />
        <div className="flex flex-col items-center -mt-12 px-6 space-y-4">
            <Skeleton className="h-24 w-24 rounded-full border-4 border-background" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-2 mt-4"><Skeleton className="h-6 w-16 rounded-full" /><Skeleton className="h-6 w-20 rounded-full" /></div>
            <div className="w-full space-y-2 mt-6">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
            </div>
        </div>
    </Card>
    <div className="md:col-span-2 space-y-6">
        <Skeleton className="h-[180px] w-full rounded-xl bg-muted/60" />
        <Card className="h-[300px] border-muted/40 shadow-sm p-6 space-y-6">
            <div className="flex justify-between"><Skeleton className="h-6 w-1/3" /><Skeleton className="h-8 w-20" /></div>
            <div className="grid grid-cols-2 gap-6">
                 {[1, 2, 3, 4, 5, 6].map(i => <div key={i}><Skeleton className="h-4 w-20 mb-2"/><Skeleton className="h-5 w-full"/></div>)}
            </div>
        </Card>
    </div>
  </div>
)

export default function AccountPage() {
  const { user } = useAuthStore();
  const [resident, setResident] = useState<Resident | null>(null);
  const [houseHolds, setHouseHolds] = useState<HouseHold[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [occupation, setOccupation] = useState("");
  const [newResident, setNewResident] = useState<CreateResidentData>({
    house_id: null, fullname: "", id_card: "", date_of_birth: "", phone_number: "", gender: "male", role: "thanhvien", status: "thuongtru", occupation: "",
  });

  const isUserPending = user?.status === "pending";
  const isUserRejected = user?.status === "rejected";
  const isUserNotActive = user?.status !== "active";

  useEffect(() => { 
    // Giả lập delay nhẹ để thấy hiệu ứng skeleton (bỏ setTimeout khi dùng thật)
    setTimeout(() => { fetchData(); }, 800); 
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [houseHoldsData, data] = await Promise.all([
          residentService.getHouseHolds(),
          residentService.getMyResident()
      ]);
      setHouseHolds(houseHoldsData.houseHolds);
      
      if (data.isNewResident || !data.resident) {
        setResident(null);
        setNewResident(prev => ({ ...prev, fullname: data.userInfo?.fullname || user?.fullname || "" }));
      } else {
        setResident(data.resident);
        setPhoneNumber(data.resident?.phone_number || "");
        setOccupation(data.resident?.occupation || "");
      }
    } catch (error) { console.error("Error", error); } finally { setLoading(false); }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const data = await residentService.updateMyResident({ phone_number: phoneNumber, occupation });
      setResident(data.resident);
      setIsEditing(false);
      toast.success("Cập nhật thông tin thành công!");
    } catch (error) { toast.error("Không thể cập nhật thông tin"); } finally { setSaving(false); }
  };

  const handleCreateResident = async () => {
    if (!newResident.fullname || !newResident.date_of_birth || !newResident.phone_number) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc"); return;
    }
    try {
      setSaving(true);
      const data = await residentService.createMyResident(newResident);
      setResident(data.resident);
      setIsCreating(false);
      toast.success(data.message);
    } catch (error: any) { toast.error(error.response?.data?.message || "Lỗi tạo cư dân"); } finally { setSaving(false); }
  };

  const handleCancel = () => {
    setPhoneNumber(resident?.phone_number || "");
    setOccupation(resident?.occupation || "");
    setIsEditing(false);
  };

  // Utilities
  const getInitials = (name: string) => name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const formatDate = (d: string) => new Date(d).toLocaleDateString("vi-VN");
  const getRoleLabel = (r: string) => ({ admin: "Quản trị viên", manager: "Quản lý", resident: "Cư dân", accountant: "Kế toán" }[r] || r);
  const getHouseRoleLabel = (r: string) => ({ chuho: "Chủ hộ", nguoidaidien: "Người đại diện", nguoithue: "Người thuê", thanhvien: "Thành viên" }[r] || r);
  const getGenderLabel = (g: string) => ({ male: "Nam", female: "Nữ", other: "Khác" }[g] || g);

  // --- Render Sections ---
  const renderCreateResidentForm = () => (
    <motion.div variants={cardUpVariants} layout className="md:col-span-2">
      <Card className="border-primary/20 shadow-xl shadow-primary/5 overflow-hidden backdrop-blur-sm bg-background/80">
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-purple-500 to-blue-500" />
        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100/80 dark:border-slate-800/80">
          <CardTitle className="flex items-center gap-2 text-xl">
            <ShieldCheck className="h-6 w-6 text-primary" /> Đăng ký thông tin cư dân
          </CardTitle>
          <CardDescription>Điền đầy đủ thông tin để Ban Quản Lý xác thực danh tính của bạn.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Form fields - giữ nguyên logic, chỉ thêm class CSS cho Input */}
          <div className="grid gap-5 md:grid-cols-2">
             {/* ... (Các ô input giữ nguyên logic, chỉ thay đổi className để đẹp hơn) */}
             <div className="space-y-2"><Label>Họ và tên <span className="text-red-500">*</span></Label><Input value={newResident.fullname} onChange={(e) => setNewResident({ ...newResident, fullname: e.target.value })} className="h-11 bg-background/50 backdrop-blur-sm focus-visible:ring-primary focus-visible:border-primary transition-all" placeholder="Nguyễn Văn A" /></div>
             <div className="space-y-2"><Label>CCCD/CMND</Label><Input value={newResident.id_card} onChange={(e) => setNewResident({ ...newResident, id_card: e.target.value })} className="h-11 bg-background/50 backdrop-blur-sm focus-visible:ring-primary transition-all" placeholder="001..." /></div>
             <div className="space-y-2"><Label>Ngày sinh <span className="text-red-500">*</span></Label><Input type="date" value={newResident.date_of_birth} onChange={(e) => setNewResident({ ...newResident, date_of_birth: e.target.value })} className="h-11 bg-background/50 backdrop-blur-sm focus-visible:ring-primary transition-all" /></div>
             <div className="space-y-2"><Label>Số điện thoại <span className="text-red-500">*</span></Label><Input value={newResident.phone_number} onChange={(e) => setNewResident({ ...newResident, phone_number: e.target.value })} className="h-11 bg-background/50 backdrop-blur-sm focus-visible:ring-primary transition-all" /></div>
             <div className="space-y-2"><Label>Giới tính</Label><Select value={newResident.gender} onChange={(v: any) => setNewResident({ ...newResident, gender: v })}><option value="male">Nam</option><option value="female">Nữ</option><option value="other">Khác</option></Select></div>
             <div className="space-y-2"><Label>Nghề nghiệp</Label><Input value={newResident.occupation} onChange={(e) => setNewResident({ ...newResident, occupation: e.target.value })} className="h-11 bg-background/50 backdrop-blur-sm focus-visible:ring-primary transition-all" /></div>
          </div>
          <Separator className="my-4 bg-slate-200/70 dark:bg-slate-700/70"/>
          <div className="bg-slate-50/80 dark:bg-slate-900/60 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md">
             <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 text-primary"><Home className="w-4 h-4"/> Thông tin cư trú</h3>
             <div className="grid gap-4 md:grid-cols-3">
                {/* Select holds - giữ nguyên logic */}
                <div className="space-y-2"><Label>Căn hộ</Label><Select value={newResident.house_id || ""} onChange={(v: any) => setNewResident({ ...newResident, house_id: v || null })}><option value="">-- Chọn căn hộ --</option>{houseHolds.map((h) => (<option key={h.house_hold_id} value={h.house_hold_id}>{h.room_number} - Tầng {h.floor}</option>))}</Select></div>
                <div className="space-y-2"><Label>Vai trò <span className="text-red-500">*</span></Label><Select value={newResident.role} onChange={(v: any) => setNewResident({ ...newResident, role: v })}><option value="chuho">Chủ hộ</option><option value="nguoidaidien">Người đại diện</option><option value="nguoithue">Người thuê</option><option value="thanhvien">Thành viên</option></Select></div>
                <div className="space-y-2"><Label>Tình trạng <span className="text-red-500">*</span></Label><Select value={newResident.status} onChange={(v: any) => setNewResident({ ...newResident, status: v })}><option value="thuongtru">Thường trú</option><option value="tamtru">Tạm trú</option><option value="tamvang">Tạm vắng</option></Select></div>
             </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setIsCreating(false)} disabled={saving} className="hover:bg-slate-100 dark:hover:bg-slate-800">Hủy</Button>
            <Button onClick={handleCreateResident} disabled={saving} className="bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-700 text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
              {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Send className="h-4 w-4 mr-1" />} Gửi đăng ký
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderStatusCard = (type: 'pending' | 'waiting' | 'rejected') => {
    const config = {
      pending: { color: "text-orange-600", bg: "bg-orange-50/50 border-orange-200/60", icon: AlertCircle, title: "Cần cập nhật thông tin", desc: "Tài khoản cần thông tin cư dân để kích hoạt." },
      waiting: { color: "text-blue-600", bg: "bg-blue-50/50 border-blue-200/60", icon: Clock, title: "Đang chờ duyệt", desc: "Thông tin đang được BQL kiểm tra." },
      rejected: { color: "text-red-600", bg: "bg-red-50/50 border-red-200/60", icon: AlertCircle, title: "Yêu cầu bị từ chối", desc: "Vui lòng kiểm tra lại hoặc liên hệ BQL." },
    }[type];
    const Icon = config.icon;

    return (
      <motion.div variants={cardUpVariants} layout className="md:col-span-2">
        <Card className={`border backdrop-blur-sm shadow-sm ${config.bg} dark:bg-opacity-10 dark:border-opacity-20 overflow-hidden relative`}>
          {/* Hiệu ứng phát sáng nền */}
          <div className={`absolute inset-0 opacity-10 bg-gradient-to-r ${config.color.includes('orange') ? 'from-orange-400 to-amber-300' : config.color.includes('blue') ? 'from-blue-400 to-indigo-300' : 'from-red-400 to-rose-300'} blur-xl pointer-events-none`}/>
          <CardHeader className="pb-3 relative">
            <CardTitle className={`flex items-center gap-2 text-lg ${config.color}`}>
              <Icon className="h-5 w-5" /> {config.title}
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-300">{config.desc}</CardDescription>
          </CardHeader>
          <CardContent className="relative">
            {type === 'pending' && !isCreating && (
              <Button onClick={() => setIsCreating(true)} className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md transition-transform hover:scale-105">
                <UserIcon className="h-4 w-4 mr-2" /> Đăng ký ngay
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // --- Main Content ---
  if (loading) return <div className="max-w-5xl mx-auto pt-6 pb-10"><ProfileSkeleton /></div>;

  return (
    <motion.div 
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 max-w-5xl mx-auto pb-10 pt-6"
    >
       {/* Header Header với hiệu ứng chữ gradient */}
      <motion.div variants={cardUpVariants} className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-primary to-slate-800 dark:from-slate-100 dark:via-primary dark:to-slate-300 bg-clip-text text-transparent inline-block">
          Hồ sơ cá nhân
        </h1>
        <p className="text-muted-foreground text-lg font-medium">Quản lý thông tin và trạng thái cư trú.</p>
      </motion.div>

      <div className="grid gap-8 md:grid-cols-3 items-start">
        {/* LEFT COLUMN: Profile Card Professional */}
        <motion.div variants={cardUpVariants} className="md:col-span-1 h-full" whileHover={{ y: -4, transition: { duration: 0.2 } }}>
          <Card className="overflow-hidden shadow-xl shadow-slate-200/40 dark:shadow-slate-900/30 border-slate-200/60 dark:border-slate-800/60 h-full flex flex-col bg-background/70 backdrop-blur-md relative group">
            {/* Ảnh bìa Glassmorphism Gradient */}
            <div className="h-36 bg-gradient-to-br from-indigo-600/90 via-primary/80 to-purple-600/90 relative overflow-hidden">
                {/* Hiệu ứng vân sáng */}
               <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10 mix-blend-soft-light"></div>
               <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-all duration-700"></div>
               <div className="absolute top-10 right-10 w-20 h-20 bg-purple-300/30 rounded-full blur-xl group-hover:bg-purple-300/40 transition-all duration-700"></div>
            </div>
            
            <div className="px-6 relative flex-1 flex flex-col items-center text-center -mt-14 pb-8">
              <div className="relative">
                <Avatar className="h-28 w-28 border-[5px] border-background shadow-2xl ring-2 ring-primary/20 transition-transform group-hover:scale-105">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 text-3xl font-extrabold tracking-wider">
                    {user?.fullname ? getInitials(user.fullname) : "U"}
                    </AvatarFallback>
                </Avatar>
                {/* Status indicator dot */}
                 <span className={`absolute bottom-2 right-2 w-5 h-5 rounded-full border-[3px] border-background ${isUserNotActive ? (isUserRejected ? 'bg-red-500' : 'bg-amber-500') : 'bg-emerald-500'}`}></span>
              </div>

              <h2 className="text-2xl font-bold truncate w-full mt-4 text-slate-900 dark:text-slate-100">{resident?.fullname || user?.fullname}</h2>
              <p className="text-sm font-medium text-muted-foreground mb-5 bg-slate-100/80 dark:bg-slate-800/80 px-3 py-1 rounded-full">{user?.email}</p>

              <div className="flex flex-wrap gap-2 justify-center mb-8">
                 <Badge variant="secondary" className="shadow-sm">{user?.role ? getRoleLabel(user.role) : "Cư dân"}</Badge>
                 {isUserNotActive ? (
                   <Badge variant={isUserRejected ? "destructive" : "warning"} className="shadow-sm">{isUserPending ? "Chờ duyệt" : "Bị từ chối"}</Badge>
                 ) : (
                   <Badge variant="success" className="gap-1.5 pl-2 shadow-sm"><CheckCircle2 className="w-3.5 h-3.5 fill-emerald-500 text-white"/> Đã kích hoạt</Badge>
                 )}
              </div>

              {/* Quick Stats Professional */}
              <div className="w-full grid grid-cols-1 gap-4 mt-auto">
                 {resident?.room_number && (
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] transition-all hover:shadow-md group/item">
                    <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover/item:bg-primary group-hover/item:text-primary-foreground transition-colors"><Home className="w-5 h-5"/></div>
                    <div className="text-left">
                       <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Căn hộ</p>
                       <p className="font-bold text-base text-slate-800 dark:text-slate-200">P.{resident.room_number} <span className="text-sm font-normal text-muted-foreground">- Tầng {resident.floor}</span></p>
                    </div>
                 </div>
                 )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* RIGHT COLUMN: Actions & Details */}
        <div className="md:col-span-2 space-y-8">
          <AnimatePresence mode="wait">
            {/* Sử dụng layout prop để chuyển đổi mượt mà chiều cao */}
            <motion.div key={isUserPending ? 'pending' : 'active'} layout>
                 {isUserPending && !resident && !isCreating && renderStatusCard('pending')}
                 {isUserPending && !resident && isCreating && renderCreateResidentForm()}
                 {isUserPending && resident && renderStatusCard('waiting')}
                 {isUserRejected && renderStatusCard('rejected')}
            </motion.div>
          </AnimatePresence>

          {/* Resident Details Information Professional */}
          {((!isUserNotActive && resident) || (isUserPending && resident)) && (
             <motion.div variants={cardUpVariants} layout>
               <Card className="shadow-xl shadow-slate-200/30 dark:shadow-slate-900/20 border-t-[6px] border-t-primary/80 bg-background/80 backdrop-blur-sm overflow-hidden relative">
                 <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100/80 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-900/30">
                   <div className="space-y-1">
                     <CardTitle className="text-xl flex items-center gap-2"><ShieldCheck className="text-primary h-5 w-5"/> Thông tin chi tiết</CardTitle>
                     <CardDescription>Dữ liệu cư dân được lưu trữ an toàn.</CardDescription>
                   </div>
                   {!isUserNotActive && (
                     !isEditing ? (
                       <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="hover:bg-primary/10 hover:text-primary border-primary/30 font-medium hover:border-primary transition-all shadow-sm">
                         Chỉnh sửa
                       </Button>
                     ) : (
                       <div className="flex gap-3">
                         <Button variant="ghost" size="sm" onClick={handleCancel} disabled={saving} className="text-red-500 hover:text-red-600 hover:bg-red-50/80 font-medium"><X className="h-4 w-4 mr-1"/> Hủy</Button>
                         <Button size="sm" onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 transition-transform hover:scale-105 active:scale-95">
                           {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin"/> : <Save className="h-4 w-4 mr-1"/>} Lưu lại
                         </Button>
                       </div>
                     )
                   )}
                 </CardHeader>
                 
                 <CardContent className="pt-8 px-8">
                   {resident && (
                     <div className="space-y-8">
                       {/* Read-only section with enhanced styling */}
                       <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 relative z-10">
                          <DetailItem icon={UserIcon} label="Họ và tên" value={resident.fullname} primary />
                          <DetailItem icon={CreditCard} label="CCCD/CMND" value={resident.id_card} />
                          <DetailItem icon={Calendar} label="Ngày sinh" value={formatDate(resident.date_of_birth)} />
                          <DetailItem icon={UserIcon} label="Giới tính" value={getGenderLabel(resident.gender)} />
                          <DetailItem icon={Home} label="Vai trò hộ" value={getHouseRoleLabel(resident.role)} />
                          {resident.registration_date && <DetailItem icon={Clock} label="Ngày đăng ký" value={formatDate(resident.registration_date)} />}
                       </div>
                       
                       {/* Editable section with focused styling */}
                       <AnimatePresence>
                        <motion.div 
                            layout
                            initial={{ opacity: 0.8, scale: 0.99 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`p-6 rounded-2xl border ${isEditing ? 'bg-primary/5 border-primary/30 shadow-[0_0_15px_-3px_rgba(var(--primary),0.15)]' : 'bg-slate-50/60 dark:bg-slate-900/40 border-dashed border-slate-300 dark:border-slate-700'} transition-all duration-300 relative overflow-hidden`}
                        >
                              {/* Hiệu ứng nền khi edit */}
                             {isEditing && <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50 pointer-events-none" />}

                          <h3 className={`text-sm font-bold mb-5 flex items-center gap-2 ${isEditing ? 'text-primary' : 'text-muted-foreground'}`}>
                            <div className={`p-1.5 rounded-full ${isEditing ? 'bg-primary text-primary-foreground' : 'bg-slate-200 dark:bg-slate-800'}`}><MapPin className="w-4 h-4"/></div>
                            Thông tin liên lạc {!isUserNotActive && <span className="text-xs font-normal opacity-80">(Có thể chỉnh sửa)</span>}
                          </h3>
                          <div className="grid gap-6 sm:grid-cols-2 relative z-10">
                            <div className="space-y-2">
                              <Label className={isEditing ? "text-primary font-medium" : ""}>Số điện thoại</Label>
                              {isEditing && !isUserNotActive ? (
                                <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="bg-background/80 backdrop-blur-sm h-11 border-primary/30 focus-visible:ring-primary shadow-sm" />
                              ) : (
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/40 border border-transparent font-medium text-slate-800 dark:text-slate-200">
                                  <Phone className="h-5 w-5 text-muted-foreground/70" /> {resident.phone_number}
                                </div>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label className={isEditing ? "text-primary font-medium" : ""}>Nghề nghiệp</Label>
                              {isEditing && !isUserNotActive ? (
                                <Input value={occupation} onChange={(e) => setOccupation(e.target.value)} className="bg-background/80 backdrop-blur-sm h-11 border-primary/30 focus-visible:ring-primary shadow-sm" />
                              ) : (
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/40 border border-transparent font-medium text-slate-800 dark:text-slate-200">
                                  <Briefcase className="h-5 w-5 text-muted-foreground/70" /> {resident.occupation || "Chưa cập nhật"}
                                </div>
                              )}
                            </div>
                          </div>
                       </motion.div>
                       </AnimatePresence>
                     </div>
                   )}
                   {/* Hình nền trang trí mờ */}
                   <div className="absolute right-0 bottom-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"><UserIcon className="w-64 h-64 -mr-10 -mb-10 text-primary"/></div>
                 </CardContent>
               </Card>
             </motion.div>
          )}

          {/* Empty State Professional */}
          {!isUserNotActive && !resident && (
            <motion.div variants={cardUpVariants}>
              <Card className="border-dashed border-2 border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                  <div className="p-5 bg-slate-100 dark:bg-slate-800 rounded-full shadow-inner"><UserIcon className="h-12 w-12 text-slate-400" /></div>
                  <div>
                    <h3 className="font-bold text-xl text-slate-700 dark:text-slate-200">Chưa có thông tin cư dân</h3>
                    <p className="text-muted-foreground text-sm max-w-sm mt-2 mx-auto">Hồ sơ của bạn hiện đang trống. Vui lòng liên hệ ban quản lý tòa nhà để cập nhật dữ liệu.</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function DetailItem({ icon: Icon, label, value, primary = false }: { icon: any, label: string, value: string | undefined, primary?: boolean }) {
  return (
    <div className="space-y-1.5 group">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 opacity-70 group-hover:text-primary transition-colors" /> {label}
      </span>
      <div className={`font-bold ${primary ? 'text-xl text-primary' : 'text-base text-slate-800 dark:text-slate-200'} truncate`}>
        {value || "---"}
      </div>
    </div>
  )
}