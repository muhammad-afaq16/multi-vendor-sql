import express from 'express';
import { createUser } from '../controllers/users.controller';
import upload from '../middleware/multer';

const router = express.Router();

router.post('/create-user', upload.single('avatar'), createUser);
export default router;
