import { and, desc, eq, getTableColumns } from "drizzle-orm";
import { INTERNAL_SERVER_ERROR } from "../constants/errorContant";
import { db } from "../database/db";
import { Invoices } from "../models/invoices";
import { House } from "../models/house";
import { Static } from "elysia";
import { CreateInvoice, UpdateInvoice } from "../types/invoiceTypes";
import { singleOrNotFound } from "../helpers/dataHelpers";
import { InvoiceDetails } from "../models/invoice_details";
import { FeeTypes } from "../models/fee_types";
import { type FeeStatusEnum } from "../models/enum";

// Lấy tất cả hóa đơn
export const getAll = async () => {
  try {
    const rows = await db.select({
      ...getTableColumns(Invoices),
      room_number: House.room_number
    })
      .from(Invoices)
      .leftJoin(House, eq(Invoices.house_id, House.house_id))
      .orderBy(desc(Invoices.created_at));

    return { data: rows };
  } catch (_) {
    console.log(_);

    return { error: INTERNAL_SERVER_ERROR };
  }
};

// Tạo hóa đơn mới
export const createInvoice = async (
  data: Static<typeof CreateInvoice>
) => {
  try {
    const invoice_number
      = `HD-${data.period_year}-${data.period_month.toString().padStart(2, '0')}-${Date.now().toString().slice(-4)}`;

    await db.insert(Invoices).values({
      invoice_number,
      house_id: data.house_id,
      period_month: data.period_month,
      period_year: data.period_year,
      total_amount: data.total_amount.toString(),
      due_date: data.due_date,
      invoice_type: data.invoice_type,
      notes: data.notes ?? null,
      created_by: data.created_by
    })

    return { data: 'Invoice created successfully' };
  } catch (_) {
    return { error: INTERNAL_SERVER_ERROR };
  }
};

// Cập nhật hóa đơn
export const updateInvoice = async (id: string, data: Static<typeof UpdateInvoice>) => {
  try {
    const updateData: Partial<typeof Invoices.$inferInsert> = {};

    for (const key in data) {
      const value = data[key as keyof typeof data];
      if (value !== undefined) {
        (updateData as any)[key] = value;
      }
    }

    await db.update(Invoices)
      .set({
        ...updateData,
        updated_at: new Date()
      })
      .where(eq(Invoices.id, id));

    return { data: 'Invoice updated successfully' };
  }
  catch (_) {
    return { error: INTERNAL_SERVER_ERROR };
  }
};

// Xóa hóa đơn theo ID
export const deleteInvoice = async (id: string) => {
  try {
    const result = await db
      .delete(Invoices)
      .where(eq(Invoices.id, id))
      .returning();

    return { data: result[0] };
  } catch {
    return { error: INTERNAL_SERVER_ERROR };
  }
};

// Lấy hóa đơn theo house_id
export const getInvoiceByHouseId = async (house_id: string) => {
  try {
    const rows = await db.select({
      ...getTableColumns(Invoices),
      room_number: House.room_number
    })
      .from(Invoices)
      .leftJoin(House, eq(Invoices.house_id, House.house_id))
      .where(eq(Invoices.house_id, house_id))
      .orderBy(
        desc(Invoices.period_year),
        desc(Invoices.period_month)
      );

    return singleOrNotFound(rows);
  } catch (_) {
    return { error: INTERNAL_SERVER_ERROR };
  }
};

// Lấy chi tiết hóa đơn theo ID
export const getInvoiceDetails = async (id: string) => {
  try {
    const rows = await db.select({
      ...getTableColumns(InvoiceDetails),
      fee_name: FeeTypes.name,
      category: FeeTypes.category,
    })
      .from(InvoiceDetails)
      .leftJoin(FeeTypes, eq(InvoiceDetails.fee_type_id, FeeTypes.id))
      .where(eq(InvoiceDetails.invoice_id, id))
      .orderBy(FeeTypes.category);

    return singleOrNotFound(rows);
  } catch (_) {
    return { error: INTERNAL_SERVER_ERROR };
  }
};

// Lấy hóa đơn theo ID
export const getInvoiceById = async (id: string) => {
  try {
    const rows = await db.select({
      ...getTableColumns(Invoices),
      room_number: House.room_number
    })
      .from(Invoices)
      .leftJoin(House, eq(Invoices.house_id, House.house_id))
      .where(eq(Invoices.id, id));

    return singleOrNotFound(rows);
  } catch (_) {
    return { error: INTERNAL_SERVER_ERROR };
  }
};

// Xác nhận thanh toán hóa đơn
export const confirmInvoice = async (id: string, confirmed_by: string) => {
  try {
    await db.update(Invoices)
      .set({
        status: 'paid' as FeeStatusEnum,
        confirmed_by,
        updated_at: new Date()
      })
      .where(and(
        eq(Invoices.id, id),
        eq(Invoices.status, 'pending')
      ));
    return { data: 'Invoice confirmed successfully' };
  } catch (_) {
    return { error: INTERNAL_SERVER_ERROR };
  }
};