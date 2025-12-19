// resident.service.ts
import { eq, ilike, and, or, gte, lte, inArray, sql, desc, asc, SQL } from 'drizzle-orm';

import { db } from '../database/db';
import { Resident } from '../models/resident';
import { GenderType, ResidentStatusType } from '../models/enum';

/* =========================================================
   COMMON HELPERS
========================================================= */

const notFound = () => ({ error: 'Resident not found' });
const serverError = () => ({ error: 'Internal Server Error' });

const singleOrNotFound = <T>(rows: T[]) =>
    rows.length ? { data: rows[0] } : notFound();

const offsetOf = (page: number, limit: number) =>
    (page - 1) * limit;

/* =========================================================
   BASIC QUERIES
========================================================= */

export const getResidentById = async (id: string) => {
    try {
        const rows = await db
            .select()
            .from(Resident)
            .where(eq(Resident.id, id));

        return singleOrNotFound(rows);
    } catch {
        return serverError();
    }
};

export const getResidentByIdCard = async (idCard: string) => {
    try {
        const rows = await db
            .select()
            .from(Resident)
            .where(eq(Resident.id_card, idCard))
            .limit(1);

        return singleOrNotFound(rows);
    } catch {
        return serverError();
    }
};

export const createResident = async (
    full_name: string,
    idCardNumber: string,
    date_of_birth: Date,
    phone: string,
    gender: GenderType,
    role: number,
    status: ResidentStatusType
) => {
    try {
        const existed = await db
            .select()
            .from(Resident)
            .where(eq(Resident.id_card, idCardNumber))
            .limit(1);

        if (existed.length) {
            return { error: 'ID card number already exists' };
        }

        const result = await db
            .insert(Resident)
            .values({
                full_name,
                id_card: idCardNumber,
                date_of_birth,
                phone,
                gender,
                role,
                status
            })
            .returning();

        return { data: result[0] };
    } catch {
        return serverError();
    }
};

export const updateResident = async (
    id: string,
    data: Partial<{
        full_name: string;
        id_card: string;
        date_of_birth: Date;
        phone: string;
        gender: GenderType;
        role: number;
        status: ResidentStatusType;
    }>
) => {
    try {
        if (data.id_card) {
            const existed = await db
                .select()
                .from(Resident)
                .where(eq(Resident.id_card, data.id_card))
                .limit(1);

            if (existed.length && existed[0].id !== id) {
                return { error: 'ID card number already exists' };
            }
        }

        const result = await db
            .update(Resident)
            .set(data)
            .where(eq(Resident.id, id))
            .returning();

        return singleOrNotFound(result);
    } catch {
        return serverError();
    }
};

export const deleteResident = async (id: string) => {
    try {
        const result = await db
            .delete(Resident)
            .where(eq(Resident.id, id))
            .returning();

        return singleOrNotFound(result);
    } catch {
        return serverError();
    }
};

/* =========================================================
   FILTER TYPES
========================================================= */

export interface ResidentFilters {
    status?: ResidentStatusType;
    role?: number;
    search?: string;
    gender?: GenderType;
    min_age?: number;
    max_age?: number;
    statuses?: ResidentStatusType[];
    roles?: number[];
    sort_by?: 'full_name' | 'date_of_birth' | 'created_at' | 'role';
    sort_order?: 'asc' | 'desc';
}

export interface PaginationResult<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
        has_next: boolean;
        has_prev: boolean;
    };
}

/* =========================================================
   FILTER BUILDERS
========================================================= */

const applyAgeFilter = (filters: ResidentFilters, conditions: SQL[]) => {
    const today = new Date();

    if (filters.min_age !== undefined) {
        const maxBirth = new Date(today);
        maxBirth.setFullYear(today.getFullYear() - filters.min_age);
        conditions.push(lte(Resident.date_of_birth, maxBirth));
    }

    if (filters.max_age !== undefined) {
        const minBirth = new Date(today);
        minBirth.setFullYear(today.getFullYear() - filters.max_age - 1);
        conditions.push(gte(Resident.date_of_birth, minBirth));
    }
};

const buildWhereConditions = (filters?: ResidentFilters): SQL | undefined => {
    if (!filters) return;

    const conditions: SQL[] = [];

    filters.status && conditions.push(eq(Resident.status, filters.status));
    filters.gender && conditions.push(eq(Resident.gender, filters.gender));
    filters.role !== undefined && conditions.push(eq(Resident.role, filters.role));

    if (filters.search) {
        const q = `%${filters.search}%`;
        conditions.push(or(
            ilike(Resident.full_name, q),
            ilike(Resident.phone, q),
            ilike(Resident.id_card, q)
        ) as SQL);
    }

    filters.statuses?.length &&
        conditions.push(inArray(Resident.status, filters.statuses));

    filters.roles?.length &&
        conditions.push(inArray(Resident.role, filters.roles));

    applyAgeFilter(filters, conditions);

    return conditions.length ? and(...conditions) : undefined;
};

const buildOrderBy = (filters?: ResidentFilters) => {
    if (!filters?.sort_by || !filters?.sort_order) {
        return desc(Resident.created_at);
    }

    const order = filters.sort_order === 'asc' ? asc : desc;

    return {
        full_name: order(Resident.full_name),
        date_of_birth: order(Resident.date_of_birth),
        created_at: order(Resident.created_at),
        role: order(Resident.role)
    }[filters.sort_by];
};

/* =========================================================
   QUERY CORE
========================================================= */

const queryResidentsBase = (
    filters?: ResidentFilters,
    page?: number,
    limit?: number,
    fields?: any
) => {
    const query = db
        .select(fields ?? undefined)
        .from(Resident)
        .where(buildWhereConditions(filters))
        .orderBy(buildOrderBy(filters));

    if (page && limit) {
        query.limit(limit).offset(offsetOf(page, limit));
    }

    return query;
};

export const countResidents = async (filters?: ResidentFilters) => {
    const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(Resident)
        .where(buildWhereConditions(filters));

    return result[0]?.count ?? 0;
};

/* =========================================================
   PUBLIC QUERIES
========================================================= */

export const getResidents = async (
    filters?: ResidentFilters,
    page = 1,
    limit = 10
): Promise<PaginationResult<any> | { error: string }> => {
    try {
        const [data, total] = await Promise.all([
            queryResidentsBase(filters, page, limit),
            countResidents(filters)
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                total_pages: totalPages,
                has_next: page < totalPages,
                has_prev: page > 1
            }
        };
    } catch {
        return serverError();
    }
};

export const getAllResidents = async (filters?: ResidentFilters) => {
    try {
        const data = await queryResidentsBase(filters);
        return { data };
    } catch {
        return serverError();
    }
};

export const getResidentsWithFields = async (
    fields: (keyof typeof Resident)[],
    filters?: ResidentFilters,
    page = 1,
    limit = 10
) => {
    try {
        const selectFields = fields.reduce((acc, f) => {
            acc[f] = Resident[f];
            return acc;
        }, {} as any);

        const [data, total] = await Promise.all([
            queryResidentsBase(filters, page, limit, selectFields),
            countResidents(filters)
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                total_pages: totalPages,
                has_next: page < totalPages,
                has_prev: page > 1
            }
        };
    } catch {
        return serverError();
    }
};
