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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  FileText, 
  Plus,
  Loader2,
  Search,
  Pencil,
  Trash2,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Calendar,
  Building2,
  CreditCard
} from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";

interface Invoice {
  id: string;
  invoice_number: string;
  house_id: string;
  room_number?: string;
  period_month: number;
  period_year: number;
  total_amount: number;
  due_date: string;
  paid_at?: string;
  paid_amount?: number;
  payment_note?: string;
  status: string;
  invoice_types?: number;
  notes?: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
}

// Các loại hóa đơn
const INVOICE_TYPES = [
  { value: "all", label: "Tất cả loại" },
  { value: "rent", label: "Tiền thuê" },
  { value: "electricity", label: "Điện" },
  { value: "water", label: "Nước" },
  { value: "maintenance", label: "Bảo trì" },
  { value: "parking", label: "Đỗ xe" },
  { value: "service", label: "Dịch vụ" },
  { value: "other", label: "Khác" },
];

const getInvoiceTypeLabel = (type: string) => {
  const found = INVOICE_TYPES.find(t => t.value === type);
  return found ? found.label : "Khác";
};

const getInvoiceTypeBadge = (type: string) => {
  const types: Record<string, { label: string; className: string }> = {
    rent: { label: "Tiền thuê", className: "bg-blue-500/10 text-blue-600" },
    electricity: { label: "Điện", className: "bg-yellow-500/10 text-yellow-600" },
    water: { label: "Nước", className: "bg-cyan-500/10 text-cyan-600" },
    maintenance: { label: "Bảo trì", className: "bg-orange-500/10 text-orange-600" },
    parking: { label: "Đỗ xe", className: "bg-gray-500/10 text-gray-600" },
    service: { label: "Dịch vụ", className: "bg-green-500/10 text-green-600" },
    other: { label: "Khác", className: "bg-gray-500/10 text-gray-600" },
  };
  const typeInfo = types[type] || types.other;
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${typeInfo.className}`}>
      {typeInfo.label}
    </span>
  );
};

export default function ManagerInvoicesPage() {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "paid" | "overdue">("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [householdFilter, setHouseholdFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [saving, setSaving] = useState(false);
  const [households, setHouseholds] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    house_id: "",
    invoice_type: "rent",
    amount: "",
    due_date: "",
    description: "",
  });

  useEffect(() => {
    fetchInvoices();
    fetchHouseholds();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/managers/invoices");
      setInvoices(res.data.invoices || []);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.error("Không thể tải danh sách hóa đơn");
    } finally {
      setLoading(false);
    }
  };

  const fetchHouseholds = async () => {
    try {
      const res = await axiosInstance.get("/managers/households");
      setHouseholds(res.data.households || []);
    } catch (error) {
      console.error("Error fetching households:", error);
    }
  };

  const handleCreate = async () => {
    if (!formData.house_id || !formData.invoice_type || !formData.amount || !formData.due_date) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      setSaving(true);
      await axiosInstance.post("/managers/invoices", {
        house_id: formData.house_id,
        period_month: new Date(formData.due_date).getMonth() + 1,
        period_year: new Date(formData.due_date).getFullYear(),
        total_amount: parseFloat(formData.amount),
        due_date: formData.due_date,
        invoice_type: formData.invoice_type,
        notes: formData.description || null,
      });
      toast.success("Tạo hóa đơn thành công");
      setShowCreateModal(false);
      resetForm();
      fetchInvoices();
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast.error("Không thể tạo hóa đơn");
    } finally {
      setSaving(false);
    }
  };

  const handleMarkPaid = async (invoiceId: string) => {
    try {
      await axiosInstance.patch(`/managers/invoices/${invoiceId}/confirm`);
      toast.success("Đã xác nhận thanh toán");
      fetchInvoices();
    } catch (error) {
      console.error("Error updating invoice:", error);
      toast.error("Không thể cập nhật hóa đơn");
    }
  };

  const handleDelete = async (invoiceId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa hóa đơn này?")) return;

    try {
      await axiosInstance.delete(`/managers/invoices/${invoiceId}`);
      toast.success("Xóa hóa đơn thành công");
      fetchInvoices();
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast.error("Không thể xóa hóa đơn");
    }
  };

  const resetForm = () => {
    setFormData({
      house_id: "",
      invoice_type: "rent",
      amount: "",
      due_date: "",
      description: "",
    });
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingInvoice(null);
    resetForm();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600">
            <CheckCircle className="h-3 w-3" />
            Đã thanh toán
          </span>
        );
      case "overdue":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-600">
            <AlertCircle className="h-3 w-3" />
            Quá hạn
          </span>
        );
      case "pending":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-600">
            <Clock className="h-3 w-3" />
            Chờ thanh toán
          </span>
        );
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return "0 ₫";
    }
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  // Lấy invoice type từ invoice (invoice_types là ID, cần mapping với invoiceTypeSchema)
  const getInvoiceType = (invoice: Invoice): string => {
    // TODO: Map invoice_types ID to string khi có invoiceType table
    return "other";
  };

  const filteredInvoices = invoices.filter(inv => {
    const invoiceType = getInvoiceType(inv);
    
    // Search filter
    const matchesSearch = 
      inv.room_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.notes?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      getInvoiceTypeLabel(invoiceType).toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
    
    // Type filter
    const matchesType = typeFilter === "all" || invoiceType === typeFilter;
    
    // Household filter
    const matchesHousehold = householdFilter === "all" || inv.house_id === householdFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesHousehold;
  });

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Quản lý hóa đơn</h1>
            <p className="text-muted-foreground">
              Tạo và theo dõi các hóa đơn thanh toán
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tạo hóa đơn
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card 
            className={`cursor-pointer transition-all ${statusFilter === "all" ? "ring-2 ring-primary" : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tổng cộng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{invoices.length}</div>
            </CardContent>
          </Card>
          <Card 
            className={`cursor-pointer transition-all ${statusFilter === "pending" ? "ring-2 ring-orange-500" : ""}`}
            onClick={() => setStatusFilter("pending")}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Chờ thanh toán
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">
                {invoices.filter(i => i.status === "pending").length}
              </div>
            </CardContent>
          </Card>
          <Card 
            className={`cursor-pointer transition-all ${statusFilter === "overdue" ? "ring-2 ring-red-500" : ""}`}
            onClick={() => setStatusFilter("overdue")}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Quá hạn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {invoices.filter(i => i.status === "overdue").length}
              </div>
            </CardContent>
          </Card>
          <Card 
            className={`cursor-pointer transition-all ${statusFilter === "paid" ? "ring-2 ring-green-500" : ""}`}
            onClick={() => setStatusFilter("paid")}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Đã thanh toán
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {invoices.filter(i => i.status === "paid").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Label className="text-sm whitespace-nowrap">Loại hóa đơn:</Label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
            >
              {INVOICE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-sm whitespace-nowrap">Hộ gia đình:</Label>
            <select
              value={householdFilter}
              onChange={(e) => setHouseholdFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
            >
              <option value="all">Tất cả hộ</option>
              {households.map((hh) => (
                <option key={hh.id} value={hh.id}>
                  {hh.room_number} - {hh.head_fullname || "Chưa có chủ hộ"}
                </option>
              ))}
            </select>
          </div>
          {(typeFilter !== "all" || householdFilter !== "all" || statusFilter !== "all") && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setTypeFilter("all");
                setHouseholdFilter("all");
                setStatusFilter("all");
              }}
            >
              <X className="h-4 w-4 mr-1" />
              Xóa bộ lọc
            </Button>
          )}
        </div>

        {/* Invoices List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Danh sách hóa đơn
                </CardTitle>
                <CardDescription>
                  Tất cả các hóa đơn trong hệ thống
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
            ) : filteredInvoices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Không có hóa đơn nào</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã hóa đơn</TableHead>
                    <TableHead>Phòng</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Kỳ</TableHead>
                    <TableHead>Hạn thanh toán</TableHead>
                    <TableHead>Tổng tiền</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => {
                    const invoiceType = getInvoiceType(invoice);
                    return (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                        <TableCell>{invoice.room_number || "N/A"}</TableCell>
                        <TableCell>{getInvoiceTypeBadge(invoiceType)}</TableCell>
                        <TableCell>{invoice.period_month}/{invoice.period_year}</TableCell>
                        <TableCell>{formatDate(invoice.due_date)}</TableCell>
                        <TableCell className="font-bold">{formatCurrency(invoice.total_amount)}</TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedInvoice(invoice)}
                              className="h-8 w-8 p-0"
                              title="Xem chi tiết"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {invoice.status === "pending" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMarkPaid(invoice.id)}
                                className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                title="Xác nhận thanh toán"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDelete(invoice.id)}
                              className="h-8 w-8 p-0"
                              title="Xóa"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal Xem Chi Tiết */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Chi tiết hóa đơn</h3>
              <Button variant="ghost" size="icon" onClick={() => setSelectedInvoice(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Thông tin hóa đơn */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-muted-foreground">Mã hóa đơn</span>
                <span className="font-mono font-medium">{selectedInvoice.invoice_number}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Phòng</Label>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{selectedInvoice.room_number || "N/A"}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Kỳ thanh toán</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      Tháng {selectedInvoice.period_month}/{selectedInvoice.period_year}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Hạn thanh toán</Label>
                  <p className="font-medium">{formatDate(selectedInvoice.due_date)}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Trạng thái</Label>
                  <div>{getStatusBadge(selectedInvoice.status)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Loại hóa đơn</Label>
                  <div>{getInvoiceTypeBadge(getInvoiceType(selectedInvoice))}</div>
                </div>
                <div className="p-4 bg-primary/5 rounded-lg">
                  <Label className="text-xs text-muted-foreground">Tổng tiền</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold text-primary">
                      {formatCurrency(selectedInvoice.total_amount)}
                    </span>
                  </div>
                </div>
              </div>

              {selectedInvoice.notes && (
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Ghi chú</Label>
                  <p className="text-sm p-3 bg-muted/30 rounded-lg">{selectedInvoice.notes}</p>
                </div>
              )}

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Ngày tạo</Label>
                <p className="text-sm">{formatDate(selectedInvoice.created_at)}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 mt-4 border-t">
              {selectedInvoice.status === "pending" && (
                <Button
                  onClick={() => {
                    handleMarkPaid(selectedInvoice.id);
                    setSelectedInvoice(null);
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Xác nhận đã thanh toán
                </Button>
              )}
              <Button variant="outline" onClick={() => setSelectedInvoice(null)}>
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Inline để tránh re-render */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Tạo hóa đơn mới</h3>
              <Button variant="ghost" size="icon" onClick={closeModal}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Hộ gia đình <span className="text-red-500">*</span></Label>
                <select
                  value={formData.house_id}
                  onChange={(e) => setFormData({ ...formData, house_id: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Chọn hộ gia đình</option>
                  {households.map((hh) => (
                    <option key={hh.id} value={hh.id}>
                      {hh.room_number} - {hh.head_fullname || "Chưa có chủ hộ"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Loại hóa đơn <span className="text-red-500">*</span></Label>
                <select
                  value={formData.invoice_type}
                  onChange={(e) => setFormData({ ...formData, invoice_type: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option key="rent" value="rent">Tiền thuê</option>
                  <option key="electricity" value="electricity">Điện</option>
                  <option key="water" value="water">Nước</option>
                  <option key="maintenance" value="maintenance">Bảo trì</option>
                  <option key="parking" value="parking">Đỗ xe</option>
                  <option key="other" value="other">Khác</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Số tiền (VNĐ) <span className="text-red-500">*</span></Label>
                  <Input
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="VD: 2000000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hạn thanh toán <span className="text-red-500">*</span></Label>
                  <Input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Mô tả</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả thêm..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={closeModal}>
                Hủy
              </Button>
              <Button 
                onClick={handleCreate}
                disabled={saving}
              >
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Tạo hóa đơn
              </Button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
