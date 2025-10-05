import rateLimit from 'express-rate-limit';

const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 5,

  message:
    'Too many requests to this endpoint!',

  standardHeaders: true,
  legacyHeaders: false,
});

export { verifyLimiter };
