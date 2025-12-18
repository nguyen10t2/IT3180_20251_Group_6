import { t } from "elysia";

export const LoginBody = t.Object({
    email: t.String({ format: "email"}),
    password: t.String(),
});

export const RefreshTokenBody = t.Object({
    user_id: t.String({ format: "uuid" }),
    token: t.String(),
    expires_at: t.String({ format: "date-time" }),
});

export const OtpBody = t.Object({
    email: t.String({ format: "email" }),
    code: t.String(),
    expires_at: t.String({ format: "date-time" }),
});