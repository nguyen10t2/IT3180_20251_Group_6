import { and, eq, isNotNull, isNull, lt, desc } from 'drizzle-orm';
import { db } from '../database/db';
import { Users } from '../models/users';
import { House } from '../models/house';
import { Resident } from '../models/resident';

// Lấy danh sách người dùng với phân trang dựa trên created_at và giới hạn số lượng
export const getUsersByLastCreatedAndLimit = async (lastCreated: Date, limit: number) => {
    try {
        const rows = await db.select({
            user_id: Users.id,
            name: Users.name,
            email: Users.email,
            role: Users.role,
            status: Users.status,
            created_at: Users.created_at,
            updated_at: Users.updated_at,

            resident_id: Resident.id,
            id_card: Resident.id_card,
            date_of_birth: Resident.date_of_birth,
            phone: Resident.phone,
            gender: Resident.gender,
            occupation: Resident.occupation,
            resident_role: Resident.role,
            resident_status: Resident.status,

            house_id: House.house_id,
            room_number: House.room_number,
        })
            .from(Users)
            .leftJoin(Resident, eq(Users.resident_id, Resident.id))
            .leftJoin(House, eq(Resident.house_id, House.house_id))
            .where(
                and(
                    lt(Users.created_at, lastCreated),
                    eq(Users.role, 3),
                    isNotNull(Users.resident_id)
                )
            )
            .orderBy(desc(Users.created_at))
            .limit(limit);

        return { data: rows };
    } catch (_) {
        return { error: 'Internal server error' };
    }
};

// Cập nhật mật khẩu người dùng
export const updateUserPassword = async (userId: string, newPassword: string) => {
    try {
        const _ = await db.update(Users)
            .set({ password: newPassword })
            .where(eq(Users.id, userId));
        return { data: 'Password updated successfully' };
    } catch (_) {
        return { error: 'Internal server error' };
    }
};

// Lấy thông tin người dùng theo ID (không bao gồm mật khẩu)
export const getUserById = async (userId: string) => {
    try {
        const rows = await db.select()
            .from(Users)
            .where(eq(Users.id, userId));

        if (rows.length === 0) {
            return { error: 'Not Found' };
        }

        const { password, ...userWithoutPassword } = rows[0];
        return { data: userWithoutPassword };
    } catch (_) {
        return { error: 'Internal server error' };
    }
};

// Kiểm tra sự tồn tại của người dùng theo email
export const isExistingUserByEmail = async (email: string) => {
    try {
        const count = await db.select()
            .from(Users)
            .where(eq(Users.email, email))
            .limit(1);

        return { data: count.length > 0 };
    } catch (_) {
        return { error: 'Internal server error' };
    }
};

// Lấy thông tin người dùng theo email (không bao gồm mật khẩu)
export const getUserByEmail = async (email: string) => {
    try {
        const rows = await db.select()
            .from(Users)
            .where(eq(Users.email, email));

        if (rows.length === 0) {
            return { error: 'Not Found' };
        }

        const { password, ...userWithoutPassword } = rows[0];
        return { data: userWithoutPassword };
    } catch (_) {
        return { error: 'Internal server error' };
    }
};

// Tạo người dùng mới
export const createUser = async (email: string, password: string, name: string) => {
    try {
        const [newUser] = await db.insert(Users)
            .values({ name, email, password })
            .returning();

        const { password: _, ...userWithoutPassword } = newUser;
        return { data: userWithoutPassword };
    } catch (_) {
        return { error: 'Internal server error' };
    }
};

// Xác minh người dùng
export const verifyUser = async (email: string) => {
    try {
        const _ = await db.update(Users)
            .set({ verify: true })
            .where(eq(Users.email, email));
        return { data: 'User verified successfully' };
    } catch (_) {
        return { error: 'Internal server error' };
    }
};

