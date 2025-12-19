import { t } from "elysia";

export const enumToTypeBox = <T extends readonly [string, ...string[]]>(
  values: T
) => {
  return t.Enum(
    Object.fromEntries(values.map(v => [v, v])) as Record<
      T[number],
      T[number]
    >
  );
};
