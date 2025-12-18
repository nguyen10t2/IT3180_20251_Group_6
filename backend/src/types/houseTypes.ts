import { RoomType, RoomTypeEnum } from "../models/enum";
import { t } from "elysia";
import { enumToTypeBox } from "../helpers/enumHelper";

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