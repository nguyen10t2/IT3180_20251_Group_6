import { pgTable, varchar, serial, integer } from "drizzle-orm/pg-core";

export const UserRole = pgTable('user_role', {
  id: serial('id')
    .primaryKey(),
  name: varchar('name', { length: 25 })
    .notNull()
    .unique(),
  permission: integer('permission')
    .notNull()
});