import { CookieOptions, NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import AppError from '../../utils/AppError';
import ApiResponse from '../../utils/ApiResponse';
import catchAsync from '../../utils/catchAsync';
import { userService } from './user.service';
import { sendEmail } from '../../utils/sendEmail';
import { promises as fs } from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password, phoneNumber } = req.body;

    const user = await userService.isEmailExists(email);

    if (user) {
      return next(new AppError('User with this email already exists', 409));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = await userService.generateJwtTokenForUser({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
    });

    const verificationUrl = `${process.env.API_BASE_URL}/api/v1/users/verify-email?token=${verificationToken}`;

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
        new ApiResponse(
          201,
          'Please check your email to verify your account.',
          { user }
        )
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

    const decoded = (await userService.verifyEmailToken(token)) as any;

    const { name, email, password, phoneNumber } = decoded as any;

    const user = await userService.createUser({
      name,
      email,
      password,
      phoneNumber,
      verified: true,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          'Email verified successfully! You can now log in.',
          user
        )
      );
  }
);

const loginUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Email and password are required', 400, false));
    }

    const user = await userService.isEmailExists(email);

    if (!user) {
      return next(new AppError('User not exist!', 401, false));
    }

    if (!user.verified) {
      return next(new AppError('User not verified!', 401, false));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return next(new AppError('Invalid email or password', 401, false));
    }

    const accessToken = await userService.generateAccessToken(user.id);
    const refreshToken = await userService.generateRefreshToken(user.id);

    await userService.saveRefreshToken(user.id, refreshToken);

    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', // CSRF protection
      maxAge: Number(process.env.REFRESH_TOKEN_COOKIE_MAX_AGE), // 7 days, matches refresh token expiry
    };

    res.cookie('refreshToken', refreshToken, cookieOptions);

    const { password: _, refreshToken: __, ...userData } = user;

    return res.status(200).json(
      new ApiResponse(200, 'Login successful', {
        accessToken,
        user: userData,
      })
    );
  }
);

const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    const user = await userService.isEmailExists(email);

    if (!user) {
      return next(new AppError('User does not exist!', 401, false));
    }

    const resetToken = await userService.generatePasswordResetToken(user.id);

    const resetTokenURL = `${process.env.API_BASE_URL}/api/v1/users/reset-password?token=${resetToken}`;

    const subject = 'Your Password Reset Link (Valid for 10 minutes)';

    const html = `
        <h1>Password Reset Request</h1>
        <p>Hello ${user.name},</p>
        <p>You are receiving this email because a password reset was requested for your account.</p>
        <p>Please click the link below to set a new password:</p>
        <a href="${resetTokenURL}" style="background-color: #007bff; color: white; padding: 14px 25px; text-align: center; text-decoration: none; display: inline-block;">Reset Password</a>
        <p>This link will expire in 10 minutes.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
      `;

    await sendEmail(user.email, subject, html);

    // This prevents attackers from guessing which emails are registered
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          'If an account with that email exists, a reset link has been sent.'
        )
      );
  }
);

const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.query;
    const { password, confirmPassword } = req.body;

    if (!token || typeof token !== 'string') {
      return next(
        new AppError('Verification token is missing or invalid', 400)
      );
    }

    const decodedPayload = (await userService.verifyResetPassToken(
      token
    )) as any;

    if (!decodedPayload) {
      return next(
        new AppError('Invalid or expired password reset token.', 400)
      );
    }

    const user = await userService.userFindById(decodedPayload.id);

    if (!user) {
      return next(
        new AppError(
          'The user associated with this token no longer exists.',
          404
        )
      );
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

    await userService.updatePassword(user.id, hashedPassword);

    res
      .status(200)
      .json(new ApiResponse(200, 'Your password has been reset successfully.'));
  }
);

const updateUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('User not found', 404));
    }
    const user = await userService.userFindById(userId);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const dataToUpdate: {
      name?: string;
      password?: string;
      phoneNumber?: string | null;
      avatar?: string;
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
      if (user.avatar) {
        const publicIdMatch = user.avatar.match(/\/v\d+\/(.+)\.\w+$/);
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

    const updatedUser = await userService.updateUser(userId, dataToUpdate);

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  }
);

const refreshAccessToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // I need to call this end-point only when the User **--- Was Logged-In ---** within 15 minutes.
    const incomingRefreshToken = req.cookies?.refreshToken;

    if (!incomingRefreshToken) {
      return next(
        new AppError('You are not authenticated. Please log in.', 401)
      );
    }
    // If do, We have Cookies............. match with db
    const storedToken = await userService.findRefreshToken(
      incomingRefreshToken
    );

    if (!storedToken) {
      return next(
        new AppError('Invalid refresh token. Please log in again.', 403)
      );
    }

    let decodedPayload: any;
    try {
      decodedPayload = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET as string
      );
    } catch (err) {
      return next(
        new AppError(
          'Refresh token expired or invalid. Please log in again.',
          403
        )
      );
    }

    const user = await userService.userFindById(decodedPayload.id);
    if (!user) {
      return next(
        new AppError('User associated with this token no longer exists.', 403)
      );
    }

    // 5. Generate a new pair of tokens (Token Rotation)
    const newAccessToken = await userService.generateAccessToken(user.id);
    const newRefreshToken = await userService.generateRefreshToken(user.id);

    await userService.saveRefreshToken(user.id, newRefreshToken);

    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: Number(process.env.REFRESH_TOKEN_COOKIE_MAX_AGE),
    };

    res.cookie('refreshToken', newRefreshToken, cookieOptions);

    return res.status(200).json(
      new ApiResponse(200, 'Token refreshed successfully', {
        accessToken: newAccessToken,
      })
    );
  }
);

const updateAvatar = catchAsync(async () => {
  // This controller purpose is only to update the avatar of user. Do I really I need this? I think
  // I think I do not need this because my updateUser is doing this job by using patch.
});

const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await userService.getAllUsers();

    return res
      .status(202)
      .json(new ApiResponse(200, 'All users fetched', users));
  }
);

export {
  createUser,
  loginUser,
  getAllUsers,
  verifyEmail,
  forgotPassword,
  resetPassword,
  updateUser,
  refreshAccessToken,
};
