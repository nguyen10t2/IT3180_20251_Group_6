import { t } from "elysia";
import { enumToTypeBox } from "../helpers/enumHelper";
import { Gender, ResidentStatus } from "../models/enum";

export const CreateResidentBody = t.Object({
    full_name: t.String(),
    id_card: t.String(),
    date_of_birth: t.Date(),
    phone: t.String(),
    gender: enumToTypeBox(Gender.enumValues),
    role: t.Number(),
    status: enumToTypeBox(ResidentStatus.enumValues)
});

export const UpdateResidentBody = t.Object({
    full_name: t.Optional(t.String()),
    id_card: t.Optional(t.String()),
    date_of_birth: t.Optional(t.Date()),
    phone: t.String(),
    gender: t.Optional(enumToTypeBox(Gender.enumValues)),
    role: t.Optional(t.Number()),
    status: t.Optional(enumToTypeBox(ResidentStatus.enumValues))
})