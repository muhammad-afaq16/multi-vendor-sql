import express from 'express';

import { validate } from '../../middleware/validate';
import { authMiddleware } from '../../middleware/authMiddleware';
import { verifyLimiter } from '../../middleware/verifyLimiter';
import upload from '../../middleware/multer';
import {
  createShop,
  forgotPassword,
  loginSeller,
  resetPassword,
  verifyEmail,
} from './shop.controller';
import { shopSchema } from './shop.validation';

const router = express.Router();

router.post('/create-shop', validate(shopSchema), createShop);
router.get('/verify-email', verifyLimiter, verifyEmail);

router.post('/login', loginSeller);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password', resetPassword); // only updating password that's why patch

export default router;
