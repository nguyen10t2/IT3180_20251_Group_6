import { t } from "elysia";
import { enumToTypeBox } from "../helpers/enumHelper";
import { notification_target, notification_type } from "../models/pgEnum";

export const CreateNotificationBody = t.Object({
    title: t.String({error: 'Không được để trống tiêu đề thông báo'}),
    content: t.String({error: 'Không được để trống nội dung thông báo'}),
    type: t.Optional(enumToTypeBox(notification_type.enumValues)),
    target: t.Optional(enumToTypeBox(notification_target.enumValues)),
    target_id: t.Optional(t.String({ format: "uuid" })),
    is_pinned: t.Optional(t.Boolean()),
    scheduled_at: t.Optional(t.String()),
    expires_at: t.Optional(t.String()),
});

export const CreateScheduledNotificationBody = t.Object({
    title: t.String(),
    content: t.String(),
    type: t.Optional(enumToTypeBox(notification_type.enumValues)),
    target: t.Optional(enumToTypeBox(notification_target.enumValues)),
    target_id: t.Optional(t.String({ format: "uuid" })),
    scheduled_at: t.Date(),
    created_by: t.String({ format: "uuid" }),
})