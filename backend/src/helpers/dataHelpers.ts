import { NOT_FOUND } from "../constants/errorContant";

export const singleOrNotFound = <T>(rows: T[]) =>
    rows.length ? { data: rows[0] } : { error: NOT_FOUND };