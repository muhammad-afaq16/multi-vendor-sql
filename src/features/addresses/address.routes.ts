import express from 'express';
import {
  createUserAddress,
  deleteUserAddress,
  getAllAddressByUserId,
  updateUserAddress,
} from './address.controller';
import { authMiddleware } from '../../middleware/authMiddleware';
import {
  createAddressSchema,
  deleteAddressSchema,
  updateAddressSchema,
} from './address.validation';
import { validate } from '../../middleware/validate';

const router = express.Router();

router.post(
  '/',
  authMiddleware,
  validate(createAddressSchema),
  createUserAddress
);

// Get all addresses for authenticated user
router.get('/', authMiddleware, getAllAddressByUserId);

// Update existing address (identified by addressType)
router.put(
  '/',
  authMiddleware,
  validate(updateAddressSchema),
  updateUserAddress
);

// Delete existing address (identified by addressType)
router.delete(
  '/',
  authMiddleware,
  validate(deleteAddressSchema),
  deleteUserAddress
);

export default router;
