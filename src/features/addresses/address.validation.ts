import { z } from 'zod';

// Create Address Schema
export const createAddressSchema = z.object({
  body: z.object({
    addressType: z.string().min(1, 'Address type is required'),
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(1, 'Zip code is required'),
    country: z.string().min(1, 'Country is required'),
  }),
});

// Update Address Schema (all fields optional except addressType)
export const updateAddressSchema = z.object({
  body: z.object({
    addressType: z.string().min(1, 'Address type is required'),
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  }),
});

// Delete Address Schema (only addressType required)
export const deleteAddressSchema = z.object({
  body: z.object({
    addressType: z.string().min(1, 'Address type is required'),
  }),
});
