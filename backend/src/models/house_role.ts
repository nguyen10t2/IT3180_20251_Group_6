import { pgTable, varchar, serial} from "drizzle-orm/pg-core";

export const HouseRole = pgTable('house_role', {
  id: serial('id')
    .primaryKey(),
  name: varchar('name', { length: 25 })
    .notNull()
    .unique()
});