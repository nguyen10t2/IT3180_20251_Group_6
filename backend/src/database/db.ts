import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../models';

// Kết nối đến cơ sở dữ liệu PostgreSQL sử dụng biến môi trường DATABASE_URL

const sql = postgres(Bun.env.DATABASE_URL_NEON!);
export const db = drizzle(sql, { schema });