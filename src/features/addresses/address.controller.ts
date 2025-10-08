import { NextFunction, Request, Response } from 'express';
import ApiResponse from '../../utils/ApiResponse';
import AppError from '../../utils/AppError';
import catchAsync from '../../utils/catchAsync';
import { userService } from '../users/user.service';
import { userAddressService } from './address.service';

const createUserAddress = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = Number(req.user?.id);

    const { addressType, street, city, state, zipCode, country } = req.body;

    const user = await userService.userFindById(userId);

    if (!user) {
      return next(new AppError('User not found', 404, false));
    }

    const isAddressExist = await userAddressService.isAddressTypeExist(
      userId,
      addressType
    );

    if (isAddressExist) {
      return next(new AppError('Address already exist', 409, false));
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
