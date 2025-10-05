import { NextFunction, Request, Response } from 'express';

// export const sellerOnly = (req: Request, res: Response, next: NextFunction) => {
//   if (req.user?.role !== 'SELLER') {
//     return res.status(403).json({ message: 'Access denied: Sellers only' });
//   }
//   next();
// };
export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }
  next();
};
