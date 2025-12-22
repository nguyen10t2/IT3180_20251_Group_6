import { t } from "elysia";

export const ChangePasswordBody = t.Object({
    old_password: t.String(),
    new_password: t.String(),
});

export const ResetPasswordBody = t.Object({
    email: t.String({ format: "email" }),
    new_password: t.String(),
});

export const RegisterBody = t.Object({
    email: t.String({ format: "email"}),
    password: t.String(),
    name: t.String(),
});

export const LoginBody = t.Object({
    email: t.String({ format: "email"}),
    password: t.String(),
});

export const OtpBody = t.Object({
    email: t.String({ format: "email" }),
    code: t.String(),
});