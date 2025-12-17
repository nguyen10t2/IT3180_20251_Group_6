import { t } from "elysia";

export const enumToTypeBox = <T extends readonly string[]>(values: T) =>
  t.Enum(Object.fromEntries(values.map(v => [v, v])));