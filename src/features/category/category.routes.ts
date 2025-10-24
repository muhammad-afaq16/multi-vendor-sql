import express from 'express';
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from './category.controller';

const router = express.Router();

router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;
