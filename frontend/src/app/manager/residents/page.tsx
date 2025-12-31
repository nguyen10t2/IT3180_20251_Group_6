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
  resident_id: string;
  fullname: string;
  date_of_birth?: string;
  gender?: string;
  id_card?: string;
  phone_number?: string;
  email?: string;
  house_hold_id?: string;
  room_number?: string;
  relationship?: string;
  created_at: string;
}

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
      const res = await axiosInstance.get("/api/manager/residents");
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

  const getRelationshipBadge = (relationship?: string) => {
    if (!relationship) return null;
    const relationships: Record<string, { label: string; className: string }> = {
      owner: { label: "Chủ hộ", className: "bg-cyan-500/10 text-cyan-600" },
      spouse: { label: "Vợ/Chồng", className: "bg-pink-500/10 text-pink-600" },
      child: { label: "Con", className: "bg-green-500/10 text-green-600" },
      parent: { label: "Cha/Mẹ", className: "bg-blue-500/10 text-blue-600" },
      relative: { label: "Người thân", className: "bg-orange-500/10 text-orange-600" },
      tenant: { label: "Người thuê", className: "bg-yellow-500/10 text-yellow-600" },
      other: { label: "Khác", className: "bg-gray-500/10 text-gray-600" },
    };
    const relInfo = relationships[relationship] || relationships.other;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${relInfo.className}`}>
        {relInfo.label}
      </span>
    );
  };

  const filteredResidents = residents.filter(r =>
    r.fullname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.phone_number?.includes(searchQuery) ||
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
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredResidents.map((resident) => (
                  <div
                    key={resident.resident_id}
                    className="p-4 rounded-lg border hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{resident.fullname}</h4>
                        <p className="text-sm text-muted-foreground">
                          {resident.date_of_birth && `Sinh: ${formatDate(resident.date_of_birth)}`}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {getGenderBadge(resident.gender)}
                        {getRelationshipBadge(resident.relationship)}
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      {resident.room_number && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Building2 className="h-4 w-4" />
                          <span>Phòng {resident.room_number}</span>
                        </div>
                      )}
                      {resident.phone_number && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{resident.phone_number}</span>
                        </div>
                      )}
                      {resident.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span className="truncate">{resident.email}</span>
                        </div>
                      )}
                      {resident.id_card && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <IdCard className="h-4 w-4" />
                          <span>{resident.id_card}</span>
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

  );
}
