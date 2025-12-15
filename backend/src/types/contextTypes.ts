import { Cookie } from "elysia";

// Định nghĩa kiểu cho context store và cookie và ...

export type ContextStore = {
    user?: Record<string, any>;
};

export type ContextCookie = {
    refreshToken: Cookie<unknown>;
}