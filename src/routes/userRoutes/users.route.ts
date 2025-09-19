import express from 'express';
import { createUser, loginUser } from '../../controllers/userController/users.controller';
import upload from '../../middleware/multer';

const router = express.Router();

// User routes
router.post('/create-user', upload.single('avatar'), createUser);
router.post('/login', loginUser);

// User address routes
export default router;
