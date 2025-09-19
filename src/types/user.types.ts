export type User = {
  id?: number;
  name: string;
  email: string;
  password: string;
  phoneNumber?: string | null;
  role?: string;
  avatar?: string | null;
  refreshToken?: string | null;
  resetPasswordToken?: string | null;
  resetPasswordTime?: Date | null;
  createdAt?: Date;
};
