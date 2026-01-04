import { eq, and, isNull, asc, sql, getTableColumns, ne } from "drizzle-orm";
import { db } from "../database/db";
import { houseSchema } from "../models/houseSchema";
import { residentSchema } from "../models/residentSchema";
import { houseHoldHeadHistorySchema } from "../models/houseHoldHeadHistorySchema";
import { CreateHouseBodyType, UpdateHouseBodyType } from "../types/houseTypes";

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
    members_count: sql<number>`(
      SELECT COUNT(*)::int 
      FROM ${residentSchema} 
      WHERE ${residentSchema.house_id} = ${houseSchema.id} 
      AND ${residentSchema.deleted_at} IS NULL
    )`.as('members_count'),
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
    members_count: sql<number>`(
      SELECT COUNT(*)::int
      FROM ${residentSchema}
      WHERE ${residentSchema.house_id} = ${houseSchema.id}
      AND ${residentSchema.deleted_at} IS NULL
    )`.as('members_count'),
  })
    .from(houseSchema)
    .leftJoin(residentSchema, eq(houseSchema.head_resident_id, residentSchema.id))
    .where(and(
      eq(houseSchema.id, id),
      isNull(houseSchema.deleted_at)
    ));

  const house = rows[0] ?? null;
  if (!house) {
    return { data: null };
  }

  const residents = await db.select({
    ...getTableColumns(residentSchema)
  })
    .from(residentSchema)
    .where(and(
      eq(residentSchema.house_id, id),
      isNull(residentSchema.deleted_at)
    ))
    .orderBy(asc(residentSchema.full_name));

  return { data: { ...house, residents } };
};

// Tạo căn hộ mới
export const createHouse = async (data: CreateHouseBodyType) => {
  return await db.transaction(async (tx) => {
    let headResidentId = null;

    if (data.head_resident_id) {
      const resident = await tx.select({ id: residentSchema.id })
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

    const [result] = await tx.insert(houseSchema).values({
      room_number: data.room_number,
      room_type: data.room_type,
      building: data.building,
      area: data.area?.toString() ?? '0',
      head_resident_id: headResidentId,
      notes: data.notes ?? null,
    }).returning();

    if (headResidentId) {
      await tx.update(residentSchema)
        .set({ house_role: 'member', updated_at: new Date() })
        .where(and(
          eq(residentSchema.house_id, result.id),
          eq(residentSchema.house_role, 'owner'),
          isNull(residentSchema.deleted_at),
          ne(residentSchema.id, headResidentId),
        ));

      await tx.update(residentSchema)
        .set({ house_role: 'owner', house_id: result.id, updated_at: new Date() })
        .where(eq(residentSchema.id, headResidentId));
    }

    return { data: result };
  });
};

// Cập nhật căn hộ
export const updateHouse = async (id: string, data: UpdateHouseBodyType) => {
  return await db.transaction(async (tx) => {
    const [currentHouse] = await tx.select({ head_resident_id: houseSchema.head_resident_id })
      .from(houseSchema)
      .where(and(
        eq(houseSchema.id, id),
        isNull(houseSchema.deleted_at)
      ))
      .limit(1);

    if (!currentHouse) {
      return { data: null };
    }

    const [result] = await tx.update(houseSchema)
      .set({
        ...data,
        area: data.area ? data.area.toString() : undefined,
        updated_at: new Date(),
      })
      .where(and(
        eq(houseSchema.id, id),
        isNull(houseSchema.deleted_at)
      ))
      .returning();

    if (data.head_resident_id && data.head_resident_id !== currentHouse.head_resident_id) {
      await tx.update(residentSchema)
        .set({ house_role: 'member', updated_at: new Date() })
        .where(and(
          eq(residentSchema.house_id, id),
          eq(residentSchema.house_role, 'owner'),
          isNull(residentSchema.deleted_at),
          ne(residentSchema.id, data.head_resident_id),
        ));

      await tx.update(residentSchema)
        .set({ house_role: 'owner', house_id: id, updated_at: new Date() })
        .where(eq(residentSchema.id, data.head_resident_id));
    }

    return { data: result ?? null };
  });
};

// Soft delete căn hộ
export const deleteHouse = async (id: string) => {
  await db.update(houseSchema)
    .set({ deleted_at: new Date(), status: 'inactive' })
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

// Cập nhật chủ hộ (alias cho transferHeadResident)
export const updateHeadResident = async (
  houseId: string,
  newHeadId: string,
  reason: string,
  changedBy: string,
) => {
  return await transferHeadResident(houseId, newHeadId, reason, changedBy);
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