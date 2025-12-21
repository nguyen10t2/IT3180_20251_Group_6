"use client";

import { Badge } from "@/components/ui/badge";
import { Phone, Mail, Home } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// 1. Định nghĩa kiểu dữ liệu cho Cư dân
export type Resident = {
  id: string;
  name: string;
  apartment: string;
  phone: string;
  status: "active" | "inactive";
  email: string;
};

// 2. Định nghĩa các Cột (Columns) sẽ hiện ra
export const columns: ColumnDef<Resident>[] = [
  {
    accessorKey: "name",
    header: () => (
      <div className="font-semibold text-slate-700 uppercase text-[10px]">
        Họ và tên
      </div>
    ),
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      
      // Lấy 2 chữ cái đầu để làm Avatar (Ví dụ: "Nguyễn Văn Bảo" -> "NB")
      const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

      return (
        <div className="flex items-center gap-3">
          {/* Avatar tròn */}
          <Avatar className="h-9 w-9 border border-slate-200">
            {/* Nếu có ảnh thật thì hiện ở đây (AvatarImage), chưa có thì hiện chữ (AvatarFallback) */}
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${name}`} alt={name} />
            <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Tên được in đậm và to hơn chút */}
          <div className="flex flex-col">
             <span className="font-bold text-slate-900 text-[15px]">{name}</span>
             {/* Dòng phụ nhỏ bên dưới (Optional - để bảng đỡ trống) */}
             <span className="text-[11px] text-slate-500 font-normal">Cư dân chính chủ</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "apartment",
    header: () => (
      <div className="font-semibold text-slate-700 uppercase text-[10px]">
        Số căn hộ
      </div>
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Home className="h-4 w-4 text-slate-400" />
          <Badge variant="outline" className="bg-slate-50 font-bold text-slate-700 border-slate-300">
            {row.getValue("apartment")}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "phone",
    header: () => (
      <div className="font-semibold text-slate-700 uppercase text-[10px]">
        Điện thoại
      </div>
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2 text-slate-600">
          <Phone className="h-4 w-4 text-blue-600" /> 
          <span className="font-arial text-[15px] tracking-wide">
            {row.getValue("phone")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: () => (
      <div className="font-semibold text-slate-700 uppercase text-[10px]">
        Email
      </div>
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2 text-slate-600 group cursor-pointer">
          <Mail className="h-4 w-4 text-purple-500" /> {/* Icon màu xanh dương */}
          <span className="text-[13px] group-hover:text-blue-600 group-hover:underline transition-all">
            {row.getValue("email")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: () => (
      <div className="font-semibold text-slate-700 uppercase text-[10px]">
        Trạng thái
      </div>
    ),
    cell: ({ row }) => {
       const status = row.getValue("status") as string;
       return (
         <div className={`font-medium ${status === 'active' ? 'text-green-600' : 'text-red-500'}`}>
            {status === 'active' ? 'Đang ở' : 'Đã chuyển đi'}
         </div>
       )
    }
  },
  // Cột hành động (Dấu 3 chấm)
  {
    id: "actions",
    
    cell: ({ row }) => {
      const resident = row.original;
 
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-8 w-8 p-0 bg-white">
              <span className="sr-only">Mở menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(resident.phone)}>
              Copy số điện thoại
            </DropdownMenuItem>
            <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Xóa cư dân</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// 3. Dữ liệu giả 
const data: Resident[] = [
  { id: "1", name: "Nguyễn Văn Bảo", apartment: "A101", phone: "0987654321", email: "bao@gmail.com", status: "active" },
  { id: "2", name: "Trần Thị Hải", apartment: "B205", phone: "0912345678", email: "hai@gmail.com", status: "active" },
  { id: "3", name: "Lê Văn Cường", apartment: "C301", phone: "0909090909", email: "cuong@gmail.com", status: "inactive" },
  { id: "4", name: "Phạm Thị D", apartment: "A102", phone: "0988888888", email: "d@gmail.com", status: "active" },
  { id: "5", name: "Hoàng Văn E", apartment: "B206", phone: "0977777777", email: "e@gmail.com", status: "active" },
  { id: "6", name: "Vũ Thị F", apartment: "C302", phone: "0966666666", email: "f@gmail.com", status: "active" },
  { id: "7", name: "Đặng Văn G", apartment: "A103", phone: "0955555555", email: "g@gmail.com", status: "active" },
  { id: "8", name: "Bùi Thị H", apartment: "B207", phone: "0944444444", email: "h@gmail.com", status: "inactive" },
  { id: "9", name: "Đỗ Văn I", apartment: "C303", phone: "0933333333", email: "i@gmail.com", status: "active" },
  { id: "10", name: "Ngô Thị K", apartment: "A104", phone: "0922222222", email: "k@gmail.com", status: "active" },
  { id: "11", name: "Dương Văn L", apartment: "B208", phone: "0911111111", email: "l@gmail.com", status: "active" },
];

export default function ResidentsPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">Danh sách cư dân căn hộ</h1>
      
      <DataTable columns={columns} data={data} searchKey="name" />
    </div>
  );
}