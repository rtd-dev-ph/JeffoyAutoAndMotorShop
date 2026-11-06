// ─── Auth ──────────────────────────────────────────────────────

export interface LoginRequestDto {
  username: string;
  password: string;
}

export interface LoginResponseDto {
  token: string;
  expiresAtUtc: string;
  userId: number;
  username: string;
  role: string;
}

export interface UserDto {
  id: number;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAtUtc?: string;
}

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  role: string;
}
