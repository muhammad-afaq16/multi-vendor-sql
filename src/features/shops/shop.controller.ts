import { CookieOptions, NextFunction, Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import AppError from '../../utils/AppError';
import { shopService } from './shop.service';
import bcrypt from 'bcryptjs';
import { sendEmail } from '../../utils/sendEmail';
import ApiResponse from '../../utils/ApiResponse';
import { userService } from '../users/user.service';
import path from 'path';
import fs from 'fs/promises';

const createShop = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password, phoneNumber, description } = req.body;

    const shop = await shopService.isShopEmailExists(email);

    if (shop) {
      return next(new AppError('Shop already exists', 409));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = await shopService.generateJwtTokenForShop({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      description,
    });

    const verificationUrl = `${process.env.API_BASE_URL}/api/v1/shops/verify-email?token=${verificationToken}`;

    const subject = 'Verify Your Email Address';
    const html = `
      <h1>Welcome to Our Service!</h1>
      <p>Hello ${name},</p>
      <p>Thank you for registering. Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 14px 25px; text-align: center; text-decoration: none; display: inline-block;">Verify Email</a>
      <p>This link will expire in 15 minutes.</p>
      <p>If you did not create an account, please ignore this email.</p>
      <br>
      <p>Best regards,<br>The Team</p>
    `;
    await sendEmail(email, subject, html);

    return res
      .status(201)
      .json(
        new ApiResponse(201, 'Please check your email to verify your account.')
      );
  }
);

const verifyEmail = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return next(
        new AppError('Verification token is missing or invalid', 400)
      );
    }

    const decoded = (await shopService.verifyEmailToken(token)) as any;

    const { name, email, password, phoneNumber, description } = decoded as any;

    const shop = await shopService.createShop({
      name,
      email,
      password,
      phoneNumber,
      description,
      verified: true,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          'Email verified successfully! You can now log in.',
          shop
        )
      );
  }
);

const loginSeller = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Email and password are required', 400, false));
    }

    const shop = await shopService.isShopEmailExists(email);

    if (!shop) {
      return next(new AppError('Shop not exist!', 401, false));
    }

    if (!shop.verified) {
      return next(new AppError('Shop not verified!', 401, false));
    }

    const isPasswordValid = await bcrypt.compare(password, shop.password);

    if (!isPasswordValid) {
      return next(new AppError('Invalid email or password', 401, false));
    }

    const accessToken = await shopService.generateShopAccessToken(shop.id);
    const refreshToken = await shopService.generateShopRefreshToken(shop.id);

    await shopService.saveShopRefreshToken(shop.id, refreshToken);

    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', // CSRF protection
      maxAge: Number(process.env.SHOP_REFRESH_TOKEN_COOKIE_MAX_AGE), // 7 days, matches refresh token expiry
    };

    res.cookie('refreshToken', refreshToken, cookieOptions);

    const { password: _, refreshToken: __, ...shopData } = shop;

    return res.status(200).json(
      new ApiResponse(200, 'Login successful', {
        accessToken,
        shop: shopData,
      })
    );
  }
);

const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    if (!email) {
      return next(new AppError('Email is required', 400));
    }

    const shop = await shopService.isShopEmailExists(email);

    if (!shop) {
      return next(new AppError('Shop not found', 404));
    }

    const resetToken = await shopService.generateShopPasswordResetToken(
      shop.id
    );

    const resetUrl = `${process.env.API_BASE_URL}/api/v1/shops/reset-password?token=${resetToken}`;

    const subject = 'Reset Your Password';
    const html = `
      <h1>Reset Your Password</h1>
      <p>Hello ${shop.name},</p>
      <p>Please click the link below to reset your password:</p>
      <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 14px 25px; text-align: center; text-decoration: none; display: inline-block;">Reset Password</a>
      <p>This link will expire in 10 minutes.</p>
      <p>If you did not request a password reset, please ignore this email.</p>
      <br>
      <p>Best regards,<br>The Team</p>
    `;
    await sendEmail(shop.email, subject, html);

    return res
      .status(200)
      .json(
        new ApiResponse(200, 'Please check your email to reset your password.')
      );
  }
);

const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.query;
    const { password, confirmPassword } = req.body;

    if (!token || typeof token !== 'string') {
      return next(new AppError('Reset token is missing or invalid', 400));
    }

    const decoded = (await shopService.shopResetPasswordVerifyEmailToken(
      token
    )) as any;

    const { id } = decoded as any;

    const shop = await shopService.getShopById(id);

    if (!shop) {
      return next(new AppError('Shop not found', 404));
    }

    if (!password || !confirmPassword) {
      return next(
        new AppError('Please provide a new password and confirm it.', 400)
      );
    }

    if (password !== confirmPassword) {
      return next(new AppError('Passwords do not match.', 400));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await shopService.updateShopPassword(shop.id, hashedPassword);

    return res
      .status(200)
      .json(new ApiResponse(200, 'Password reset successful'));
  }
);

const updateUserProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const shopId = Number(req.shop?.id);

    const shop = await shopService.getShopById(shopId);

    if (!shop) {
      return next(new AppError('Shop not found', 404));
    }

    const dataToUpdate: {
      name?: string;
      password?: string;
      phoneNumber?: string | null;
      avatar?: string;
      description?: string;
    } = {};

    if (req.body.name) {
      dataToUpdate.name = req.body.name;
    }

    if ('phoneNumber' in req.body) {
      dataToUpdate.phoneNumber = req.body.phoneNumber;
    }

    if (req.body.password) {
      dataToUpdate.password = await bcrypt.hash(req.body.password, 10);
    }

    if (req.file) {
      if (shop.avatar) {
        const publicIdMatch = shop.avatar.match(/\/v\d+\/(.+)\.\w+$/);
        const publicId = publicIdMatch ? publicIdMatch[1] : null;

        if (publicId) {
          await userService.deleteFromCloudinary(publicId);
        }
      }

      const uploadResult = await userService.uploadToCloudinary(req.file.path);
      dataToUpdate.avatar = uploadResult.secure_url;
      const filePath = path.resolve(req.file.path);
      try {
        await fs.unlink(filePath);
        console.log('Local file deleted');
      } catch (err) {
        console.error('Error deleting local file:', err);
      }
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return next(new AppError('No data provided to update.', 400));
    }
    const updatedShop = await shopService.updateShop(shop.id, dataToUpdate);

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      user: updatedShop,
    });
  }
);

export {
  createShop,
  verifyEmail,
  loginSeller,
  forgotPassword,
  resetPassword,
  updateUserProfile,
};
