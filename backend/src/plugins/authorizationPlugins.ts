import Elysia, { Context } from "elysia";

export const authorizationPlugins = (role: any) => (app: Elysia) => app
    .onBeforeHandle(async (ctx: Context) => {
        // Thực thi các thao tác ủy quyền ở đây, sử dụng biến role
    });