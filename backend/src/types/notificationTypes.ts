import { t } from "elysia";
import { enumToTypeBox } from "../helpers/enumHelper";
import { NotificationTarget, NotificationType } from "../models/enum";

export const CreateNotificationBody = t.Object({
    title: t.String(),
    context: t.String(),
    type: t.Optional(enumToTypeBox(NotificationType.enumValues)),
    target: t.Optional(enumToTypeBox(NotificationTarget.enumValues)),
    target_id: t.Optional(t.String({ format: "uuid" })),
    created_by: t.String({ format: "uuid" }),
});

export const CreateScheduledNotificationBody = t.Object({
    title: t.String(),
    context: t.String(),
    type: t.Optional(enumToTypeBox(NotificationType.enumValues)),
    target: t.Optional(enumToTypeBox(NotificationTarget.enumValues)),
    target_id: t.Optional(t.String({ format: "uuid" })),
    scheduled_at: t.String({ format: "date-time" }),
    created_by: t.String({ format: "uuid" }),
})