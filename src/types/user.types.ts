import { Role } from './enums';

export type User = {
  id?: number;
  name: string;
  email: string;
  password: string;
  phoneNumber?: string | null;
  role?: Role;
  verified?: boolean;
  avatar?: string | null;
  refreshToken?: string | null;
  createdAt?: Date;
};

export type Address = {
  id?: number;
  country: string;
  city: string;
  state: string;
  street: string;
  zipCode: string;
  addressType: string;
  userId: number;
};
