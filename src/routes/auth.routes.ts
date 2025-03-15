import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { body } from 'express-validator';
import { validate } from '../middlewares/validation.middleware';
import { UserRole } from '../types/models';
import passport from 'passport';
import { Request, Response, NextFunction } from 'express';
import '../config/passport';

const router = Router();
const authController = new AuthController();

// Validation middleware for signup
const signupValidation = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^\+?[\d\s-]+$/)
    .withMessage('Invalid phone number format'),
  
  body('role')
    .optional()
    .isIn(Object.values(UserRole))
    .withMessage('Invalid role')
];

// Validation middleware for login
const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
];

// Validation middleware for refresh token
const refreshTokenValidation = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
    .isString()
    .withMessage('Refresh token must be a string')
];

// Validation middleware for logout
const logoutValidation = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
    .isString()
    .withMessage('Refresh token must be a string')
];

// Routes
router.post('/signup', signupValidation, validate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await authController.signup(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/login', loginValidation, validate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await authController.login(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/refresh-token', refreshTokenValidation, validate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await authController.refreshToken(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/logout', logoutValidation, validate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await authController.logout(req, res);
  } catch (error) {
    next(error);
  }
});

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/login',
    session: false 
  }),
  authController.googleAuthCallback
);

export default router; 