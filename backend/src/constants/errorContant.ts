export const INTERNAL_SERVER_ERROR = 'Internal server error';
export const NOT_FOUND = 'Not found';
export const UNAUTHORIZED = 'Unauthorized';
export const BAD_REQUEST = 'Bad request';
export const FORBIDDEN = 'Forbidden';

export const ErrorStatus: Record<string, number> = {
    [INTERNAL_SERVER_ERROR]: 500,
    [NOT_FOUND]: 404,
    [UNAUTHORIZED]: 401,
    [BAD_REQUEST]: 400,
    [FORBIDDEN]: 403,
};