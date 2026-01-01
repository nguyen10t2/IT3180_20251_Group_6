import { count, eq, isNull, and } from 'drizzle-orm';
import { db } from '../database/db';
import { userSchema } from '../models/userSchema';
import { houseSchema } from '../models/houseSchema';
import { invoiceSchema } from '../models/invoiceSchema';
import { residentSchema } from '../models/residentSchema';

export const getDashboardStats = async () => {
  const [pendingUsers] = await db
    .select({ count: count() })
    .from(userSchema)
    .where(and(
      eq(userSchema.status, 'pending'),
      eq(userSchema.role, 3),
      isNull(userSchema.deleted_at)
    ));

  const [totalHouseholds] = await db
    .select({ count: count() })
    .from(houseSchema)
    .where(isNull(houseSchema.deleted_at));

  const [pendingInvoices] = await db
    .select({ count: count() })
    .from(invoiceSchema)
    .where(and(eq(invoiceSchema.status, 'pending'), isNull(invoiceSchema.deleted_at)));

  const [totalResidents] = await db
    .select({ count: count() })
    .from(residentSchema)
    .where(isNull(residentSchema.deleted_at));

  return {
    data: {
      pendingUsers: pendingUsers.count,
      totalHouseholds: totalHouseholds.count,
      pendingInvoices: pendingInvoices.count,
      totalResidents: totalResidents.count,
    }
  };
};
