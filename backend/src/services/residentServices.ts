// resident.service.ts
import { eq, asc, getTableColumns } from 'drizzle-orm';
import { db } from '../database/db';
import { Resident } from '../models/resident';
import { ResidentStatusEnum } from '../models/enum';
import { CreateResidentBody, UpdateResidentBody } from '../types/residentTypes';
import { Static } from 'elysia'
import { INTERNAL_SERVER_ERROR, NOT_FOUND } from '../constants/errorContant';
import { House } from '../models/house';
import { Users } from '../models/users';
import { singleOrNotFound } from '../helpers/dataHelpers';

export const getAll = async () => {
  try {
    const rows = await db.select({
      ...getTableColumns(Resident),
      room_number: House.room_number
    })
      .from(Resident)
      .leftJoin(House, eq(House.house_id, Resident.house_id))
      .orderBy(asc(Resident.full_name));

    return { data: rows };
  } catch (_) {
    return { error: INTERNAL_SERVER_ERROR };
  }
};

export const getResidentByPhone = async (phone: string) => {
  try {
    const rows = await db.select()
      .from(Resident)
      .where(eq(Resident.phone, phone));

    return singleOrNotFound(rows);

  } catch (_) {
    return { error: INTERNAL_SERVER_ERROR };
  }
}

export const getResidentById = async (id: string) => {
  try {
    const rows = await db
      .select()
      .from(Resident)
      .where(eq(Resident.id, id));

    return singleOrNotFound(rows);
  } catch {
    return { error: INTERNAL_SERVER_ERROR };
  }
};

export const updateStatus = async (id: string, new_status: ResidentStatusEnum) => {
  try {
    await db.update(Resident)
      .set({
        status: new_status
      });
  } catch (_) {
    return { error: INTERNAL_SERVER_ERROR };
  }
};

export const getResidentByUserId = async (user_id: string) => {
  try {
    const rows = await db.select({
      ...getTableColumns(Resident),
      room_number: House.room_number
    })
      .from(Resident)
      .leftJoin(House, eq(House.house_id, Resident.house_id))
      .innerJoin(Users, eq(Users.resident_id, Resident.id));

    return singleOrNotFound(rows);
  } catch (_) {
    return { error: INTERNAL_SERVER_ERROR };
  }
};

export const getResidentIdByUserId = async (user_id: string) => {
  try {
    const rows = await db.select()
      .from(Resident)
      .innerJoin(Users, eq(Resident.id, Users.resident_id))
      .where(eq(Users.id, user_id));

    if (rows.length === 0) {
      return { error: NOT_FOUND };
    }

    return { data: rows[0].resident.id };
  } catch (_) {
    return { error: INTERNAL_SERVER_ERROR };
  }
};

export const getResidentByIdCard = async (idCard: string) => {
  try {
    const rows = await db
      .select()
      .from(Resident)
      .where(eq(Resident.id_card, idCard))
      .limit(1);

    return singleOrNotFound(rows);
  } catch {
    return { error: INTERNAL_SERVER_ERROR };
  }
};

export const createResident = async (
  data: Static<typeof CreateResidentBody>
) => {
  try {
    const result = await db
      .insert(Resident)
      .values(data)
      .returning();

    return { data: result[0] };
  } catch {
    return { error: INTERNAL_SERVER_ERROR };
  }
};

export const updateResident = async (
  id: string,
  data: Static<typeof UpdateResidentBody>
) => {
  try {
    const updateData: Partial<typeof Resident.$inferInsert> = {};

    for (const key in data) {
      const value = data[key as keyof typeof data];
      if (value !== undefined) {
        (updateData as any)[key] = value;
      }
    }

    const result = await db
      .update(Resident)
      .set({
        ...updateData,
        updated_at: new Date()
      })
      .where(eq(Resident.id, id))
      .returning();

    return singleOrNotFound(result);
  } catch (_) {
    console.log(_);

    return { error: INTERNAL_SERVER_ERROR };
  }
};

export const deleteResident = async (id: string) => {
  try {
    const result = await db
      .delete(Resident)
      .where(eq(Resident.id, id))
      .returning();

    return singleOrNotFound(result);
  } catch {
    return { error: INTERNAL_SERVER_ERROR };
  }
};
