"use client";

import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { 
  MoreHorizontal, 
  Plus, 
  Wallet, 
  CalendarDays, 
  Tag, 
  CheckCircle2, 
  Clock,
  ArrowUpDown,
  XCircle // Icon cho trạng thái từ chối
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// 1. ĐỊNH NGHĨA KIỂU DỮ LIỆU
export type Expense = {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  status: "pending" | "paid" | "rejected";
  payer: string;
};

// 2. HÀM FORMAT TIỀN TỆ
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

// 3. ĐỊNH NGHĨA CỘT
export const columns: ColumnDef<Expense>[] = [
  {
    accessorKey: "description",
    header: () => <div className="font-semibold text-slate-700 uppercase text-[10px]">Nội dung khoản chi</div>,
    cell: ({ row }) => (
      <div className="font-bold text-slate-800 text-[14px]">
        {row.getValue("description")}
        <div className="text-[11px] text-slate-500 font-normal mt-0.5">Người tạo: {row.original.payer}</div>
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: () => <div className="font-semibold text-slate-700 uppercase text-[10px] flex items-center gap-1"><Tag className="h-3 w-3" /> Danh mục</div>,
    cell: ({ row }) => (
      <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-slate-200">{row.getValue("category")}</Badge>
    ),
  },
  {
    accessorKey: "date",
    header: () => <div className="font-semibold text-slate-700 uppercase text-[10px] flex items-center gap-1"><CalendarDays className="h-3 w-3" /> Ngày chi</div>,
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <div className="font-semibold text-slate-700 uppercase text-[10px] text-right">
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="hover:bg-transparent p-0 font-semibold uppercase text-[10px]">
           Số tiền <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-right font-arial font-semibold text-slate-800 text-[12px]">{formatCurrency(row.getValue("amount"))}</div>
    ),
  },
  {
    accessorKey: "status",
    header: () => <div className="font-semibold text-slate-700 uppercase text-[10px] text-center">Trạng thái</div>,
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <div className="flex justify-center">
            {status === 'paid' && <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 gap-1 pl-1 pr-2"><CheckCircle2 className="h-3 w-3" /> Đã thanh toán</Badge>}
            {status === 'pending' && <Badge className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50 border-yellow-200 gap-1 pl-1 pr-2"><Clock className="h-3 w-3" /> Chờ duyệt</Badge>}
            {status === 'rejected' && <Badge variant="destructive" className="bg-red-100 text-red-700 gap-1 pl-1 pr-2"><XCircle className="h-3 w-3" /> Từ chối</Badge>}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
        <div className="text-right">
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 hover:bg-slate-200/60">
                <span className="sr-only">Mở menu</span>
                <MoreHorizontal className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
                <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
                <div className="h-[1px] bg-slate-100 my-1" />
                <DropdownMenuItem className="text-red-600">Xóa phiếu chi</DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </div>
    ),
  },
];

// DỮ LIỆU BAN ĐẦU
const initialData: Expense[] = [
  { id: "1", description: "Tiền điện khu vực hành lang T12", amount: 15400000, category: "Điện nước", date: "20/12/2025", status: "pending", payer: "Nguyễn Văn Bảo" },
  { id: "2", description: "Sửa chữa thang máy Block A", amount: 5500000, category: "Bảo trì", date: "19/12/2025", status: "paid", payer: "Trần Thị Hải" },
  { id: "3", description: "Mua văn phòng phẩm quý 4", amount: 2300000, category: "Vận hành", date: "15/12/2025", status: "paid", payer: "Lê Văn C" },
  { id: "4", description: "Trả lương bảo vệ ca đêm", amount: 12000000, category: "Nhân sự", date: "10/12/2025", status: "pending", payer: "Phòng Kế Toán" },
  { id: "5", description: "Trang trí sảnh Noel", amount: 4500000, category: "Sự kiện", date: "05/12/2025", status: "rejected", payer: "Ban Quản Lý" },
];

export default function FeesPage() {
  // State quản lý dữ liệu bảng
  const [data, setData] = useState<Expense[]>(initialData);
  
  // State quản lý form
  const [open, setOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    category: "Vận hành",
  });

  // Xử lý thêm mới
  const handleCreate = () => {
    if (!newExpense.description || !newExpense.amount) return;

    const newItem: Expense = {
        id: Math.random().toString(),
        description: newExpense.description,
        amount: Number(newExpense.amount),
        category: newExpense.category,
        date: new Date().toLocaleDateString('vi-VN'),
        status: "pending", 
        payer: "Admin"
    };

    setData([newItem, ...data]); // Thêm vào đầu danh sách
    setOpen(false); // Đóng modal
    setNewExpense({ description: "", amount: "", category: "Vận hành" }); // Reset form
  };

  return (
    <div className="container mx-auto py-10 space-y-8">
      {/* THỐNG KÊ */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm border-l-4 border-l-blue-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Tổng chi tháng này</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">39.700.000 ₫</div>
            <p className="text-xs text-slate-500">+20.1% so với tháng trước</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Đang chờ duyệt</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">27.400.000 ₫</div>
            <p className="text-xs text-slate-500">2 khoản chi đang chờ</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-green-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Đã thanh toán</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">7.800.000 ₫</div>
            <p className="text-xs text-slate-500">Đã hoàn tất 2 khoản</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-slate-800">Quản lý chi phí</h1>
            
            {/* --- BUTTON TẠO MỚI & MODAL --- */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 font-semibold shadow-md">
                        <Plus className="mr-2 h-4 w-4" /> Tạo phiếu chi mới
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-slate-800">Tạo phiếu chi mới</DialogTitle>
                        <DialogDescription>
                            Điền thông tin chi tiết khoản chi bên dưới.
                        </DialogDescription>
                    </DialogHeader>
                    
                    {/* FORM NHẬP LIỆU */}
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="desc" className="font-semibold text-slate-700">Nội dung chi</Label>
                            <Input 
                                id="desc" 
                                placeholder="Ví dụ: Mua vật tư sửa chữa..." 
                                value={newExpense.description}
                                onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="amount" className="font-semibold text-slate-700">Số tiền (VNĐ)</Label>
                                <Input 
                                    id="amount" 
                                    type="number" 
                                    placeholder="0" 
                                    value={newExpense.amount}
                                    onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label className="font-semibold text-slate-700">Danh mục</Label>
                                <Select 
                                    onValueChange={(val) => setNewExpense({...newExpense, category: val})} 
                                    defaultValue={newExpense.category}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn danh mục" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Vận hành">Vận hành</SelectItem>
                                        <SelectItem value="Bảo trì">Bảo trì</SelectItem>
                                        <SelectItem value="Nhân sự">Nhân sự</SelectItem>
                                        <SelectItem value="Điện nước">Điện nước</SelectItem>
                                        <SelectItem value="Sự kiện">Sự kiện</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* NÚT BẤM */}
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => setOpen(false)}
                            className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700"
                        >
                            Hủy bỏ
                        </Button>
                        <Button 
                            onClick={handleCreate}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            Đồng ý tạo
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* --- KẾT THÚC MODAL --- */}
          </div>

          <DataTable columns={columns} data={data} searchKey="description" />
      </div>
    </div>
  );
}