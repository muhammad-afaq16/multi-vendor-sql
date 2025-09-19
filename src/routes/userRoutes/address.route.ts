import express from 'express';
import { createUserAddress } from '../../controllers/userController/users.address.controller';

const router = express.Router();

// address routes
router.post('/:id', createUserAddress);

export default router;
