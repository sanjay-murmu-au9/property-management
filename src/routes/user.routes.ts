import { Router, Request, Response, NextFunction } from 'express';
import { UserController } from '../controllers/user.controller';
import { auth } from '../middlewares/auth.middleware';
import { UserRole } from '../types/models';
import { User } from '../models/User';

const router = Router();
const userController = new UserController();

// Middleware to check if user is admin
const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const user = req.user as User;
  if (user && user.role === UserRole.ADMIN) {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: 'Access denied. Admin privileges required.' 
    });
  }
};

// List users route (protected, admin only)
router.get('/', auth, isAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await userController.listUsers(req, res);
  } catch (error) {
    next(error);
  }
});

export default router; 