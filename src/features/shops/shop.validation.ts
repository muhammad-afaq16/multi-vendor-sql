import { z } from 'zod';

export const shopSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(4, 'Name must be at least 4 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
  phoneNumber: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
});
