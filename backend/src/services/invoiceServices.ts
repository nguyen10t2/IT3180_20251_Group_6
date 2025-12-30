import { and, desc, eq, getTableColumns, isNull } from "drizzle-orm";
import { db } from "../database/db";
import { invoiceSchema, type NewInvoices } from "../models/invoiceSchema";
import { invoiceDetailSchema } from "../models/invoiceDetailSchema";
import { houseSchema } from "../models/houseSchema";
import { feeTypeSchema } from "../models/feeTypeSchema";
import type { FeeStatusEnum } from "../models/pgEnum";

// Lấy tất cả hóa đơn (chưa bị xóa)
export const getAll = async () => {
  const rows = await db.select({
    ...getTableColumns(invoiceSchema),
    room_number: houseSchema.room_number
  })
    .from(invoiceSchema)
    .leftJoin(houseSchema, eq(invoiceSchema.house_id, houseSchema.id))
    .where(isNull(invoiceSchema.deleted_at))
    .orderBy(desc(invoiceSchema.created_at));

  return { data: rows };
};

// Lấy hóa đơn theo ID
export const getInvoiceById = async (id: string) => {
  const rows = await db.select({
    ...getTableColumns(invoiceSchema),
    room_number: houseSchema.room_number
  })
    .from(invoiceSchema)
    .leftJoin(houseSchema, eq(invoiceSchema.house_id, houseSchema.id))
    .where(and(
      eq(invoiceSchema.id, id),
      isNull(invoiceSchema.deleted_at)
    ));

  return { data: rows[0] ?? null };
};

// Tạo hóa đơn mới
export const createInvoice = async (data: {
  house_id: string;
  period_month: number;
  period_year: number;
  total_amount?: string;
  due_date: Date;
  invoice_types?: number;
  notes?: string | null;
  created_by: string;
}) => {
  const invoiceNumber = `HD-${data.period_year}-${data.period_month.toString().padStart(2, '0')}-${Date.now().toString().slice(-4)}`;

  const [result] = await db.insert(invoiceSchema).values({
    invoice_number: invoiceNumber,
    house_id: data.house_id,
    period_month: data.period_month,
    period_year: data.period_year,
    total_amount: data.total_amount ?? '0',
    due_date: data.due_date,
    invoice_types: data.invoice_types,
    notes: data.notes ?? null,
    created_by: data.created_by
  }).returning();

  return { data: result };
};

// Cập nhật hóa đơn
export const updateInvoice = async (id: string, data: Partial<NewInvoices>) => {
  const updateData: Partial<NewInvoices> = {};

  for (const key in data) {
    const value = data[key as keyof typeof data];
    if (value !== undefined) {
      (updateData as any)[key] = value;
    }
  }

  const [result] = await db.update(invoiceSchema)
    .set({
      ...updateData,
      updated_at: new Date()
    })
    .where(and(
      eq(invoiceSchema.id, id),
      isNull(invoiceSchema.deleted_at)
    ))
    .returning();

  return { data: result ?? null };
};

// Soft delete hóa đơn
export const deleteInvoice = async (id: string) => {
  await db.update(invoiceSchema)
    .set({ deleted_at: new Date() })
    .where(eq(invoiceSchema.id, id));

  return { data: 'Invoice deleted successfully' };
};

// Lấy hóa đơn theo house_id
export const getInvoicesByHouseId = async (houseId: string) => {
  const rows = await db.select({
    ...getTableColumns(invoiceSchema),
    room_number: houseSchema.room_number
  })
    .from(invoiceSchema)
    .leftJoin(houseSchema, eq(invoiceSchema.house_id, houseSchema.id))
    .where(and(
      eq(invoiceSchema.house_id, houseId),
      isNull(invoiceSchema.deleted_at)
    ))
    .orderBy(
      desc(invoiceSchema.period_year),
      desc(invoiceSchema.period_month)
    );

  return { data: rows };
};

// Lấy chi tiết hóa đơn theo invoice_id
export const getInvoiceDetails = async (invoiceId: string) => {
  const rows = await db.select({
    ...getTableColumns(invoiceDetailSchema),
    fee_name: feeTypeSchema.name,
    category: feeTypeSchema.category,
  })
    .from(invoiceDetailSchema)
    .leftJoin(feeTypeSchema, eq(invoiceDetailSchema.fee_id, feeTypeSchema.id))
    .where(eq(invoiceDetailSchema.invoice_id, invoiceId))
    .orderBy(feeTypeSchema.category);

  return { data: rows };
};

// Xác nhận thanh toán hóa đơn
export const confirmInvoice = async (id: string, confirmedBy: string, paidAmount?: string, paymentNote?: string) => {
  const [result] = await db.update(invoiceSchema)
    .set({
      status: 'paid' as FeeStatusEnum,
      confirmed_by: confirmedBy,
      paid_at: new Date(),
      paid_amount: paidAmount,
      payment_note: paymentNote,
      updated_at: new Date()
    })
    .where(and(
      eq(invoiceSchema.id, id),
      eq(invoiceSchema.status, 'pending'),
      isNull(invoiceSchema.deleted_at)
    ))
    .returning();

  return { data: result ?? null };
};

// Cập nhật trạng thái hóa đơn
export const updateInvoiceStatus = async (id: string, status: FeeStatusEnum) => {
  const [result] = await db.update(invoiceSchema)
    .set({
      status,
      updated_at: new Date()
    })
    .where(and(
      eq(invoiceSchema.id, id),
      isNull(invoiceSchema.deleted_at)
    ))
    .returning();

  return { data: result ?? null };
};

// Thêm chi tiết hóa đơn
export const addInvoiceDetail = async (data: {
  invoice_id: string;
  fee_id: number;
  quantity: string;
  price: string;
  total: string;
  notes?: string;
}) => {
  const [result] = await db.insert(invoiceDetailSchema)
    .values(data)
    .returning();

  return { data: result };
};

// Lấy hóa đơn quá hạn
export const getOverdueInvoices = async () => {
  const now = new Date();
  const rows = await db.select({
    ...getTableColumns(invoiceSchema),
    room_number: houseSchema.room_number
  })
    .from(invoiceSchema)
    .leftJoin(houseSchema, eq(invoiceSchema.house_id, houseSchema.id))
    .where(and(
      eq(invoiceSchema.status, 'pending'),
      isNull(invoiceSchema.deleted_at)
    ))
    .orderBy(desc(invoiceSchema.due_date));

  // Filter in JS to handle date comparison properly
  const overdueRows = rows.filter(row => row.due_date && new Date(row.due_date) < now);

  return { data: overdueRows };
};

// Đánh dấu hóa đơn quá hạn
export const markAsOverdue = async (id: string) => {
  const [result] = await db.update(invoiceSchema)
    .set({
      status: 'overdue' as FeeStatusEnum,
      updated_at: new Date()
    })
    .where(and(
      eq(invoiceSchema.id, id),
      eq(invoiceSchema.status, 'pending'),
      isNull(invoiceSchema.deleted_at)
    ))
    .returning();

  return { data: result ?? null };
};