// ==================== User Types ====================

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  resident_id: string | null;
  role: string;
  status: string;
  email_verified: boolean;
  approved_by: string | null;
  approved_at: string | null;
  rejected_reason: string | null;
  last_login_at: string | null;
  last_login_ip: string | null;
  failed_login_attempts: number;
  locked_until: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface RoleInfo {
  id: number;
  name: string;
  permission: number;
  description: string | null;
}

export interface UserWithResident extends User {
  resident?: Resident | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface OtpRequest {
  email: string;
  code: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface ResetPasswordRequest {
  email: string;
  new_password: string;
}

export interface UpdateUserRequest {
  full_name?: string;
  avatar_url?: string;
}

export interface PendingUserRequest {
  lastCreatedAt?: string;
  limit: number;
}

// ==================== Resident Types ====================

export interface Resident {
  id: string;
  house_id: string | null;
  full_name: string;
  id_card: string;
  date_of_birth: string;
  phone: string;
  email: string | null;
  gender: string;
  occupation: string | null;
  house_role: string;
  residence_status: string;
  move_in_date: string | null;
  move_out_date: string | null;
  move_out_reason: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateResidentRequest {
  house_id?: string;
  full_name: string;
  id_card: string;
  date_of_birth: string;
  phone: string;
  email?: string;
  gender: string;
  occupation?: string;
  house_role: string;
  residence_status: string;
  move_in_date?: string;
}

export interface UpdateResidentRequest {
  house_id?: string;
  full_name?: string;
  date_of_birth?: string;
  phone?: string;
  email?: string;
  gender?: string;
  occupation?: string;
  house_role?: string;
  residence_status?: string;
  move_in_date?: string;
  move_out_date?: string;
  move_out_reason?: string;
}
