import { eq, asc, and, isNull, getTableColumns } from 'drizzle-orm';
import { db } from '../database/db';
import { residentSchema, type NewResident } from '../models/residentSchema';
import { houseSchema } from '../models/houseSchema';
import { userSchema } from '../models/userSchema';
import type { ResidentStatusEnum } from '../models/pgEnum';

// Lấy tất cả cư dân (chưa bị xóa)
export const getAll = async () => {
  const rows = await db.select({
    ...getTableColumns(residentSchema),
    room_number: houseSchema.room_number
  })
    .from(residentSchema)
    .leftJoin(houseSchema, eq(houseSchema.id, residentSchema.house_id))
    .where(isNull(residentSchema.deleted_at))
    .orderBy(asc(residentSchema.full_name));

  return { data: rows };
};

// Lấy cư dân theo house_id
export const getResidentsByHouseId = async (houseId: string) => {
  const rows = await db.select()
    .from(residentSchema)
    .where(and(
      eq(residentSchema.house_id, houseId),
      isNull(residentSchema.deleted_at)
    ));

  return { data: rows };
};

// Lấy cư dân theo số điện thoại
export const getResidentByPhone = async (phone: string) => {
  const rows = await db.select()
    .from(residentSchema)
    .where(and(
      eq(residentSchema.phone, phone),
      isNull(residentSchema.deleted_at)
    ));

  return { data: rows[0] ?? null };
};

// Lấy cư dân theo ID
export const getResidentById = async (id: string) => {
  const rows = await db.select({
    ...getTableColumns(residentSchema),
    room_number: houseSchema.room_number
  })
    .from(residentSchema)
    .leftJoin(houseSchema, eq(houseSchema.id, residentSchema.house_id))
    .where(and(
      eq(residentSchema.id, id),
      isNull(residentSchema.deleted_at)
    ));

  return { data: rows[0] ?? null };
};

// Cập nhật trạng thái cư trú
export const updateResidenceStatus = async (id: string, newStatus: ResidentStatusEnum) => {
  const [updated] = await db.update(residentSchema)
    .set({
      residence_status: newStatus,
      updated_at: new Date()
    })
    .where(and(
      eq(residentSchema.id, id),
      isNull(residentSchema.deleted_at)
    ))
    .returning();

  return { data: updated ?? null };
};

// Lấy cư dân theo user_id
export const getResidentByUserId = async (userId: string) => {
  const rows = await db.select({
    ...getTableColumns(residentSchema),
    room_number: houseSchema.room_number
  })
    .from(residentSchema)
    .leftJoin(houseSchema, eq(houseSchema.id, residentSchema.house_id))
    .innerJoin(userSchema, eq(userSchema.resident_id, residentSchema.id))
    .where(and(
      eq(userSchema.id, userId),
      isNull(residentSchema.deleted_at)
    ));

  return { data: rows[0] ?? null };
};

// Lấy resident_id theo user_id
export const getResidentIdByUserId = async (userId: string) => {
  const rows = await db.select({
    resident_id: residentSchema.id
  })
    .from(residentSchema)
    .innerJoin(userSchema, eq(residentSchema.id, userSchema.resident_id))
    .where(and(
      eq(userSchema.id, userId),
      isNull(residentSchema.deleted_at)
    ));

  return { data: rows[0]?.resident_id ?? null };
};

// Lấy cư dân theo CMND/CCCD
export const getResidentByIdCard = async (idCard: string) => {
  const rows = await db.select()
    .from(residentSchema)
    .where(and(
      eq(residentSchema.id_card, idCard),
      isNull(residentSchema.deleted_at)
    ))
    .limit(1);

  return { data: rows[0] ?? null };
};

// Tạo cư dân mới
export const createResident = async (data: NewResident) => {
  const [result] = await db.insert(residentSchema)
    .values({
      ...data,
      move_in_date: data.move_in_date ?? new Date().toISOString().split('T')[0]
    })
    .returning();

  return { data: result };
};

// Cập nhật cư dân
export const updateResident = async (id: string, data: Partial<NewResident>) => {
  const updateData: Partial<NewResident> = {};

  for (const key in data) {
    const value = data[key as keyof typeof data];
    if (value !== undefined) {
      (updateData as any)[key] = value;
    }
  }

  const [result] = await db.update(residentSchema)
    .set({
      ...updateData,
      updated_at: new Date()
    })
    .where(and(
      eq(residentSchema.id, id),
      isNull(residentSchema.deleted_at)
    ))
    .returning();

  return { data: result ?? null };
};

// Soft delete cư dân
export const deleteResident = async (id: string) => {
  await db.update(residentSchema)
    .set({ deleted_at: new Date() })
    .where(eq(residentSchema.id, id));

  return { data: 'Resident deleted successfully' };
};

// Chuyển đi - cập nhật trạng thái và ngày chuyển
export const moveOutResident = async (id: string, reason: string) => {
  const [result] = await db.update(residentSchema)
    .set({
      residence_status: 'dachuyendi',
      move_out_date: new Date().toISOString().split('T')[0],
      move_out_reason: reason,
      house_id: null,
      updated_at: new Date()
    })
    .where(and(
      eq(residentSchema.id, id),
      isNull(residentSchema.deleted_at)
    ))
    .returning();

  return { data: result ?? null };
};

// Cập nhật house_id cho cư dân
export const updateResidentHouse = async (id: string, houseId: string | null) => {
  const [result] = await db.update(residentSchema)
    .set({
      house_id: houseId,
      updated_at: new Date()
    })
    .where(and(
      eq(residentSchema.id, id),
      isNull(residentSchema.deleted_at)
    ))
    .returning();

  return { data: result ?? null };
};

// Cập nhật house_role cho cư dân
export const updateResidentHouseRole = async (id: string, houseRole: 'owner' | 'member' | 'tenant') => {
  const [result] = await db.update(residentSchema)
    .set({
      house_role: houseRole,
      updated_at: new Date()
    })
    .where(and(
      eq(residentSchema.id, id),
      isNull(residentSchema.deleted_at)
    ))
    .returning();

  return { data: result ?? null };
};
