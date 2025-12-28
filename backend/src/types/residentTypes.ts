import { Static, t } from "elysia";
import { enumToTypeBox } from "../helpers/enumHelper";
import { gender, resident_status } from "../models/pgEnum";

export const CreateResidentBody = t.Object({
    full_name: t.String(),
    id_card: t.String(),
    date_of_birth: t.Date(),
    phone: t.String(),
    gender: enumToTypeBox(gender.enumValues),
    role: t.Number(),
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