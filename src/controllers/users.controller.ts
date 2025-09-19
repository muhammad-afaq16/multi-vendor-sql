import { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/prismaClient';
import bcrypt from 'bcryptjs';
import AppError from '../utils/AppError';
import ApiResponse from '../utils/ApiResponse';
import { userService } from '../services/user.services';
import catchAsync from '../utils/catchAsync';

const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password, phoneNumber, role } = req.body;

      if (!name || !email || !password || !req.file) {
        return next(
          new AppError(
            `Name, email, password and avatar image are required`,
            400,
            false
          )
        );
      }

      const existingUser = await userService.isUserExists(email);

      if (existingUser) {
        return next(
          new AppError(`User with this email already exists`, 409, false)
        );
      }

      const uploadResult = await userService.uploadToCloudinary(req.file.path);

      if (!uploadResult || !uploadResult.secure_url) {
        return next(new AppError('Failed to upload avatar image', 500, false));
      }
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await userService.createUser({
        name,
        email,
        password: hashedPassword,
        phoneNumber,
        role: role || 'user',
        avatar: uploadResult.secure_url,
      });

      return res
        .status(201)
        .json(new ApiResponse(201, 'User created successfully', user));
    } catch (error: any) {
      return next(new AppError(error.message || 'Server error', 500, false));
    }
  }
);

const loginUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(
          new AppError('Email and password are required', 400, false)
        );
      }

      const user = await userService.isUserExists(email);

      if (!user) {
        return next(new AppError('Invalid email or password', 401, false));
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return next(new AppError('Invalid email or password', 401, false));
      }

      const accessToken = await userService.generateAccessToken(user.id);
      const refreshToken = await userService.generateRefreshToken(user.id);

      await userService.saveRefreshToken(user.id, refreshToken);

      const { password: _, refreshToken: __, ...userData } = user;

      return res.status(200).json(
        new ApiResponse(200, 'Login successful', {
          accessToken,
          refreshToken,
          user: userData,
        })
      );
    } catch (error: any) {
      return next(new AppError(error.message || 'Server error', 500, false));
    }
  }
);

export { createUser, loginUser };
