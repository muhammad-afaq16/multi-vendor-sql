import express, { Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler';
import AppError from './utils/AppError';
import userRouter from './routes/users.route';
import { v2 as cloudinary } from 'cloudinary';

const app = express();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

app.use(express.json());
app.use(cors());
app.use(morgan('short')); // morgan = HTTP request logger middleware for node.js
app.use(helmet()); // helmet = secure HTTP headers.
app.use(express.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
  res.send('Server is running!');
});

app.use('/api/v1/users', userRouter);

app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(errorHandler);

export default app;