// Cập nhật resident_id cho người dùng
export const updateResidentId = async (userId: string, residentId: string) => {
    try {
        const _ = await db.update(Users)
            .set({ resident_id: residentId })
            .where(eq(Users.id, userId));
        return { data: 'Resident ID updated successfully' };
    } catch (_) {
        return { error: 'Internal server error' };
    }
};

// Lấy danh sách người dùng đang chờ phê duyệt
export const getPendingUsers = async () => {
    try {
        const rows = await db.select({
            user_id: Users.id,
            name: Users.name,
            email: Users.email,
            role: Users.role,
            status: Users.status,
            created_at: Users.created_at,
            updated_at: Users.updated_at,

            resident_id: Resident.id,
            id_card: Resident.id_card,
            date_of_birth: Resident.date_of_birth,
            phone: Resident.phone,
            gender: Resident.gender,
            occupation: Resident.occupation,
            resident_role: Resident.role,
            resident_status: Resident.status,

            house_id: House.house_id,
            room_number: House.room_number,
        })
            .from(Users)
            .leftJoin(Resident, eq(Users.resident_id, Resident.id))
            .leftJoin(House, eq(Resident.house_id, House.house_id))
            .where(
                and(
                    eq(Users.status, 'inactive'),
                    eq(Users.role, 3),
                    isNotNull(Users.resident_id)
                )
            );

        return { data: rows };
    } catch (_) {
        return { error: 'Internal server error' };
    }
};

// Lấy danh sách người dùng đang chờ phê duyệt nhưng chưa có resident_id
export const getPendigUsersWithoutResident = async () => {
    try {
        const rows = await db.select({
            user_id: Users.id,
            name: Users.name,
            email: Users.email,
            role: Users.role,
            status: Users.status,
            created_at: Users.created_at,
            updated_at: Users.updated_at,
        })
            .from(Users)
            .where(
                and(
                    eq(Users.status, 'inactive'),
                    eq(Users.role, 3),
                    isNull(Users.resident_id)
                )
            );

        return { data: rows };
    } catch (_) {
        return { error: 'Internal server error' };
    }
};

// Lấy thông tin người dùng cùng với thông tin cư dân và nhà ở
export const getUserWithResident = async (userId: string) => {
    try {
        const rows = await db.select({
            user_id: Users.id,
            name: Users.name,
            email: Users.email,
            role: Users.role,
            status: Users.status,
            created_at: Users.created_at,
            updated_at: Users.updated_at,

            resident_id: Resident.id,
            id_card: Resident.id_card,
            date_of_birth: Resident.date_of_birth,
            phone: Resident.phone,
            gender: Resident.gender,
            occupation: Resident.occupation,
            resident_role: Resident.role,
            resident_status: Resident.status,

            house_id: House.house_id,
            room_number: House.room_number,
        })
            .from(Users)
            .leftJoin(Resident, eq(Users.resident_id, Resident.id))
            .leftJoin(House, eq(Resident.house_id, House.house_id))
            .where(eq(Users.id, userId));

        if (rows.length === 0) {
            return { error: 'Not Found' };
        }

        return { data: rows[0] };
    } catch (_) {
        return { error: 'Internal server error' };
    }
};

// Phê duyệt người dùng
export const approveUser = async (userId: string, approverId: string) => {
    try {
        const rows = await db.update(Users)
            .set({ status: 'active', approved_by: approverId, approved_at: new Date() })
            .where(eq(Users.id, userId))
            .returning();

        if (rows.length === 0) {
            return { error: 'Not Found' };
        }

        return { data: 'User approved successfully' };
    } catch (_) {
        return { error: 'Internal server error' };
    }
};

// Từ chối người dùng
export const rejectUser = async (userId: string, reason: string) => {
    try {
        const rows = await db.update(Users)
            .set({ status: 'suspended', rejected_reason: reason })
            .where(eq(Users.id, userId))
            .returning();

        if (rows.length === 0) {
            return { error: 'Not Found' };
        }

        return { data: 'User rejected successfully' };
    } catch (_) {
        return { error: 'Internal server error' };
    }
};