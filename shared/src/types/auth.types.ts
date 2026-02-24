export interface AuthUser {
  id: string;
  username: string;
  role: 'admin' | 'user';
}

export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface AuthPayload {
  username: string;
  password: string;
}
