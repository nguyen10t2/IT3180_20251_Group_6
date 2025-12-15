import Elysia, { Context } from "elysia";


export const authenticationPlugins = (app: Elysia) => app
    .onBeforeHandle(async (ctx: Context) => {
        // Thực thi các thao tác xác thực ở đây
    });