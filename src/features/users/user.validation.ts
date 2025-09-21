import { z } from 'zod';
import { Role } from '../../types/enums';

export const userSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required') 
    .min(4, 'Name must be at least 4 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
  phoneNumber: z.string().optional(),
  role: z.nativeEnum(Role).optional(),
});
