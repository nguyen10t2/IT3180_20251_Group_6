import { t } from "elysia";

export const PagingUserBody = t.Object({
    lastCreatedAt: t.Date({error: 'Không được để trống last created at'}),
    limit: t.Number({error: 'Không được để trống limit'}),
});