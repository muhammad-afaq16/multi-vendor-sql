import { NextFunction, Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';

const createProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    //! In create product I have name, description, images[] have to allow user to upload multiple images
    //! single product then OriginalPrice, disCountPrice
    //! CategoryId basically each product will be having a categoryId so I need to work on category first
    //! Shop association, only logged in user will create this shop product each product will belong to one
    //! Seller shop, but on shop can many products.
    //! stock needs RND basically it depends on sold counts and products
    //! isAvailable boolean
});
