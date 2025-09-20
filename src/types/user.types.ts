import { Role } from './enums';

export type User = {
  id?: number;
  name: string;
  email: string;
  password: string;
  phoneNumber?: string | null;
  role?: Role;
  avatar?: string | null;
  refreshToken?: string | null;
  resetPasswordToken?: string | null;
  resetPasswordTime?: Date | null;
  createdAt?: Date;
};

export type Address = {
  id?: number;
  country: string | null;
  city: string | null;
  state: string | null;
  street: string | null;
  zipCode: string | null;
  addressType: string | null;
  userId: number;
};
