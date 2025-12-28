import { t } from "elysia";

export const ChangePasswordBody = t.Object({
    old_password: t.String({ minLength: 6 }),
    new_password: t.String({ minLength: 6 }),
});

export const ResetPasswordBody = t.Object({
    email: t.String({ format: "email" }),
    new_password: t.String({ minLength: 6 }),
});

export const RegisterBody = t.Object({
    email: t.String({ format: "email" }),
    password: t.String({ minLength: 6 }),
    name: t.String(),
});

export const LoginBody = t.Object({
    email: t.String({ format: "email" }),
    password: t.String({ minLength: 6 }),
});

export const OtpBody = t.Object({
    email: t.String({ format: "email" }),
    code: t.String({ minLength: 6 }),
});