import { eq } from "drizzle-orm";
import { db } from "../database/db";
import { userRoleSchema } from "../models/userSchema";

export const getRoleById = async (roleId: number) => {
  const rows = await db.select({
    id: userRoleSchema.id,
    name: userRoleSchema.name,
    permission: userRoleSchema.permission,
    description: userRoleSchema.description
  })
    .from(userRoleSchema)
    .where(eq(userRoleSchema.id, roleId));

  return { data: rows[0] ?? null };
};

export const getRoleByName = async (roleName: string) => {
  const rows = await db.select({
    id: userRoleSchema.id,
    name: userRoleSchema.name,
    permission: userRoleSchema.permission,
    description: userRoleSchema.description
  })
    .from(userRoleSchema)
    .where(eq(userRoleSchema.name, roleName));

  return { data: rows[0] ?? null };
};

export const getAllRoles = async () => {
  const rows = await db.select()
    .from(userRoleSchema);

  return { data: rows };
};