import { eq, and, isNull, asc, sql } from "drizzle-orm";
import { db } from "../database/db";
import { houseSchema, type NewHouse } from "../models_new/houseSchema";
import { residentSchema } from "../models_new/residentSchema";
import { houseHoldHeadHistorySchema } from "../models_new/houseHoldHeadHistorySchema";

// Lấy tất cả căn hộ (chưa bị xóa)
export const getAll = async () => {
  const rows = await db.select({
    id: houseSchema.id,
    room_number: houseSchema.room_number,
    room_type: houseSchema.room_type,
    building: houseSchema.building,
    area: houseSchema.area,
    head_resident_id: houseSchema.head_resident_id,
    has_vehicle: houseSchema.has_vehicle,
    motorbike_count: houseSchema.motorbike_count,
    car_count: houseSchema.car_count,
    notes: houseSchema.notes,
    status: houseSchema.status,
    created_at: houseSchema.created_at,
    updated_at: houseSchema.updated_at,

    head_fullname: residentSchema.full_name,
    head_phone: residentSchema.phone,
  })
    .from(houseSchema)
    .leftJoin(residentSchema, eq(houseSchema.head_resident_id, residentSchema.id))
    .where(isNull(houseSchema.deleted_at))
    .orderBy(asc(houseSchema.room_number));

  return { data: rows };
};

// Lấy căn hộ theo ID
export const getHouseById = async (id: string) => {
  const rows = await db.select({
    id: houseSchema.id,
    room_number: houseSchema.room_number,
    room_type: houseSchema.room_type,
    building: houseSchema.building,
    area: houseSchema.area,
    head_resident_id: houseSchema.head_resident_id,
    has_vehicle: houseSchema.has_vehicle,
    motorbike_count: houseSchema.motorbike_count,
    car_count: houseSchema.car_count,
    notes: houseSchema.notes,
    status: houseSchema.status,
    created_at: houseSchema.created_at,
    updated_at: houseSchema.updated_at,

    head_fullname: residentSchema.full_name,
    head_phone: residentSchema.phone,
  })
    .from(houseSchema)
    .leftJoin(residentSchema, eq(houseSchema.head_resident_id, residentSchema.id))
    .where(and(
      eq(houseSchema.id, id),
      isNull(houseSchema.deleted_at)
    ));

  return { data: rows[0] ?? null };
};

// Tạo căn hộ mới
export const createHouse = async (data: {
  room_number: string;
  room_type: string;
  building?: string;
  area: string;
  head_resident_id?: string | null;
  notes?: string | null;
}) => {
  let headResidentId = null;

  if (data.head_resident_id) {
    const resident = await db.select({ id: residentSchema.id })
      .from(residentSchema)
      .where(and(
        eq(residentSchema.id, data.head_resident_id),
        isNull(residentSchema.deleted_at)
      ))
      .limit(1);

    if (resident.length > 0) {
      headResidentId = data.head_resident_id;
    }
  }

  const [result] = await db.insert(houseSchema).values({
    room_number: data.room_number,
    room_type: data.room_type,
    building: data.building,
    area: data.area,
    head_resident_id: headResidentId,
    notes: data.notes ?? null,
  }).returning();

  return { data: result };
};

// Cập nhật căn hộ
export const updateHouse = async (id: string, data: Partial<NewHouse>) => {
  const updateData: Partial<NewHouse> = {};

  for (const key in data) {
    const value = data[key as keyof typeof data];
    if (value !== undefined) {
      (updateData as any)[key] = value;
    }
  }

  const [result] = await db.update(houseSchema)
    .set({
      ...updateData,
      updated_at: new Date(),
    })
    .where(and(
      eq(houseSchema.id, id),
      isNull(houseSchema.deleted_at)
    ))
    .returning();

  return { data: result ?? null };
};

// Soft delete căn hộ
export const deleteHouse = async (id: string) => {
  await db.update(houseSchema)
    .set({ deleted_at: new Date() })
    .where(eq(houseSchema.id, id));

  return { data: 'House deleted successfully' };
};

// Chuyển chủ hộ
export const transferHeadResident = async (
  houseId: string,
  newHeadId: string,
  reason: string,
  changedBy: string,
) => {
  // Lấy chủ hộ hiện tại
  const [house] = await db.select({ head_resident_id: houseSchema.head_resident_id })
    .from(houseSchema)
    .where(eq(houseSchema.id, houseId));

  const previousHeadId = house?.head_resident_id;

  // Cập nhật chủ hộ mới
  const [updated] = await db.update(houseSchema)
    .set({
      head_resident_id: newHeadId,
      updated_at: new Date()
    })
    .where(and(
      eq(houseSchema.id, houseId),
      isNull(houseSchema.deleted_at)
    ))
    .returning();

  // Ghi lịch sử
  await db.insert(houseHoldHeadHistorySchema).values({
    house_id: houseId,
    previous_head_id: previousHeadId || '',
    new_head_id: newHeadId,
    reason,
    changed_by: changedBy,
  });

  // Cập nhật house_role cho resident cũ (nếu có)
  if (previousHeadId) {
    await db.update(residentSchema)
      .set({ house_role: 'member' })
      .where(eq(residentSchema.id, previousHeadId));
  }

  // Cập nhật house_role cho resident mới
  await db.update(residentSchema)
    .set({ house_role: 'owner' })
    .where(eq(residentSchema.id, newHeadId));

  return { data: updated ?? null };
};

// Cập nhật trạng thái căn hộ
export const updateHouseStatus = async (id: string, status: 'active' | 'inactive' | 'suspended') => {
  const [result] = await db.update(houseSchema)
    .set({
      status,
      updated_at: new Date()
    })
    .where(and(
      eq(houseSchema.id, id),
      isNull(houseSchema.deleted_at)
    ))
    .returning();

  return { data: result ?? null };
};

// Cập nhật thông tin xe
export const updateVehicleInfo = async (id: string, motorbikeCount: number, carCount: number) => {
  const [result] = await db.update(houseSchema)
    .set({
      has_vehicle: (motorbikeCount > 0 || carCount > 0),
      motorbike_count: motorbikeCount,
      car_count: carCount,
      updated_at: new Date()
    })
    .where(and(
      eq(houseSchema.id, id),
      isNull(houseSchema.deleted_at)
    ))
    .returning();

  return { data: result ?? null };
};

// Đếm số thành viên trong hộ
export const getMemberCount = async (houseId: string) => {
  const rows = await db.select({ id: residentSchema.id })
    .from(residentSchema)
    .where(and(
      eq(residentSchema.house_id, houseId),
      isNull(residentSchema.deleted_at)
    ));

  return { data: rows.length };
};

// Lấy lịch sử chuyển chủ hộ
export const getHeadHistory = async (houseId: string) => {
  const rows = await db.select()
    .from(houseHoldHeadHistorySchema)
    .where(eq(houseHoldHeadHistorySchema.house_id, houseId))
    .orderBy(sql`${houseHoldHeadHistorySchema.changed_at} DESC`);

  return { data: rows };
};