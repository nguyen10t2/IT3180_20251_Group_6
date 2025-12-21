export interface PayloadJWT {
    id?: string;
    email?: string;
    role?: string | null;
    [key: string]: any;
}

export class HttpError<T = any> extends Error {
    public status: number;
    public body?: T;

    constructor(status: number, message: string, body?: T) {
        super(message);
        this.status = status;
        this.body = body ?? { message } as any;
        Object.setPrototypeOf(this, HttpError.prototype); // Fix for extending built-ins
    }
}