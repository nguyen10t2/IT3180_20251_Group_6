import { eq } from "drizzle-orm";
import { INTERNAL_SERVER_ERROR } from "../constants/errorContant";
import { db } from "../database/db";
import { UserRole } from "../models/user_role";
import { singleOrNotFound } from "../helpers/dataHelpers";
import { permission } from "node:process";


export const getRoleById = async (roleId: number) => {
    try {
        const row = await db.select({
            permission: UserRole.permission
        })
            .from(UserRole)
            .where(eq(UserRole.id, roleId));

        return singleOrNotFound(row);
    } catch (_) {
        return { error: INTERNAL_SERVER_ERROR };
    }
};

export const getRoleByName = async (roleName: string) => {
    try {
        const row = await db.select({
            permission: UserRole.permission
        })
            .from(UserRole)
            .where(eq(UserRole.name, roleName));

        return singleOrNotFound(row);
    } catch (_) {
        return { error: INTERNAL_SERVER_ERROR };
    }
};