export interface PayloadJWT {
    id?: string;
    email?: string;
    role?: string | null;
    [key: string]: any;
};

export class HttpError extends Error {
    status: number;
    body?: any;

    constructor(status: number, message: string, body?: any) {
        super(message);
        this.status = status;
        this.body = body ?? { message };
    }
}