"use client";

import { useEffect, useState } from "react";

import { useAuthStore } from "@/stores/useAuthStore";
import { invoiceService, Invoice } from "@/services/invoiceService";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  Loader2,
  AlertCircle,
  Ban
} from "lucide-react";
import { toast } from "sonner";

export default function InvoicesPage() {
  const { user } = useAuthStore();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const isUserPending = user?.status === "pending";
  const isUserRejected = user?.status === "rejected";
  const isUserNotActive = user?.status !== "active";
  const pendingInvoices = invoices.filter((i) => i.status === "pending" || i.status === "overdue");
  const paidInvoices = invoices.filter((i) => i.status === "paid");

  const totalPending = pendingInvoices.reduce(
    (sum, i) => sum + parseFloat(i.total_amount || "0"),
    0
  );

  const totalPaidThisMonth = paidInvoices
    .filter((i) => {
      const paidDate = i.paid_at ? new Date(i.paid_at) : null;
      const now = new Date();
      return paidDate && 
        paidDate.getMonth() === now.getMonth() && 
        paidDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, i) => sum + parseFloat(i.total_amount || "0"), 0);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const data = await invoiceService.getInvoices();
      setInvoices(data.invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.error("Không thể tải danh sách hóa đơn");
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: string) => {
    return parseFloat(amount).toLocaleString("vi-VN");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getNextDueDate = () => {
    const pending = pendingInvoices.sort(
      (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    );
    return pending[0]?.due_date;
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hóa đơn</h1>
        <p className="text-muted-foreground">
          Xem các hóa đơn và trạng thái thanh toán của bạn
        </p>
      </div>

      {/* Notice for inactive users */}
      {isUserNotActive && (
        <Card className="border-orange-500/50 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Ban className="h-5 w-5 text-orange-500" />
              <p className="text-sm text-orange-700 dark:text-orange-400">
                {isUserPending 
                  ? "Tài khoản đang chờ duyệt. Bạn có thể xem hóa đơn. Vui lòng chờ ban quản lý phê duyệt."
                  : "Tài khoản bị từ chối. Vui lòng liên hệ ban quản lý."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Info Notice */}
      <Card className="border-blue-500/50 bg-blue-50 dark:bg-blue-950/20">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-blue-500" />
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Để thanh toán hóa đơn, vui lòng liên hệ trực tiếp với ban quản lý hoặc thanh toán qua tài khoản ngân hàng của tòa nhà.
            </p>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Tổng chưa thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-500">
                  {formatAmount(totalPending.toString())} VNĐ
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {pendingInvoices.length} hóa đơn
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Đã thanh toán tháng này
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  {formatAmount(totalPaidThisMonth.toString())} VNĐ
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {paidInvoices.filter((i) => {
                    const paidDate = i.paid_at ? new Date(i.paid_at) : null;
                    const now = new Date();
                    return paidDate && 
                      paidDate.getMonth() === now.getMonth() && 
                      paidDate.getFullYear() === now.getFullYear();
                  }).length} hóa đơn
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Hạn thanh toán gần nhất
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getNextDueDate() ? (
                  <>
                    <div className="text-2xl font-bold">
                      {formatDate(getNextDueDate())}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Còn {getDaysUntilDue(getNextDueDate())} ngày nữa
                    </p>
                  </>
                ) : (
                  <div className="text-2xl font-bold text-green-500">
                    Không có
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Pending Invoices */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                Chưa thanh toán
              </CardTitle>
              <CardDescription>
                Các hóa đơn cần thanh toán
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingInvoices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>Không có hóa đơn nào cần thanh toán 🎉</p>
                </div>
              ) : (
                pendingInvoices.map((invoice) => (
                  <div
                    key={invoice.invoice_id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      invoice.status === "overdue"
                        ? "bg-red-500/5 border-red-500/20"
                        : "bg-orange-500/5 border-orange-500/20"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        invoice.status === "overdue" ? "bg-red-500/10" : "bg-orange-500/10"
                      }`}>
                        <FileText className={`h-5 w-5 ${
                          invoice.status === "overdue" ? "text-red-500" : "text-orange-500"
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-medium">
                          Hóa đơn tháng {invoice.period_month}/{invoice.period_year}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {invoice.room_number} - Hạn: {formatDate(invoice.due_date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold">
                        {formatAmount(invoice.total_amount)} VNĐ
                      </span>
                      {getStatusBadge(invoice.status)}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Paid Invoices */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Đã thanh toán
              </CardTitle>
              <CardDescription>Lịch sử thanh toán của bạn</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {paidInvoices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Chưa có hóa đơn nào được thanh toán</p>
                </div>
              ) : (
                paidInvoices.map((invoice) => (
                  <div
                    key={invoice.invoice_id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-green-500/10">
                        <FileText className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <h4 className="font-medium">
                          Hóa đơn tháng {invoice.period_month}/{invoice.period_year}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {invoice.room_number} - Thanh toán: {invoice.paid_at ? formatDate(invoice.paid_at) : "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-muted-foreground">
                        {formatAmount(invoice.total_amount)} VNĐ
                      </span>
                      {getStatusBadge(invoice.status)}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
