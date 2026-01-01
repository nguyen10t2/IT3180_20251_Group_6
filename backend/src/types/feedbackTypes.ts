import { Static, t } from "elysia";
import { enumToTypeBox } from "../helpers/enumHelper";
import { feedback_priority, feedback_type } from "../models/pgEnum";

export const CreateFeedbackBody = t.Object({
    type: enumToTypeBox(feedback_type.enumValues),
    priority: enumToTypeBox(feedback_priority.enumValues),
    title: t.String(),
    content: t.String(),
    attachments: t.Optional(t.Array(t.String())),
});

export const CommentFeedbackBody = t.Object({
    feedback_id: t.String({ format: "uuid" }),
    user_id: t.String({ format: "uuid" }),
    content: t.String(),
    is_internal: t.Optional(t.Boolean({ default: false })),
});

export const FeedBackResponse = t.Object({
    id: t.String({ format: "uuid" }),
    response: t.String({ error: 'Vui lòng không để trống nội dung trả lời phản hồi' }),
});

export type CreateFeedbackType = Static<typeof CreateFeedbackBody>;
export type CommentFeedbackType = Static<typeof CommentFeedbackBody>;