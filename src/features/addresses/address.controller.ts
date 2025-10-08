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

    const isAddressExist = !!(await userAddressService.findAddressByType(
      user.id,
      addressType
    ));

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

const getAllAddressByUserId = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = Number(req.user?.id);

    const user = await userService.userFindById(userId);

    if (!user) {
      return next(new AppError('User not found', 404, false));
    }
    const addresses = await userAddressService.findAddressesByUserId(user.id);

    if (!addresses.length) {
      // Don not user !address because findMany (at findAddressesByUserId) never returns null only empty array
      return next(new AppError('No addresses found', 404, false));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, 'Addresses fetched successfully', addresses));
  }
);

const updateUserAddress = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = Number(req.user?.id);
    const { addressType, street, city, state, zipCode, country } = req.body;

    if (!addressType) {
      return next(new AppError('Address type is required', 400, false));
    }

    const user = await userService.userFindById(userId);

    if (!user) {
      return next(new AppError('User not found', 404, false));
    }

    const existingAddress = await userAddressService.findAddressByType(
      user.id,
      addressType
    );

    if (!existingAddress) {
      return next(new AppError('Address not found', 409, false));
    }

    const updatedAddress = await userAddressService.updateUserAddress(
      existingAddress.id,
      {
        street,
        city,
        state,
        zipCode,
        country,
      }
    );
    return res
      .status(200)
      .json(
        new ApiResponse(200, 'Address updated successfully', updatedAddress)
      );
  }
);

const deleteUserAddress = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = Number(req.user?.id);
    const { addressType } = req.body;

    if (!addressType) {
      return next(new AppError('Address type is required', 400, false));
    }
    const user = await userService.userFindById(userId);

    if (!user) {
      return next(new AppError('User not found', 404, false));
    }

    const existingAddress = await userAddressService.findAddressByType(
      userId,
      addressType
    );
    if (!existingAddress) {
      return next(new AppError('Address not found', 404, false));
    }

    await userAddressService.deleteUserAddress(existingAddress.id);

    return res
      .status(200)
      .json(new ApiResponse(200, 'Address deleted successfully', null));
  }
);

export {
  createUserAddress,
  getAllAddressByUserId,
  updateUserAddress,
  deleteUserAddress,
};
