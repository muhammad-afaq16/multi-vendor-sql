import express from 'express';
import {
  createUser,
  forgotPassword,
  getAllUsers,
  loginUser,
  resetPassword,
  updateUser,
  verifyEmail,
} from './user.controller';
import { validate } from '../../middleware/validate';
import { userSchema } from './user.validation';
import { authMiddleware } from '../../middleware/authMiddleware';
import { verifyLimiter } from '../../middleware/verifyLimiter';
import upload from '../../middleware/multer';

const router = express.Router();

router.post('/create-user', validate(userSchema), createUser);
router.get(
  '/verify-email',
  // upload.single('avatar'), ----- Cannot sent at GET that modern browser don't allow multi part form data
  verifyLimiter,
  verifyEmail
);
router.post('/forgot-password', forgotPassword);
router.get('/reset-password', resetPassword);
router.post('/login', loginUser);
router.patch(
  '/update-user',
  authMiddleware,
  upload.single('avatar'),
  updateUser
);
router.get('/get-all-users', authMiddleware, getAllUsers);

export default router;
