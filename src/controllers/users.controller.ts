import { Request, Response } from 'express';
import { prisma } from '../config/prismaClient';
import { v2 as cloudinary } from 'cloudinary';
import bcrypt from 'bcryptjs';

const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phoneNumber, role } = req.body;

    if (!name || !email || !password || !req.file) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password and avatar image are required',
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: 'avatars',
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phoneNumber,
        role: role || 'user',
        avatar: uploadResult.secure_url,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

export { createUser };
