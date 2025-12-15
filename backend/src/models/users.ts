import { pgTable, varchar, uuid, timestamp, text, serial } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const Role = pgTable('roles', {
    // Định nghĩa cấu trúc bảng vai trò ở đây
});

export const Status = pgTable('statuses', {
    // Định nghĩa cấu trúc bảng trạng thái ở đây
});

export const Users = pgTable('users', {
    // Định nghĩa cấu trúc bảng người dùng ở đây
});