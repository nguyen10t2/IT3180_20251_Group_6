"use client";

import { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  UserCheck, 
  UserX,
  Loader2,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  X,
  Phone,
  Mail,
  IdCard,
  Building2,
  Calendar,
  Briefcase,
  User
} from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";

interface UserWithResident {
  user_id: string;
  email: string;
  fullname: string;
  role: string;
  status: string;
  create_at: string;
  updated_at: string;
  // Resident info
  resident_id?: string;
  id_card?: string;
  date_of_birth?: string;
  phone_number?: string;
  gender?: string;
  occupation?: string;
  resident_role?: string;
  resident_status?: string;
  // Household info
  house_hold_id?: string;
  room_number?: string;
  floor?: number;
}

export default function ManagerUsersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserWithResident[]>([]);
  const [pendingUsers, setPendingUsers] = useState<UserWithResident[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "active" | "rejected">("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserWithResident | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch all users (đã có resident info) - dùng làm nguồn chính
      const allRes = await axiosInstance.post("/api/manager/users", {
        lastCreated: "1970-01-01",
        limit: 100
      });
      const allUsers = allRes.data.users || [];
      setUsers(allUsers);
      
      // Lọc pending users từ allUsers để đảm bảo đồng bộ
      const pending = allUsers.filter((u: UserWithResident) => u.status === "pending");
      setPendingUsers(pending);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (user: UserWithResident) => {
    // Nếu đã có resident info thì hiện luôn
    if (user.resident_id) {
      setSelectedUser(user);
      return;
    }

    // Nếu chưa có, fetch từ API
    try {
      setLoadingDetail(true);
      const res = await axiosInstance.get(`/api/manager/users/${user.user_id}`);
      setSelectedUser(res.data.user);
    } catch (error) {
      console.error("Error fetching user detail:", error);
      toast.error("Không thể tải thông tin chi tiết");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      setProcessingId(userId);
      await axiosInstance.patch(`/api/manager/users/${userId}/approve`);
      toast.success("Đã duyệt người dùng thành công");
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Error approving user:", error);
      toast.error("Không thể duyệt người dùng");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (userId: string) => {
    const reason = prompt("Nhập lý do từ chối:");
    if (!reason) return;

    try {
      setProcessingId(userId);
      await axiosInstance.patch(`/api/manager/users/${userId}/reject`, {
        rejected_reason: reason
      });
      toast.success("Đã từ chối người dùng");
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Error rejecting user:", error);
      toast.error("Không thể từ chối người dùng");
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600">
            <CheckCircle className="h-3 w-3" />
            Đã duyệt
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-600">
            <XCircle className="h-3 w-3" />
            Từ chối
          </span>
        );
      case "pending":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-600">
            <Clock className="h-3 w-3" />
            Chờ duyệt
          </span>
        );
    }
  };

  const getRoleBadge = (role: string) => {
    const roles: Record<string, { label: string; className: string }> = {
      admin: { label: "Admin", className: "bg-blue-500/10 text-blue-600" },
      manager: { label: "Quản lý", className: "bg-cyan-500/10 text-cyan-600" },
      resident: { label: "Cư dân", className: "bg-gray-500/10 text-gray-600" },
    };
    const roleInfo = roles[role] || roles.resident;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${roleInfo.className}`}>
        {roleInfo.label}
      </span>
    );
  };

  const getGenderLabel = (gender?: string) => {
    const genders: Record<string, string> = {
      male: "Nam",
      female: "Nữ",
      other: "Khác"
    };
    return genders[gender || ""] || "N/A";
  };

  const getResidentRoleLabel = (role?: string) => {
    const roles: Record<string, string> = {
      owner: "Chủ hộ",
      member: "Thành viên",
      tenant: "Người thuê"
    };
    return roles[role || ""] || "N/A";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredUsers = () => {
    let result: UserWithResident[] = [];
    
    switch (filter) {
      case "pending":
        result = pendingUsers;
        break;
      case "active":
        result = users.filter(u => u.status === "active");
        break;
      case "rejected":
        result = users.filter(u => u.status === "rejected");
        break;
      default:
        result = users;
    }

    if (searchQuery) {
      result = result.filter(u => 
        u.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return result;
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý người dùng</h1>
          <p className="text-muted-foreground">
            Xem và quản lý tài khoản người dùng trong hệ thống
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card 
            className={`cursor-pointer transition-all ${filter === "pending" ? "ring-2 ring-orange-500" : ""}`}
            onClick={() => setFilter("pending")}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Chờ duyệt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{pendingUsers.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Đã có thông tin cư dân</p>
            </CardContent>
          </Card>
          <Card 
            className={`cursor-pointer transition-all ${filter === "active" ? "ring-2 ring-green-500" : ""}`}
            onClick={() => setFilter("active")}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Đã duyệt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {users.filter(u => u.status === "active").length}
              </div>
            </CardContent>
          </Card>
          <Card 
            className={`cursor-pointer transition-all ${filter === "all" ? "ring-2 ring-primary" : ""}`}
            onClick={() => setFilter("all")}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tổng số
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Đã đăng ký thông tin cư dân</p>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filter */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Danh sách người dùng
                </CardTitle>
                <CardDescription>
                  {filter === "pending" && "Các tài khoản đang chờ duyệt"}
                  {filter === "active" && "Các tài khoản đã được duyệt"}
                  {filter === "rejected" && "Các tài khoản đã bị từ chối"}
                  {filter === "all" && "Tất cả tài khoản trong hệ thống"}
                </CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredUsers().length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Không có người dùng nào</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers().map((user) => (
                  <div
                    key={user.user_id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{user.fullname}</h4>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Đăng ký: {formatDateTime(user.create_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getRoleBadge(user.role)}
                      {getStatusBadge(user.status)}
                      
                      {/* Nút xem thông tin */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetail(user)}
                        disabled={loadingDetail}
                        className="text-primary border-primary hover:bg-primary/10"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Xem
                      </Button>
                      
                      {user.status === "pending" && (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(user.user_id)}
                            disabled={processingId === user.user_id}
                            className="bg-primary hover:bg-primary/90"
                          >
                            {processingId === user.user_id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <UserCheck className="h-4 w-4 mr-1" />
                            )}
                            Duyệt
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(user.user_id)}
                            disabled={processingId === user.user_id}
                          >
                            <UserX className="h-4 w-4 mr-1" />
                            Từ chối
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal xem chi tiết */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Thông tin chi tiết</h3>
              <Button variant="ghost" size="icon" onClick={() => setSelectedUser(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Thông tin tài khoản */}
            <div className="mb-6">
              <h4 className="font-medium text-sm text-muted-foreground mb-3 uppercase tracking-wider">
                Thông tin tài khoản
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{selectedUser.fullname}</span>
                  {getStatusBadge(selectedUser.status)}
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedUser.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Đăng ký: {formatDateTime(selectedUser.create_at)}</span>
                </div>
              </div>
            </div>

            {/* Thông tin cư dân */}
            {selectedUser.resident_id ? (
              <div className="mb-6">
                <h4 className="font-medium text-sm text-muted-foreground mb-3 uppercase tracking-wider">
                  Thông tin cư dân
                </h4>
                <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">CMND/CCCD</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <IdCard className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{selectedUser.id_card || "N/A"}</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Số điện thoại</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{selectedUser.phone_number || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Ngày sinh</Label>
                      <p className="font-medium mt-1">{formatDate(selectedUser.date_of_birth)}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Giới tính</Label>
                      <p className="font-medium mt-1">{getGenderLabel(selectedUser.gender)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Nghề nghiệp</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{selectedUser.occupation || "N/A"}</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Vai trò trong hộ</Label>
                      <p className="font-medium mt-1">{getResidentRoleLabel(selectedUser.resident_role)}</p>
                    </div>
                  </div>

                  {selectedUser.room_number && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Căn hộ</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          Phòng {selectedUser.room_number}
                          {selectedUser.floor && ` - Tầng ${selectedUser.floor}`}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-orange-500/10 rounded-lg text-orange-600 text-sm">
                <p>Người dùng chưa cập nhật thông tin cư dân</p>
              </div>
            )}

            {/* Actions */}
            {selectedUser.status === "pending" && (
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="destructive"
                  onClick={() => handleReject(selectedUser.user_id)}
                  disabled={processingId === selectedUser.user_id}
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Từ chối
                </Button>
                <Button
                  onClick={() => handleApprove(selectedUser.user_id)}
                  disabled={processingId === selectedUser.user_id}
                  className="bg-primary hover:bg-primary/90"
                >
                  {processingId === selectedUser.user_id ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <UserCheck className="h-4 w-4 mr-2" />
                  )}
                  Duyệt tài khoản
                </Button>
              </div>
            )}
            
            {selectedUser.status !== "pending" && (
              <div className="flex justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedUser(null)}>
                  Đóng
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

    </>
  );
}
