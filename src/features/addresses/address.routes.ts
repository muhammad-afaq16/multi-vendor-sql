import express from 'express';
import { createUserAddress } from './address.controller';

const router = express.Router();

// address routes
router.post('/:id', createUserAddress);

export default router;
