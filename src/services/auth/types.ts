export type AuthUser = {
  id: string;
  email: string | null;
  fullName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
};

export type UserProfile = {
  id: string;
  tenant_id?: string | null;
  role?: string | null;
};

export type SessionState = {
  user: AuthUser | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

export const defaultSession: SessionState = {
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
};

export type AuthContextType = {
  session: SessionState;
  signUp: (email: string, password: string, fullName?: string, firstName?: string, lastName?: string) => Promise<{ error: any } | void>;
  signIn: (email: string, password: string) => Promise<{ error: any } | void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
};


