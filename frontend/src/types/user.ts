import type { Role, Status } from "@/lib/validations/auth";

export interface User {
  id: number;
  fullname: string;
  email: string;
  role: Role;
  status?: Status;
  create_at?: string;
  resident_id?: number;
}
