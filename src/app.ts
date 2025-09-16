import express, { Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler';
import AppError from './utils/AppError';

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan('dev')); // morgan = HTTP request logger middleware for node.js
app.use(helmet()); // helmet = secure HTTP headers.

app.get('/', (req: Request, res: Response) => {
  res.send('Hello!');
});

app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(errorHandler);

export default app;
