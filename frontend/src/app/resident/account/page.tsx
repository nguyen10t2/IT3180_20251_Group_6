"use client";

import { useEffect, useState } from "react";

import { useAuthStore } from "@/stores/useAuthStore";
import { residentService, Resident, HouseHold, CreateResidentData, GetMyResidentResponse } from "@/services/residentService";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Mail, 
  User as UserIcon, 
  Shield, 
  Calendar, 
  Phone, 
  Briefcase,
  CreditCard,
  Home,
  Loader2,
  Save,
  X,
  AlertCircle,
  Send,
  Clock
} from "lucide-react";
import { toast } from "sonner";

// Badge component inline
function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "destructive";
}) {
  const variants = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    outline: "border border-input bg-background",
    success: "bg-green-500/10 text-green-600 border border-green-500/20",
    warning: "bg-orange-500/10 text-orange-600 border border-orange-500/20",
    destructive: "bg-red-500/10 text-red-600 border border-red-500/20",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variants[variant]}`}
    >
      {children}
    </span>
  );
}

// Select component inline
function Select({
  value,
  onChange,
  children,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}
    >
      {children}
    </select>
  );
}

export default function AccountPage() {
  const { user } = useAuthStore();
  const [resident, setResident] = useState<Resident | null>(null);
  const [houseHolds, setHouseHolds] = useState<HouseHold[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form state for editing
  const [phoneNumber, setPhoneNumber] = useState("");
  const [occupation, setOccupation] = useState("");

  // Form state for creating new resident
  const [newResident, setNewResident] = useState<CreateResidentData>({
    house_id: null,
    fullname: "",
    id_card: "",
    date_of_birth: "",
    phone_number: "",
    gender: "male",
    role: "thanhvien",
    status: "thuongtru",
    occupation: "",
  });

  const isUserPending = user?.status === "pending";
  const isUserRejected = user?.status === "rejected";
  const isUserNotActive = user?.status !== "active";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch households cho dropdown
      const houseHoldsData = await residentService.getHouseHolds();
      setHouseHolds(houseHoldsData.houseHolds);

      // Fetch resident info
      const data = await residentService.getMyResident();
      
      if (data.isNewResident || !data.resident) {
        // User chưa có resident record - điền sẵn fullname từ userInfo
        setResident(null);
        setNewResident(prev => ({
          ...prev,
          fullname: data.userInfo?.fullname || user?.fullname || "",
        }));
      } else {
        setResident(data.resident);
        setPhoneNumber(data.resident?.phone_number || "");
        setOccupation(data.resident?.occupation || "");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const data = await residentService.updateMyResident({
        phone_number: phoneNumber,
        occupation: occupation,
      });
      setResident(data.resident);
      setIsEditing(false);
      toast.success("Cập nhật thông tin thành công!");
    } catch (error) {
      console.error("Error updating resident:", error);
      toast.error("Không thể cập nhật thông tin");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setPhoneNumber(resident?.phone_number || "");
    setOccupation(resident?.occupation || "");
    setIsEditing(false);
  };

  const handleCreateResident = async () => {
    // Validate
    if (!newResident.fullname || !newResident.date_of_birth || !newResident.phone_number) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      setSaving(true);
      const data = await residentService.createMyResident(newResident);
      setResident(data.resident);
      setIsCreating(false);
      toast.success(data.message);
    } catch (error: any) {
      console.error("Error creating resident:", error);
      toast.error(error.response?.data?.message || "Không thể tạo thông tin cư dân");
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      admin: "Quản trị viên",
      manager: "Quản lý",
      resident: "Cư dân",
      accountant: "Kế toán",
    };
    return roles[role] || role;
  };

  const getHouseRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      chuho: "Chủ hộ",
      nguoidaidien: "Người đại diện",
      nguoithue: "Người thuê",
      thanhvien: "Thành viên",
    };
    return roles[role] || role;
  };

  const getStatusLabel = (status: string) => {
    const statuses: Record<string, { label: string; variant: "success" | "warning" | "secondary" }> = {
      thuongtru: { label: "Thường trú", variant: "success" },
      tamtru: { label: "Tạm trú", variant: "warning" },
      tamvang: { label: "Tạm vắng", variant: "secondary" },
    };
    return statuses[status] || { label: status, variant: "secondary" as const };
  };

  const getGenderLabel = (gender: string) => {
    const genders: Record<string, string> = {
      male: "Nam",
      female: "Nữ",
      other: "Khác",
    };
    return genders[gender] || gender;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  // Render form tạo mới resident
  const renderCreateResidentForm = () => (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserIcon className="h-5 w-5" />
          Đăng ký thông tin cư dân
        </CardTitle>
        <CardDescription>
          Vui lòng điền đầy đủ thông tin để hoàn tất đăng ký. Sau khi gửi, ban quản lý sẽ xét duyệt.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Thông tin cơ bản */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fullname">Họ và tên <span className="text-red-500">*</span></Label>
            <Input
              id="fullname"
              value={newResident.fullname}
              onChange={(e) => setNewResident({ ...newResident, fullname: e.target.value })}
              placeholder="Nguyễn Văn A"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="id_card">CCCD/CMND</Label>
            <Input
              id="id_card"
              value={newResident.id_card}
              onChange={(e) => setNewResident({ ...newResident, id_card: e.target.value })}
              placeholder="001234567890"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date_of_birth">Ngày sinh <span className="text-red-500">*</span></Label>
            <Input
              id="date_of_birth"
              type="date"
              value={newResident.date_of_birth}
              onChange={(e) => setNewResident({ ...newResident, date_of_birth: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone_number">Số điện thoại <span className="text-red-500">*</span></Label>
            <Input
              id="phone_number"
              value={newResident.phone_number}
              onChange={(e) => setNewResident({ ...newResident, phone_number: e.target.value })}
              placeholder="0901234567"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Giới tính <span className="text-red-500">*</span></Label>
            <Select
              value={newResident.gender}
              onChange={(value) => setNewResident({ ...newResident, gender: value as any })}
            >
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="occupation">Nghề nghiệp</Label>
            <Input
              id="occupation"
              value={newResident.occupation}
              onChange={(e) => setNewResident({ ...newResident, occupation: e.target.value })}
              placeholder="Kỹ sư phần mềm"
            />
          </div>
        </div>

        <Separator />

        {/* Thông tin hộ gia đình */}
        <div>
          <h3 className="text-sm font-medium mb-4">Thông tin cư trú</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="house_id">Căn hộ</Label>
              <Select
                value={newResident.house_id || ""}
                onChange={(value) => setNewResident({ ...newResident, house_id: value || null })}
              >
                <option value="">-- Chọn căn hộ --</option>
                {houseHolds.map((h) => (
                  <option key={h.house_hold_id} value={h.house_hold_id}>
                    {h.room_number} - Tầng {h.floor} ({h.area}m²)
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Vai trò trong hộ <span className="text-red-500">*</span></Label>
              <Select
                value={newResident.role}
                onChange={(value) => setNewResident({ ...newResident, role: value as any })}
              >
                <option value="chuho">Chủ hộ</option>
                <option value="nguoidaidien">Người đại diện</option>
                <option value="nguoithue">Người thuê</option>
                <option value="thanhvien">Thành viên</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Tình trạng cư trú <span className="text-red-500">*</span></Label>
              <Select
                value={newResident.status}
                onChange={(value) => setNewResident({ ...newResident, status: value as any })}
              >
                <option value="thuongtru">Thường trú</option>
                <option value="tamtru">Tạm trú</option>
                <option value="tamvang">Tạm vắng</option>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => setIsCreating(false)}
            disabled={saving}
          >
            <X className="h-4 w-4 mr-1" />
            Hủy
          </Button>
          <Button onClick={handleCreateResident} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-1" />
            )}
            Gửi đăng ký
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Render thông báo cho user pending chưa có resident
  const renderPendingNotice = () => (
    <Card className="md:col-span-2 border-orange-500/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-600">
          <AlertCircle className="h-5 w-5" />
          Hoàn tất đăng ký thông tin
        </CardTitle>
        <CardDescription>
          Tài khoản của bạn đang chờ được duyệt. Vui lòng hoàn tất thông tin cư dân.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg space-y-3">
          <h4 className="font-medium">Các bước kích hoạt tài khoản:</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Điền đầy đủ thông tin cư dân bên dưới</li>
            <li>Gửi thông tin để ban quản lý xét duyệt</li>
            <li>Chờ ban quản lý duyệt và kích hoạt tài khoản</li>
            <li>Sau khi được duyệt, bạn có thể sử dụng đầy đủ tính năng</li>
          </ol>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Chức năng bị giới hạn khi chưa được duyệt:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Không thể thanh toán hóa đơn</li>
            <li>Không thể gửi phản ánh/góp ý</li>
            <li>Không nhận được thông báo hộ gia đình</li>
          </ul>
        </div>

        {!isCreating && (
          <Button onClick={() => setIsCreating(true)} className="w-full">
            <UserIcon className="h-4 w-4 mr-2" />
            Đăng ký thông tin cư dân
          </Button>
        )}
      </CardContent>
    </Card>
  );

  // Render thông báo đang chờ duyệt (có resident nhưng user vẫn pending)
  const renderPendingApproval = () => (
    <Card className="md:col-span-2 border-blue-500/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-600">
          <Clock className="h-5 w-5" />
          Đang chờ duyệt
        </CardTitle>
        <CardDescription>
          Thông tin cư dân của bạn đã được gửi và đang chờ ban quản lý xét duyệt.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Ban quản lý sẽ xem xét và phê duyệt thông tin của bạn. Sau khi được duyệt, 
            tài khoản sẽ được kích hoạt và bạn có thể sử dụng đầy đủ các tính năng.
          </p>
        </div>
      </CardContent>
    </Card>
  );

  // Render thông báo bị từ chối
  const renderRejectedNotice = () => (
    <Card className="md:col-span-2 border-red-500/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          Tài khoản bị từ chối
        </CardTitle>
        <CardDescription>
          Tài khoản của bạn đã bị từ chối. Vui lòng liên hệ ban quản lý để biết thêm chi tiết.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Nếu bạn cho rằng đây là sự nhầm lẫn, vui lòng liên hệ trực tiếp với ban quản lý 
            tòa nhà để được hỗ trợ.
          </p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Thông tin cá nhân</h1>
        <p className="text-muted-foreground">
          Xem và quản lý thông tin cá nhân của bạn
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Card */}
          <Card className="md:col-span-1">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="" alt={user?.fullname || "User"} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {user?.fullname ? getInitials(user.fullname) : "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle>{resident?.fullname || user?.fullname || "Người dùng"}</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
              <div className="pt-2 flex flex-wrap justify-center gap-2">
                <Badge variant="secondary">
                  {user?.role ? getRoleLabel(user.role) : "Cư dân"}
                </Badge>
                {isUserNotActive ? (
                  <Badge variant={isUserRejected ? "destructive" : "warning"}>
                    {isUserPending ? "Chờ duyệt" : "Bị từ chối"}
                  </Badge>
                ) : (
                  <Badge variant="success">Đã kích hoạt</Badge>
                )}
                {resident && (
                  <Badge variant={getStatusLabel(resident.status).variant}>
                    {getStatusLabel(resident.status).label}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Email đã xác thực</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Trạng thái: {user?.status === "active" ? "Hoạt động" : user?.status === "pending" ? "Chờ duyệt" : "Bị từ chối"}
                  </span>
                </div>
                {resident?.room_number && (
                  <div className="flex items-center gap-3 text-sm">
                    <Home className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Phòng {resident.room_number} {resident.floor ? `- Tầng ${resident.floor}` : ""}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Content based on status */}
          {isUserPending && !resident && !isCreating && renderPendingNotice()}
          {isUserPending && !resident && isCreating && renderCreateResidentForm()}
          {isUserPending && resident && renderPendingApproval()}
          {isUserRejected && renderRejectedNotice()}

          {/* Info Card - Chỉ hiện khi user active hoặc có resident và đang chờ duyệt */}
          {((!isUserNotActive && resident) || (isUserPending && resident)) && (
            <Card className="md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Thông tin chi tiết</CardTitle>
                  <CardDescription>
                    Thông tin cư dân của bạn
                  </CardDescription>
                </div>
                {!isUserNotActive && !isEditing ? (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    Chỉnh sửa
                  </Button>
                ) : !isUserNotActive && isEditing ? (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCancel} disabled={saving}>
                      <X className="h-4 w-4 mr-1" />
                      Hủy
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={saving}>
                      {saving ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-1" />
                      )}
                      Lưu
                    </Button>
                  </div>
                ) : null}
              </CardHeader>
              <CardContent className="space-y-6">
                {resident && (
                  <>
                    {/* Thông tin cơ bản - không thể sửa */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-muted-foreground">Họ và tên</Label>
                        <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                          <UserIcon className="h-4 w-4 text-muted-foreground" />
                          <span>{resident.fullname}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground">CCCD/CMND</Label>
                        <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span>{resident.id_card || "Chưa cập nhật"}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground">Ngày sinh</Label>
                        <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDate(resident.date_of_birth)}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground">Giới tính</Label>
                        <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                          <UserIcon className="h-4 w-4 text-muted-foreground" />
                          <span>{getGenderLabel(resident.gender)}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground">Vai trò trong hộ</Label>
                        <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                          <Home className="h-4 w-4 text-muted-foreground" />
                          <span>{getHouseRoleLabel(resident.role)}</span>
                        </div>
                      </div>
                      {resident.registration_date && (
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Ngày đăng ký</Label>
                          <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{formatDate(resident.registration_date)}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Thông tin có thể chỉnh sửa */}
                    <div>
                      <h3 className="text-sm font-medium mb-4 text-muted-foreground">
                        Thông tin liên hệ {!isUserNotActive && "(có thể chỉnh sửa)"}
                      </h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Số điện thoại</Label>
                          {isEditing && !isUserNotActive ? (
                            <Input
                              id="phone"
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              placeholder="Nhập số điện thoại"
                            />
                          ) : (
                            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{resident.phone_number}</span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="occupation">Nghề nghiệp</Label>
                          {isEditing && !isUserNotActive ? (
                            <Input
                              id="occupation"
                              value={occupation}
                              onChange={(e) => setOccupation(e.target.value)}
                              placeholder="Nhập nghề nghiệp"
                            />
                          ) : (
                            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                              <Briefcase className="h-4 w-4 text-muted-foreground" />
                              <span>{resident.occupation || "Chưa cập nhật"}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Trường hợp user active nhưng chưa có resident (hiếm) */}
          {!isUserNotActive && !resident && (
            <Card className="md:col-span-2">
              <CardContent className="py-8">
                <div className="text-center">
                  <UserIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Bạn chưa có thông tin cư dân. Vui lòng liên hệ ban quản lý để được hỗ trợ.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
