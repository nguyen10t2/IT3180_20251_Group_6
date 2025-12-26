import { room_type } from "../models/pgEnum";
import { t } from "elysia";
import { enumToTypeBox } from "../helpers/enumHelper";

export const UpdateHouseBody = t.Object({
  room_number: t.Optional(t.String()),
  room_type: t.Optional(enumToTypeBox(room_type.enumValues)),
  area: t.Optional(t.Numeric({ precision: 10, scale: 2 })),
  member_count: t.Optional(t.Number()),
  house_resident_id: t.Optional(t.String({ format: 'uuid' })),
  has_vehicle: t.Optional(t.Boolean()),
  vehicle_count: t.Optional(t.Number()),
  notes: t.Optional(t.String()),
});

export const CreateHouseBody = t.Object({
  room_number: t.String(),
  room_type: enumToTypeBox(room_type.enumValues),
  area: t.Optional(t.Numeric({ precision: 10, scale: 2 })),
  head_resident_id: t.Optional(t.String({ format: 'uuid' })),
  notes: t.Optional(t.String()),
})