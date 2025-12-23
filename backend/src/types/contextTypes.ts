export interface PayloadJWT {
    id?: string;
    email?: string;
    role?: string | null;
    [key: string]: any;
}