import express from 'express';
import { createUserAddress } from './address.controller';

const router = express.Router();

// address routes
router.post('/', createUserAddress);

export default router;
