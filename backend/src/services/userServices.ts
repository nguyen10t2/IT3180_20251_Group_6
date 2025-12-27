import { and, eq, isNotNull, isNull, lt, desc } from 'drizzle-orm';
import { db } from '../database/db';
import { userSchema } from '../models/userSchema';
import { houseSchema } from '../models/houseSchema';
import { residentSchema } from '../models/residentSchema';

// Lấy danh sách người dùng với phân trang
export const getUsersByLastCreatedAndLimit = async (lastCreated: Date, limit: number) => {
  const rows = await db.select({
    user_id: userSchema.id,
    full_name: userSchema.full_name,
    email: userSchema.email,
    role: userSchema.role,
    status: userSchema.status,
    created_at: userSchema.created_at,
    updated_at: userSchema.updated_at,

    resident_id: residentSchema.id,
    id_card: residentSchema.id_card,
    date_of_birth: residentSchema.date_of_birth,
    phone: residentSchema.phone,
    gender: residentSchema.gender,
    occupation: residentSchema.occupation,
    house_role: residentSchema.house_role,
    residence_status: residentSchema.residence_status,

    house_id: houseSchema.id,
    room_number: houseSchema.room_number,
  })
    .from(userSchema)
    .leftJoin(residentSchema, eq(userSchema.resident_id, residentSchema.id))
    .leftJoin(houseSchema, eq(residentSchema.house_id, houseSchema.id))
    .where(
      and(
        lt(userSchema.created_at, lastCreated),
        eq(userSchema.role, 3),
        isNotNull(userSchema.resident_id),
        isNull(userSchema.deleted_at)
      )
    )
    .orderBy(desc(userSchema.created_at))
    .limit(limit);

  return { data: rows };
};

// Cập nhật mật khẩu người dùng
export const updateUserPassword = async (userId: string, newPassword: string) => {
  await db.update(userSchema)
    .set({ hashed_password: newPassword, updated_at: new Date() })
    .where(and(
      eq(userSchema.id, userId),
      isNull(userSchema.deleted_at)
    ));
};

export const updateUserPasswordByEmail = async (email: string, newPassword: string) => {
  await db.update(userSchema)
    .set({ hashed_password: newPassword, updated_at: new Date() })
    .where(and(
      eq(userSchema.email, email),
      isNull(userSchema.deleted_at)
    ));
};

// Lấy thông tin người dùng theo ID (không bao gồm mật khẩu)
export const getUserById = async (userId: string) => {
  const rows = await db.select({
    id: userSchema.id,
    email: userSchema.email,
    full_name: userSchema.full_name,
    avatar_url: userSchema.avatar_url,
    resident_id: userSchema.resident_id,
    role: userSchema.role,
    status: userSchema.status,
    email_verified: userSchema.email_verified,
    approved_by: userSchema.approved_by,
    approved_at: userSchema.approved_at,
    created_at: userSchema.created_at,
    updated_at: userSchema.updated_at,
  })
    .from(userSchema)
    .where(and(
      eq(userSchema.id, userId),
      isNull(userSchema.deleted_at)
    ));

  return { data: rows[0] ?? null };
};

// Kiểm tra sự tồn tại của người dùng theo email
export const isExistingUserByEmail = async (email: string) => {
  const rows = await db.select({ id: userSchema.id })
    .from(userSchema)
    .where(and(
      eq(userSchema.email, email),
      isNull(userSchema.deleted_at)
    ))
    .limit(1);

  return { data: rows.length > 0 };
};

// Lấy thông tin người dùng theo email (không bao gồm mật khẩu)
export const getUserByEmail = async (email: string) => {
  const rows = await db.select({
    id: userSchema.id,
    email: userSchema.email,
    full_name: userSchema.full_name,
    avatar_url: userSchema.avatar_url,
    resident_id: userSchema.resident_id,
    role: userSchema.role,
    status: userSchema.status,
    email_verified: userSchema.email_verified,
    created_at: userSchema.created_at,
    updated_at: userSchema.updated_at,
  })
    .from(userSchema)
    .where(and(
      eq(userSchema.email, email),
      isNull(userSchema.deleted_at)
    ));

  return { data: rows[0] ?? null };
};

// Lấy user với password để đăng nhập
export const getUserWithPasswordByEmail = async (email: string) => {
  const rows = await db.select()
    .from(userSchema)
    .where(and(
      eq(userSchema.email, email),
      isNull(userSchema.deleted_at)
    ));

  return { data: rows[0] ?? null };
};

// Tạo người dùng mới
export const createUser = async (email: string, hashedPassword: string, fullName: string) => {
  const [newUser] = await db.insert(userSchema)
    .values({
      email,
      hashed_password: hashedPassword,
      full_name: fullName
    })
    .returning();

  const { hashed_password: _, ...userWithoutPassword } = newUser;
  return { data: userWithoutPassword };
};

// Xác minh email người dùng
export const verifyUserEmail = async (email: string) => {
  await db.update(userSchema)
    .set({ email_verified: true, updated_at: new Date() })
    .where(and(
      eq(userSchema.email, email),
      isNull(userSchema.deleted_at)
    ));
  return { data: 'User email verified successfully' };
};

