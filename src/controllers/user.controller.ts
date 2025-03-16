import { Request, Response } from 'express';
import { AppDataSource } from '../index';
import { User } from '../models/User';

export class UserController {
  public async listUsers(req: Request, res: Response): Promise<void> {
    try {
      const userRepository = AppDataSource.getRepository(User);
      
      // Get query parameters for pagination
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      // Get query parameters for filtering
      const role = req.query.role;
      const isActive = req.query.isActive;
      const search = req.query.search as string;

      // Build where clause
      const whereClause: any = {};
      if (role) whereClause.role = role;
      if (isActive !== undefined) whereClause.isActive = isActive === 'true';
      if (search) {
        whereClause.where = [
          { firstName: search },
          { lastName: search },
          { email: search }
        ];
      }

      // Get users with pagination and filtering
      const [users, total] = await userRepository.findAndCount({
        where: whereClause,
        select: ['id', 'firstName', 'lastName', 'email', 'role', 'phone', 'isActive', 'createdAt', 'updatedAt'],
        skip,
        take: limit,
        order: { createdAt: 'DESC' }
      });

      res.status(200).json({
        success: true,
        data: users,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('List users error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  }
} 