import { NOT_FOUND } from "../constants/errorConstant";

export const singleOrNotFound = <T>(rows: T[]) =>
    rows.length ? { data: rows[0] } : { error: NOT_FOUND };