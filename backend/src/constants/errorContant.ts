export const INTERNAL_SERVER_ERROR = 'Internal server error';
export const NOT_FOUND = 'Not found';
export const UNAUTHORIZED_ACCESS = 'Unauthorized access';
export const BAD_REQUEST = 'Bad request';
export const FORBIDDEN_ACCESS = 'Forbidden access';

export const mapErrorStatus: Record<string, number> = {
    [INTERNAL_SERVER_ERROR]: 500,
    [NOT_FOUND]: 404,
    [UNAUTHORIZED_ACCESS]: 401,
    [BAD_REQUEST]: 400,
    [FORBIDDEN_ACCESS]: 403,
};