import { t } from "elysia";

export const PagingUserBody = t.Object({
    lastCreatedAt: t.Date(),
    limit: t.Number(),
});