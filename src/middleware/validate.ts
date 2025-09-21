import { ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';

export function validate(
  schema: any,
  property: 'body' | 'params' | 'query' = 'body'
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync(req[property]);
      req[property] = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        // Map errors into simpler form
        const errors = err.issues.map((issue) => ({
          field: issue.path.join('.'), // "email", "role", etc.
          message: issue.message,
        }));

        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors, // only the relevant info
        });
      }
      next(err);
    }
  };
}
