import { eq } from "drizzle-orm";
import { db } from "../database/db";
import { House } from "../models/house";
import { Resident } from "../models/resident";
import { RoomTypeEnum } from "../models/enum";
import { CreateHouseBody, UpdateHouseBody } from "../types/houseTypes";
import { Static } from "elysia";
import { INTERNAL_SERVER_ERROR } from "../constants/errorContant";
import { singleOrNotFound } from "../helpers/dataHelpers";


export const getAll = async () => {
    try {
        const rows = await db.select({
            house_id: House.house_id,
            room_number: House.room_number,
            room_type: House.room_type,
            area: House.area,
            head_resident_id: House.house_resident_id,
            members_count: House.member_count,
            has_vehicle: House.has_vehicle,
            vehicle_count: House.vehicle_count,
            notes: House.notes,
            created_at: House.created_at,
            updated_at: House.updated_at,

            head_fullname: Resident.full_name,
            head_phone: Resident.phone,
        })
            .from(House)
            .leftJoin(Resident, eq(House.house_resident_id, Resident.id))
            .orderBy(House.room_number);

        return { data: rows };
    } catch (_) {
        return { error: INTERNAL_SERVER_ERROR };
    }
};

export const createHouse = async (
    data: Static<typeof CreateHouseBody>
) => {
    try {
        let house_hold_head = null;
        if (data.head_resident_id) {
            const resident = await db.select()
                .from(Resident)
                .where(eq(Resident.id, data.head_resident_id))
                .limit(1)
            if (resident.length !== 0) {
                house_hold_head = data.head_resident_id;
            }
        }

        const [result] = await db.insert(House).values({
            room_number: data.room_number,
            room_type: data.room_type,
            area: data.area.toString(),
            house_resident_id: house_hold_head,
            notes: data.notes ?? null,
        })
            .returning();

        return { data: result };
    } catch (_) {
        return { error: INTERNAL_SERVER_ERROR };
    }
};

export const getHousebyId = async (house_id: string) => {
    try {
        const rows = await db.select({
            house_id: House.house_id,
            room_number: House.room_number,
            room_type: House.room_type,
            area: House.area,
            head_resident_id: House.house_resident_id,
            members_count: House.member_count,
            has_vehicle: House.has_vehicle,
            vehicle_count: House.vehicle_count,
            notes: House.notes,
            created_at: House.created_at,
            updated_at: House.updated_at,

            head_fullname: Resident.full_name,
            head_phone: Resident.phone,
        })
            .from(House)
            .where(eq(House.house_id, house_id))
            .leftJoin(Resident, eq(House.house_resident_id, Resident.id));

        return singleOrNotFound(rows);
    } catch (_) {
        return { error: INTERNAL_SERVER_ERROR };
    }
};

export const updateHouse = async (house_id: string, data: Static<typeof UpdateHouseBody>) => {
    try {
        const updateData: Partial<typeof House.$inferInsert> = {};

        for (const key in data) {
            const value = data[key as keyof typeof data];
            if (value !== undefined) {
                (updateData as any)[key] = value;
            }
        }

        const [result] = await db.update(House)
            .set({
                ...updateData,
                updated_at: new Date(),
            })
            .where(eq(House.house_id, house_id))
            .returning();

        return { data: result };
    } catch (_) {
        return { error: _ };
    }
};

export const deleteHouse = async (house_id: string) => {
    try {
        await db.delete(House)
            .where(eq(House.house_id, house_id));

        return { data: 'House deleted successfully' };
    } catch (_) {
        return { error: INTERNAL_SERVER_ERROR };
    }
};