import express from 'express';
import { createUser, loginUser } from '../controllers/users.controller';
import upload from '../middleware/multer';

const router = express.Router();

router.post('/create-user', upload.single('avatar'), createUser);
router.post('/login', loginUser);
export default router;
