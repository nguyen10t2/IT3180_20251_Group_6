// HTTP Status Codes
export enum HttpStatusCode {
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
}

export const INTERNAL_SERVER_ERROR = "Internal server error";
export const NOT_FOUND = "Not found";
export const UNAUTHORIZED = "Unauthorized";
export const BAD_REQUEST = "Bad request";
export const FORBIDDEN = "Forbidden";
export const CONFLICT = "Conflict";

export const ErrorStatus: Record<string, HttpStatusCode> = {
  [INTERNAL_SERVER_ERROR]: HttpStatusCode.INTERNAL_SERVER_ERROR,
  [NOT_FOUND]: HttpStatusCode.NOT_FOUND,
  [UNAUTHORIZED]: HttpStatusCode.UNAUTHORIZED,
  [BAD_REQUEST]: HttpStatusCode.BAD_REQUEST,
  [FORBIDDEN]: HttpStatusCode.FORBIDDEN,
  [CONFLICT]: HttpStatusCode.CONFLICT,
};

export class HttpError extends Error {
  public status: number;
  public body?: any;

  constructor(status: number, message: string, body?: any) {
    super(message);
    this.status = status;
    this.body = body ?? message;
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}