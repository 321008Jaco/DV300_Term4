export type UserRole = 'user' | 'admin';

export interface UserDoc {
  email: string;
  displayName?: string | null;
  photoURL: string | null;
  role: UserRole;
  createdAt: any;
  updatedAt: any;
  lastLoginAt: any;
}
