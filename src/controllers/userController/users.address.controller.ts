import { NextFunction, Request, Response } from 'express';
import ApiResponse from '../../utils/ApiResponse';
import AppError from '../../utils/AppError';
import catchAsync from '../../utils/catchAsync';
import { userAddressService } from '../../services/userServices/users.address';

const createUserAddress = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = Number(req.params.id);
    if (isNaN(userId)) {
      return next(new AppError('Invalid user id', 400, false));
    }
    const { addressType, street, city, state, zipCode, country } = req.body;

    if (!addressType || !street || !city || !state || !zipCode || !country) {
      return next(
        new AppError(
          'Address type, street, city, state, zip code and country are required',
          400,
          false
        )
      );
    }

    const user = await userAddressService.userFindById(userId);

    if (!user) {
      return next(new AppError('User not found', 404, false));
    }

    const savingAddress = await userAddressService.createUserAddress({
      addressType,
      state,
      street,
      city,
      zipCode,
      country,
      userId,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, 'Address added successfully', savingAddress));
  }
);

export { createUserAddress };
