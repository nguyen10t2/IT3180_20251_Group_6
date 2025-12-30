export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
  resident_id?: string | null;
  role: number;
  status: string;
  email_verified: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AuthState {
  accessToken: string | null;
  user: User | null;
  loading: boolean;
  setAccessToken: (token: string) => void;
  setUser: (user: User) => void;
  clearState: () => void;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  fetchMe: () => Promise<User | null>;
}
