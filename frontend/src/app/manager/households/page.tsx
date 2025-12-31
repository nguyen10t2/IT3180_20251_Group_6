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
  Building2, 
  Plus,
  Loader2,
  Search,
  Pencil,
  Trash2,
  X,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";

interface Resident {
  resident_id: string;
  fullname: string;
  phone_number: string;
  house_id?: string;
}

interface HouseHold {
  house_hold_id: string;
  room_number: string;
  room_type: string;
  floor: number;
  area: number;
  head_resident_id: string | null;
  head_fullname?: string;
  notes?: string;
  members_count?: number;
}

export default function ManagerHouseholdsPage() {
  const [loading, setLoading] = useState(true);
  const [households, setHouseholds] = useState<HouseHold[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingHousehold, setEditingHousehold] = useState<HouseHold | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    room_number: "",
    room_type: "single",
    floor: "",
    area: "",
    head_resident_id: "",
    notes: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [householdsRes, residentsRes] = await Promise.all([
        axiosInstance.get("/api/manager/households"),
        axiosInstance.get("/api/manager/residents")
      ]);
      setHouseholds(householdsRes.data.houseHolds || []);
      setResidents(residentsRes.data.residents || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  // Lọc residents chưa thuộc hộ nào (available) hoặc đang là chủ hộ hiện tại khi edit
  const availableResidents = residents.filter(r => 
    !r.house_id || (editingHousehold && r.resident_id === editingHousehold.head_resident_id)
  );

  const handleCreate = async () => {
    if (!formData.room_number || !formData.room_type || !formData.head_resident_id) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      setSaving(true);
      await axiosInstance.post("/api/manager/households", {
        room_number: formData.room_number,
        room_type: formData.room_type,
        floor: formData.floor ? parseInt(formData.floor) : null,
        area: formData.area ? parseFloat(formData.area) : null,
        head_resident_id: formData.head_resident_id || null,
        notes: formData.notes || null,
      });
      toast.success("Tạo hộ gia đình thành công");
      setShowCreateModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Error creating household:", error);
      toast.error("Không thể tạo hộ gia đình");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingHousehold) return;

    try {
      setSaving(true);
      await axiosInstance.patch(`/api/manager/households/${editingHousehold.house_hold_id}`, {
        room_number: formData.room_number,
        room_type: formData.room_type,
        floor: formData.floor ? parseInt(formData.floor) : null,
        area: formData.area ? parseFloat(formData.area) : null,
        head_resident_id: formData.head_resident_id || null,
        notes: formData.notes || null,
      });
      toast.success("Cập nhật hộ gia đình thành công");
      setEditingHousehold(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Error updating household:", error);
      toast.error("Không thể cập nhật hộ gia đình");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (householdId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa hộ gia đình này?")) return;

    try {
      await axiosInstance.delete(`/api/manager/households/${householdId}`);
      toast.success("Xóa hộ gia đình thành công");
      fetchData();
    } catch (error) {
      console.error("Error deleting household:", error);
      toast.error("Không thể xóa hộ gia đình");
    }
  };

  const resetForm = () => {
    setFormData({
      room_number: "",
      room_type: "single",
      floor: "",
      area: "",
      head_resident_id: "",
      notes: "",
    });
  };

  const openEditModal = (household: HouseHold) => {
    setEditingHousehold(household);
    setFormData({
      room_number: household.room_number,
      room_type: household.room_type,
      floor: household.floor?.toString() || "",
      area: household.area?.toString() || "",
      head_resident_id: household.head_resident_id || "",
      notes: household.notes || "",
    });
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingHousehold(null);
    resetForm();
  };

  const getRoomTypeBadge = (type: string) => {
    const types: Record<string, { label: string; className: string }> = {
      single: { label: "Căn hộ đơn", className: "bg-blue-500/10 text-blue-600" },
      double: { label: "Căn hộ đôi", className: "bg-cyan-500/10 text-cyan-600" },
    };
    const typeInfo = types[type] || types.single;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${typeInfo.className}`}>
        {typeInfo.label}
      </span>
    );
  };

  const filteredHouseholds = households.filter(h =>
    h.room_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (h.head_fullname || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isModalOpen = showCreateModal || editingHousehold !== null;
  const isEditMode = editingHousehold !== null;

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Quản lý hộ gia đình</h1>
            <p className="text-muted-foreground">
              Quản lý thông tin các căn hộ trong tòa nhà
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm hộ mới
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tổng số hộ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{households.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Căn hộ đơn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">
                {households.filter(h => h.room_type === "single").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Căn hộ đôi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-500">
                {households.filter(h => h.room_type === "double").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Households List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Danh sách hộ gia đình
                </CardTitle>
                <CardDescription>
                  Tất cả các hộ gia đình trong tòa nhà
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
            ) : filteredHouseholds.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Không có hộ gia đình nào</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredHouseholds.map((household) => (
                  <div
                    key={household.house_hold_id}
                    className="p-4 rounded-lg border hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{household.room_number}</h4>
                        <p className="text-sm text-muted-foreground">
                          Tầng {household.floor || "N/A"} • {household.area || "N/A"}m²
                        </p>
                      </div>
                      {getRoomTypeBadge(household.room_type)}
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Chủ hộ:</span>
                        <span className="font-medium">{household.head_fullname || "Chưa có"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Thành viên:</span>
                        <span className="font-medium">{household.members_count || 0} người</span>
                      </div>
                      {household.notes && (
                        <p className="text-xs text-muted-foreground italic">
                          {household.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => openEditModal(household)}
                      >
                        <Pencil className="h-3 w-3 mr-1" />
                        Sửa
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDelete(household.house_hold_id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal - Inline để tránh re-render */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {isEditMode ? "Chỉnh sửa hộ gia đình" : "Thêm hộ gia đình mới"}
              </h3>
              <Button variant="ghost" size="icon" onClick={closeModal}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Số phòng <span className="text-red-500">*</span></Label>
                <Input
                  value={formData.room_number}
                  onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                  placeholder="VD: A101"
                />
              </div>

              <div className="space-y-2">
                <Label>Loại phòng <span className="text-red-500">*</span></Label>
                <select
                  value={formData.room_type}
                  onChange={(e) => setFormData({ ...formData, room_type: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="single">Căn hộ đơn</option>
                  <option value="double">Căn hộ đôi</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tầng</Label>
                  <Input
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    placeholder="VD: 10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Diện tích (m²)</Label>
                  <Input
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    placeholder="VD: 75"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Chủ hộ <span className="text-red-500">*</span></Label>
                {availableResidents.length === 0 && !isEditMode ? (
                  <div className="p-3 bg-orange-500/10 rounded-lg text-orange-600 text-sm flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Không có cư dân khả dụng</p>
                      <p className="text-xs mt-1">Cần có cư dân đã được duyệt và chưa thuộc hộ nào để làm chủ hộ.</p>
                    </div>
                  </div>
                ) : (
                  <select
                    value={formData.head_resident_id}
                    onChange={(e) => setFormData({ ...formData, head_resident_id: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">-- Chọn chủ hộ --</option>
                    {availableResidents.map((resident) => (
                      <option key={resident.resident_id} value={resident.resident_id}>
                        {resident.fullname} - {resident.phone_number}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-2">
                <Label>Ghi chú</Label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ghi chú thêm..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={closeModal}>
                Hủy
              </Button>
              <Button 
                onClick={isEditMode ? handleUpdate : handleCreate}
                disabled={saving}
              >
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isEditMode ? "Cập nhật" : "Tạo mới"}
              </Button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
