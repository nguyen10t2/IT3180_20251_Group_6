import { RoomType, RoomTypeEnum } from "../models/enum";
import { t } from "elysia";

export type HouseType = {
    room_number?: string;
    room_type?: RoomTypeEnum;
    area?: string;
    member_count?: number;
    house_resident_id?: string | null;
    has_vehicle?: boolean;
    vehicle_count?: number;
    notes?: string | null;
};

const enumToTypeBox = <T extends readonly string[]>(values: T) =>
  t.Enum(Object.fromEntries(values.map(v => [v, v])));

export const UpdateHouseBody = t.Object({
  room_number: t.Optional(t.String()),
  room_type: t.Optional(enumToTypeBox(RoomType.enumValues)),
  area: t.Optional(t.Number()),
  member_count: t.Optional(t.Number()),
  house_resident_id: t.Optional(t.Union([t.String(), t.Null()])),
  has_vehicle: t.Optional(t.Boolean()),
  vehicle_count: t.Optional(t.Number()),
  notes: t.Optional(t.Union([t.String(), t.Null()])),
});
