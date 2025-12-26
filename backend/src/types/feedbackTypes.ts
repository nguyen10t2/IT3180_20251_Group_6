import { t } from "elysia";
import { enumToTypeBox } from "../helpers/enumHelper";
import { feedback_priority, feedback_type } from "../models/pgEnum";

export const CreateFeedbackBody = t.Object({
    type: enumToTypeBox(feedback_type.enumValues),
    priority: t.Optional(enumToTypeBox(feedback_priority.enumValues)),
    title: t.String(),
    content: t.String(),
});