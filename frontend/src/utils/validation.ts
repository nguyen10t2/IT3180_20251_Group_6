import { z } from 'zod';

// Auth validation schemas
export const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

export const registerSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
});

export const otpSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  code: z.string().length(6, 'Mã OTP phải có 6 ký tự'),
});

export const changePasswordSchema = z.object({
  old_password: z.string().min(6, 'Mật khẩu cũ phải có ít nhất 6 ký tự'),
  new_password: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  new_password: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
});

// Resident validation schemas
export const createResidentSchema = z.object({
  full_name: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  id_card: z.string().regex(/^[0-9]{9,12}$/, 'CCCD phải có 9-12 chữ số'),
  date_of_birth: z.string().min(1, 'Ngày sinh không được để trống'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Số điện thoại phải có 10 chữ số'),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  gender: z.enum(['male', 'female', 'other'], {
    required_error: 'Vui lòng chọn giới tính',
  }),
  occupation: z.string().optional(),
  house_role: z.enum(['owner', 'member', 'tenant'], {
    required_error: 'Vui lòng chọn vai trò',
  }),
  residence_status: z.enum(['thuongtru', 'tamtru', 'tamvang', 'dachuyendi'], {
    required_error: 'Vui lòng chọn tình trạng cư trú',
  }),
  house_id: z.string().optional(),
  move_in_date: z.string().optional(),
});

export const updateResidentSchema = createResidentSchema.partial();

// House validation schemas
export const createHouseSchema = z.object({
  room_number: z.string().min(1, 'Số phòng không được để trống'),
  room_type: z.string().min(1, 'Loại phòng không được để trống'),
  building: z.string().optional(),
  area: z.string().min(1, 'Diện tích không được để trống'),
  head_resident_id: z.string().optional(),
  has_vehicle: z.boolean().default(false),
  motorbike_count: z.number().min(0).default(0),
  car_count: z.number().min(0).default(0),
  notes: z.string().optional(),
  status: z.string().default('active'),
});

export const updateHouseSchema = createHouseSchema.partial();

// Invoice validation schemas
export const createInvoiceSchema = z.object({
  house_id: z.string().min(1, 'Vui lòng chọn căn hộ'),
  period_month: z.number().min(1).max(12, 'Tháng phải từ 1-12'),
  period_year: z.number().min(2000),
  invoice_types: z.number().min(1, 'Vui lòng chọn loại hóa đơn'),
  total_amount: z.string().min(1, 'Tổng tiền không được để trống'),
  due_date: z.string().min(1, 'Ngày đến hạn không được để trống'),
  notes: z.string().optional(),
});

export const updateInvoiceSchema = createInvoiceSchema.partial();

export const confirmInvoiceSchema = z.object({
  paidAmount: z.string().optional(),
  paymentNote: z.string().optional(),
});

// Feedback validation schemas
export const createFeedbackSchema = z.object({
  house_id: z.string().min(1, 'Vui lòng chọn căn hộ'),
  type: z.enum(['complaint', 'suggestion', 'maintenance', 'other'], {
    required_error: 'Vui lòng chọn loại phản ánh',
  }),
  priority: z.enum(['low', 'medium', 'high', 'urgent'], {
    required_error: 'Vui lòng chọn mức độ ưu tiên',
  }),
  title: z.string().min(5, 'Tiêu đề phải có ít nhất 5 ký tự'),
  content: z.string().min(10, 'Nội dung phải có ít nhất 10 ký tự'),
  attachments: z.array(z.string()).optional(),
});

export const updateFeedbackSchema = createFeedbackSchema.partial();

export const respondFeedbackSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'resolved', 'rejected']),
  assigned_to: z.string().optional(),
  resolution_notes: z.string().optional(),
});

// Notification validation schemas
export const createNotificationSchema = z.object({
  title: z.string().min(5, 'Tiêu đề phải có ít nhất 5 ký tự'),
  content: z.string().min(10, 'Nội dung phải có ít nhất 10 ký tự'),
  type: z.enum(['general', 'emergency', 'event', 'payment'], {
    required_error: 'Vui lòng chọn loại thông báo',
  }),
  target: z.enum(['all', 'household', 'individual'], {
    required_error: 'Vui lòng chọn đối tượng',
  }),
  target_id: z.string().optional(),
  is_pinned: z.boolean().default(false),
  scheduled_at: z.string().optional(),
  published_at: z.string().optional(),
  expires_at: z.string().optional(),
});

export const updateNotificationSchema = createNotificationSchema.partial();

// User validation schemas
export const updateUserSchema = z.object({
  full_name: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự').optional(),
  avatar_url: z.string().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type OtpFormData = z.infer<typeof otpSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type CreateResidentFormData = z.infer<typeof createResidentSchema>;
export type UpdateResidentFormData = z.infer<typeof updateResidentSchema>;
export type CreateHouseFormData = z.infer<typeof createHouseSchema>;
export type UpdateHouseFormData = z.infer<typeof updateHouseSchema>;
export type CreateInvoiceFormData = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceFormData = z.infer<typeof updateInvoiceSchema>;
export type ConfirmInvoiceFormData = z.infer<typeof confirmInvoiceSchema>;
export type CreateFeedbackFormData = z.infer<typeof createFeedbackSchema>;
export type UpdateFeedbackFormData = z.infer<typeof updateFeedbackSchema>;
export type RespondFeedbackFormData = z.infer<typeof respondFeedbackSchema>;
export type CreateNotificationFormData = z.infer<typeof createNotificationSchema>;
export type UpdateNotificationFormData = z.infer<typeof updateNotificationSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
