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
import { 
  Users, 
  Loader2,
  Search,
  Phone,
  Mail,
  IdCard,
  Building2
} from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";

interface Resident {
  id: string;
  house_id?: string;
  full_name: string;
  id_card?: string;
  date_of_birth?: string;
  phone?: string;
  email?: string;
  gender?: string;
  occupation?: string;
  house_role?: string;
  residence_status?: string;
  move_in_date?: string;
  move_out_date?: string;
  move_out_reason?: string;
  room_number?: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
}

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ManagerResidentsPage() {
  const [loading, setLoading] = useState(true);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/managers/residents");
      setResidents(res.data.residents || []);
    } catch (error) {
      console.error("Error fetching residents:", error);
      toast.error("Không thể tải danh sách cư dân");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getGenderBadge = (gender?: string) => {
    if (!gender) return null;
    const genders: Record<string, { label: string; className: string }> = {
      male: { label: "Nam", className: "bg-blue-500/10 text-blue-600" },
      female: { label: "Nữ", className: "bg-pink-500/10 text-pink-600" },
      other: { label: "Khác", className: "bg-gray-500/10 text-gray-600" },
    };
    const genderInfo = genders[gender] || genders.other;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${genderInfo.className}`}>
        {genderInfo.label}
      </span>
    );
  };

  const getHouseRoleBadge = (house_role?: string) => {
    if (!house_role) return null;
    const roles: Record<string, { label: string; className: string }> = {
      owner: { label: "Chủ hộ", className: "bg-cyan-500/10 text-cyan-600" },
      member: { label: "Thành viên", className: "bg-blue-500/10 text-blue-600" },
      tenant: { label: "Người thuê", className: "bg-purple-500/10 text-purple-600" },
    };
    const roleInfo = roles[house_role] || roles.member;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${roleInfo.className}`}>
        {roleInfo.label}
      </span>
    );
  };

  const getResidenceStatusBadge = (residence_status?: string) => {
    if (!residence_status) return null;
    const statuses: Record<string, { label: string; className: string }> = {
      thuongtru: { label: "Thường trú", className: "bg-green-500/10 text-green-600" },
      tamtru: { label: "Tạm trú", className: "bg-yellow-500/10 text-yellow-600" },
      tamvang: { label: "Tạm vắng", className: "bg-orange-500/10 text-orange-600" },
    };
    const statusInfo = statuses[residence_status] || statuses.thuongtru;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  const filteredResidents = residents.filter(r =>
    r.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.phone?.includes(searchQuery) ||
    r.id_card?.includes(searchQuery) ||
    r.room_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý cư dân</h1>
          <p className="text-muted-foreground">
            Xem thông tin các cư dân trong tòa nhà
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tổng cư dân
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{residents.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Nam
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">
                {residents.filter(r => r.gender === "male").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Nữ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pink-500">
                {residents.filter(r => r.gender === "female").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Residents List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Danh sách cư dân
                </CardTitle>
                <CardDescription>
                  Tất cả cư dân đang sinh sống trong tòa nhà
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
            ) : filteredResidents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Không có cư dân nào</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Họ và tên</TableHead>
                      <TableHead>Phòng</TableHead>
                      <TableHead>Ngày sinh</TableHead>
                      <TableHead>Giới tính</TableHead>
                      <TableHead>Vai trò</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Nghề nghiệp</TableHead>
                      <TableHead>Ngày vào ở</TableHead>
                      <TableHead>Liên hệ</TableHead>
                      <TableHead>CCCD</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResidents.map((resident) => (
                      <TableRow key={resident.id}>
                        <TableCell className="font-medium">{resident.full_name}</TableCell>
                        <TableCell>
                          {resident.room_number ? (
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <span>{resident.room_number}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground italic">Chưa có</span>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(resident.date_of_birth)}</TableCell>
                        <TableCell>{getGenderBadge(resident.gender)}</TableCell>
                        <TableCell>{getHouseRoleBadge(resident.house_role)}</TableCell>
                        <TableCell>{getResidenceStatusBadge(resident.residence_status)}</TableCell>
                        <TableCell>{resident.occupation || "-"}</TableCell>
                        <TableCell>{formatDate(resident.move_in_date)}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 text-sm">
                            {resident.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                <span>{resident.phone}</span>
                              </div>
                            )}
                            {resident.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                <span className="truncate max-w-[150px]" title={resident.email}>{resident.email}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {resident.id_card ? (
                            <div className="flex items-center gap-2">
                              <IdCard className="h-4 w-4 text-muted-foreground" />
                              <span>{resident.id_card}</span>
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

  );
}
