import { Static, t } from "elysia";
import { enumToTypeBox } from "../helpers/enumHelper";
import { gender, resident_status } from "../models/pgEnum";
import { error } from "node:console";

export const CreateResidentBody = t.Object({
    full_name: t.String({error: "Không được để trống tên cư dân"}),
    id_card: t.String({error: "Không được để trống CCCD"}),
    date_of_birth: t.Date({error: "Không được để trống ngày sinh"}),
    phone: t.String({error: "Không được để trống SĐT"}),
    gender: enumToTypeBox(gender.enumValues),
    role: t.Number({error: "Không được để trống vai trò"}),
    status: enumToTypeBox(resident_status.enumValues),
    house_id: t.Optional(t.String({ format: "uuid" })),
    occupation: t.Optional(t.String()),
});

export const UpdateResidentBody = t.Object({
    full_name: t.Optional(t.String()),
    id_card: t.Optional(t.String()),
    date_of_birth: t.Optional(t.Date()),
    phone: t.Optional(t.String()),
    gender: t.Optional(enumToTypeBox(gender.enumValues)),
    role: t.Optional(t.Number()),
    status: t.Optional(enumToTypeBox(resident_status.enumValues)),
    house_id: t.Optional(t.String({ format: "uuid" })),
    occupation: t.Optional(t.String()),
});

export type UpdateResidentBodyType = Static<typeof UpdateResidentBody>;