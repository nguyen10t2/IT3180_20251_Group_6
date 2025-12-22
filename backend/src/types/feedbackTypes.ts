import { t } from "elysia";
import { enumToTypeBox } from "../helpers/enumHelper";
import { FeedbackPriority, FeedbackType } from "../models/enum";

export const CreateFeedbackBody = t.Object({
    type: enumToTypeBox(FeedbackType.enumValues),
    priority: t.Optional(enumToTypeBox(FeedbackPriority.enumValues)),
    title: t.String(),
    content: t.String(),
});