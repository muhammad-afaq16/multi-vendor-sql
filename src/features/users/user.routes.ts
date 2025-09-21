import express from 'express';
import upload from '../../middleware/multer';
import { createUser, getAllUsers, loginUser } from './user.controller';
import { validate } from '../../middleware/validate';
import { userSchema } from './user.validation';
import { authMiddleware } from '../../middleware/authMiddleware';

const router = express.Router();

// User routes
router.post('/create-user', upload.single('avatar'), validate(userSchema, 'body'), createUser);
router.post('/login', loginUser);
router.get('/get-all-users', authMiddleware, getAllUsers);

// User address routes
export default router;