// Cập nhật resident_id cho người dùng
export const updateResidentId = async (userId: string, residentId: string) => {
  await db.update(userSchema)
    .set({ resident_id: residentId, updated_at: new Date() })
    .where(and(
      eq(userSchema.id, userId),
      isNull(userSchema.deleted_at)
    ));
  return { data: 'Resident ID updated successfully' };
};

// Lấy danh sách người dùng đang chờ phê duyệt
export const getPendingUsers = async () => {
  const rows = await db.select({
    user_id: userSchema.id,
    full_name: userSchema.full_name,
    email: userSchema.email,
    role: userSchema.role,
    status: userSchema.status,
    created_at: userSchema.created_at,
    updated_at: userSchema.updated_at,

    resident_id: residentSchema.id,
    id_card: residentSchema.id_card,
    date_of_birth: residentSchema.date_of_birth,
    phone: residentSchema.phone,
    gender: residentSchema.gender,
    occupation: residentSchema.occupation,
    house_role: residentSchema.house_role,
    residence_status: residentSchema.residence_status,

    house_id: houseSchema.id,
    room_number: houseSchema.room_number,
  })
    .from(userSchema)
    .leftJoin(residentSchema, eq(userSchema.resident_id, residentSchema.id))
    .leftJoin(houseSchema, eq(residentSchema.house_id, houseSchema.id))
    .where(
      and(
        eq(userSchema.status, 'inactive'),
        eq(userSchema.role, 3),
        isNotNull(userSchema.resident_id),
        isNull(userSchema.deleted_at)
      )
    );

  return { data: rows };
};

// Lấy danh sách người dùng đang chờ phê duyệt nhưng chưa có resident_id
export const getPendingUsersWithoutResident = async () => {
  const rows = await db.select({
    user_id: userSchema.id,
    full_name: userSchema.full_name,
    email: userSchema.email,
    role: userSchema.role,
    status: userSchema.status,
    created_at: userSchema.created_at,
    updated_at: userSchema.updated_at,
  })
    .from(userSchema)
    .where(
      and(
        eq(userSchema.status, 'inactive'),
        eq(userSchema.role, 3),
        isNull(userSchema.resident_id),
        isNull(userSchema.deleted_at)
      )
    );

  return { data: rows };
};

// Lấy thông tin người dùng cùng với thông tin cư dân và nhà ở
export const getUserWithResident = async (userId: string) => {
  const rows = await db.select({
    user_id: userSchema.id,
    full_name: userSchema.full_name,
    email: userSchema.email,
    role: userSchema.role,
    status: userSchema.status,
    created_at: userSchema.created_at,
    updated_at: userSchema.updated_at,

    resident_id: residentSchema.id,
    id_card: residentSchema.id_card,
    date_of_birth: residentSchema.date_of_birth,
    phone: residentSchema.phone,
    gender: residentSchema.gender,
    occupation: residentSchema.occupation,
    house_role: residentSchema.house_role,
    residence_status: residentSchema.residence_status,

    house_id: houseSchema.id,
    room_number: houseSchema.room_number,
  })
    .from(userSchema)
    .leftJoin(residentSchema, eq(userSchema.resident_id, residentSchema.id))
    .leftJoin(houseSchema, eq(residentSchema.house_id, houseSchema.id))
    .where(and(
      eq(userSchema.id, userId),
      isNull(userSchema.deleted_at)
    ));

  return { data: rows[0] ?? null };
};

// Phê duyệt người dùng
export const approveUser = async (userId: string, approverId: string) => {
  const [updated] = await db.update(userSchema)
    .set({
      status: 'active',
      approved_by: approverId,
      approved_at: new Date(),
      updated_at: new Date()
    })
    .where(and(
      eq(userSchema.id, userId),
      isNull(userSchema.deleted_at)
    ))
    .returning();

  return { data: updated ?? null };
};

// Từ chối người dùng
export const rejectUser = async (userId: string, reason: string) => {
  const [updated] = await db.update(userSchema)
    .set({
      status: 'suspended',
      rejected_reason: reason,
      updated_at: new Date()
    })
    .where(and(
      eq(userSchema.id, userId),
      isNull(userSchema.deleted_at)
    ))
    .returning();

  return { data: updated ?? null };
};

// Soft delete người dùng
export const deleteUser = async (userId: string) => {
  await db.update(userSchema)
    .set({ deleted_at: new Date() })
    .where(eq(userSchema.id, userId));

  return { data: 'User deleted successfully' };
};

// Cập nhật thông tin đăng nhập
export const updateLoginInfo = async (userId: string, ip: string) => {
  await db.update(userSchema)
    .set({
      last_login_at: new Date(),
      last_login_ip: ip,
      failed_login_attempts: 0,
      locked_until: null
    })
    .where(eq(userSchema.id, userId));

  return { data: 'Login info updated' };
};

// Tăng số lần đăng nhập thất bại
export const incrementFailedLoginAttempts = async (userId: string) => {
  const [user] = await db.select({ attempts: userSchema.failed_login_attempts })
    .from(userSchema)
    .where(eq(userSchema.id, userId));

  const newAttempts = (user?.attempts ?? 0) + 1;
  const lockUntil = newAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null; // Lock 15 mins after 5 attempts

  await db.update(userSchema)
    .set({
      failed_login_attempts: newAttempts,
      locked_until: lockUntil
    })
    .where(eq(userSchema.id, userId));

  return { data: { attempts: newAttempts, locked: !!lockUntil } };
};