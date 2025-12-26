import { t } from "elysia";
import { enumToTypeBox } from "../helpers/enumHelper";
import { notification_target, notification_type } from "../models/pgEnum";

export const CreateNotificationBody = t.Object({
    title: t.String(),
    context: t.String(),
    type: t.Optional(enumToTypeBox(notification_type.enumValues)),
    target: t.Optional(enumToTypeBox(notification_target.enumValues)),
    target_id: t.Optional(t.String({ format: "uuid" })),
    created_by: t.String({ format: "uuid" }),
});

export const CreateScheduledNotificationBody = t.Object({
    title: t.String(),
    context: t.String(),
    type: t.Optional(enumToTypeBox(notification_type.enumValues)),
    target: t.Optional(enumToTypeBox(notification_target.enumValues)),
    target_id: t.Optional(t.String({ format: "uuid" })),
    scheduled_at: t.Date(),
    created_by: t.String({ format: "uuid" }),
})