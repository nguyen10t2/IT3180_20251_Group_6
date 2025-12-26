import { z } from "zod";

export const RoleEnum = z.enum(["admin", "manager", "resident", "accountant"]);
export const StatusEnum = z.enum(["active", "pending", "rejected"]);
export const RelationShipEnum = z.enum([
  "chusohuu",
  "nguoidaidien",
  "thanhvien",
  "nguoithue",
]);
export const GenderEnum = z.enum(["male", "female", "other"]);
export const ResidencyStatusEnum = z.enum(["thuongtru", "tamtru", "tamvang"]);

export const otpSchema = z.string().length(6, "Mã OTP phải gồm 6 chữ số");

export const signUpSchema = z.object({
  fullname: z.string().min(1, "Không được để trống"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu ít nhất 8 ký tự"),
  role: RoleEnum,
  resident_id: z.number().optional().nullable(),
});

export const signInSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

export const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type RelationShip = z.infer<typeof RelationShipEnum>;
export type Role = z.infer<typeof RoleEnum>;
export type Status = z.infer<typeof StatusEnum>;
export type Gender = z.infer<typeof GenderEnum>;
export type ResidencyStatus = z.infer<typeof ResidencyStatusEnum>;
export type SignUpFormValues = z.infer<typeof signUpSchema>;
export type SignInFormValues = z.infer<typeof signInSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type OTPValues = z.infer<typeof otpSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
