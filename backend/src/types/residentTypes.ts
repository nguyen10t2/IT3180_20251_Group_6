import { Static, t } from "elysia";
import { enumToTypeBox } from "../helpers/enumHelper";
import { gender, resident_status, house_role_type } from "../models/pgEnum";

export const CreateResidentBody = t.Object({
    full_name: t.String({error: "Không được để trống tên cư dân"}),
    id_card: t.String({error: "Không được để trống CCCD"}),
    date_of_birth: t.Date({error: "Không được để trống ngày sinh"}),
    phone: t.String({error: "Không được để trống SĐT"}),
    email: t.Optional(t.String({ format: "email" })),
    gender: enumToTypeBox(gender.enumValues),
    house_role: enumToTypeBox(house_role_type.enumValues),
    residence_status: enumToTypeBox(resident_status.enumValues),
    house_id: t.Optional(t.String({ format: "uuid" })),
    occupation: t.Optional(t.String()),
    move_in_date: t.Optional(t.Date()),
});

export const UpdateResidentBody = t.Object({
    full_name: t.Optional(t.String()),
    id_card: t.Optional(t.String()),
    date_of_birth: t.Optional(t.Date()),
    phone: t.Optional(t.String()),
    gender: t.Optional(enumToTypeBox(gender.enumValues)),
    residence_status: t.Optional(enumToTypeBox(resident_status.enumValues)),
    house_role: t.Optional(enumToTypeBox(house_role_type.enumValues)),
    house_id: t.Optional(t.String({ format: "uuid" })),
    occupation: t.Optional(t.String()),
    move_in_date: t.Optional(t.Date()),
    move_out_date: t.Optional(t.Date()),
    move_out_reason: t.Optional(t.String()),
});

export type UpdateResidentBodyType = Static<typeof UpdateResidentBody>;