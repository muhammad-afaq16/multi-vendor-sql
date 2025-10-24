import { NextFunction, Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import AppError from '../../utils/AppError';
import { categoryService } from './category.service';
import ApiResponse from '../../utils/ApiResponse';
import { number } from 'zod';

// Pass { name } object to service.

// Use id for update/delete (not name).

// Add duplicate-name check before update.

// Prevent deleting if products exist.

const createCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name } = req.body;

    if (!name) {
      return next(new AppError('Name is required', 400));
    }

    const findCategoryByName = await categoryService.findCategoryByName({
      name,
    });

    if (findCategoryByName) {
      return next(new AppError('Already category exist!', 400));
    }

    const category = await categoryService.createCategory({ name });

    return res
      .status(200)
      .json(new ApiResponse(200, 'Category created successfully!', category));
  }
);

const updateCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const categoryId = req.params;
    const id = Number(categoryId.id);
    const { name } = req.body;

    if (!name) {
      return next(new AppError('Name is required', 400));
    }

    if (!id) {
      return next(new AppError('Category ID is required', 400));
    }

    const findCategoryById = await categoryService.findCategoryById(id);

    if (!findCategoryById) {
      return next(new AppError('Category does not found!', 400));
    }

    const findCategoryByName = await categoryService.findCategoryByName({
      name,
    });

    if (findCategoryByName) {
      return next(new AppError('Already category exist!', 400));
    }

    const category = await categoryService.updateCategory({ name, id });

    return res
      .status(200)
      .json(new ApiResponse(200, 'Category updated successfully!', category));
  }
);

const deleteCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const categoryId = req.params;
    const id = Number(categoryId.id);

    if (!id) {
      return next(new AppError('Category ID is required', 400));
    }
    const findCategoryById = await categoryService.findCategoryById(id);

    if (!findCategoryById) {
      return next(new AppError('Category does not found!', 400));
    }
    await categoryService.deleteCategory(id);

    return res
      .status(200)
      .json(new ApiResponse(200, 'Category deleted successfully!'));
  }
);

export { createCategory, updateCategory, deleteCategory };
