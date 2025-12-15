import { Elysia } from "elysia"
import { loginHandler } from "../handlers/authHandlers";

// Định nghĩa các route liên quan đến xác thực

export const authRoutes = new Elysia({ prefix: "/auth" })
    .post("/login", loginHandler);