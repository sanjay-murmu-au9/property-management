import { Request, Response } from 'express';
import { AppDataSource } from '../index';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { UserRole } from '../types/models';
import logger from '../utils/logger';
import { Repository } from 'typeorm';

export class AuthController {
  private userRepository: Repository<User>;

  constructor() {
    // Initialize repository after database connection
    setTimeout(() => {
      this.userRepository = AppDataSource.getRepository(User);
    }, 0);
  }

  private generateTokens(user: User): { accessToken: string; refreshToken: string } {
    const jwtSecret: Secret = process.env.JWT_SECRET || 'default_jwt_secret';
    const refreshSecret: Secret = process.env.REFRESH_TOKEN_SECRET || 'default_refresh_secret';
    const jwtOptions: SignOptions = { expiresIn: '1h' };
    const refreshOptions: SignOptions = { expiresIn: '7d' };

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      jwtSecret,
      jwtOptions
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      refreshSecret,
      refreshOptions
    );

    return { accessToken, refreshToken };
  }

  private async getRepository(): Promise<Repository<User>> {
    if (!this.userRepository) {
      this.userRepository = AppDataSource.getRepository(User);
    }
    return this.userRepository;
  }

  public async signup(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName, role } = req.body;
      
      const repository = await this.getRepository();
      
      // Check if user already exists
      const existingUser = await repository.findOne({ 
        where: { email },
        select: ['id', 'email'] // Only select necessary fields
      });

      if (existingUser) {
        res.status(400).json({ message: 'User already exists' });
        return;
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create new user
      const user = repository.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || UserRole.TENANT,
        isActive: true
      });
      
      await repository.save(user);
      
      // Generate tokens
      const { accessToken, refreshToken } = this.generateTokens(user);

      // Save refresh token to user
      user.refreshToken = refreshToken;
      await repository.save(user);
      
      res.status(201).json({
        message: 'User created successfully',
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      });
    } catch (error) {
      logger.error('Signup error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      const repository = await this.getRepository();

      // Validate input
      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
        return;
      }

      // Find user
      const user = await repository.findOne({ where: { email } });
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
        return;
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
        return;
      }

      // Generate tokens
      const { accessToken, refreshToken } = this.generateTokens(user);

      // Save refresh token to user
      user.refreshToken = refreshToken;
      await repository.save(user);

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
          },
          accessToken,
          refreshToken
        }
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  public refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      const repository = await this.getRepository();

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: 'Refresh token is required'
        });
        return;
      }

      // Find user with refresh token
      const user = await repository.findOne({
        where: { refreshToken }
      });

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid refresh token'
        });
        return;
      }

      // Verify refresh token
      try {
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-key');
      } catch (error) {
        res.status(401).json({
          success: false,
          message: 'Invalid refresh token'
        });
        return;
      }

      // Generate new access token
      const accessToken = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '15m' }
      );

      res.status(200).json({
        success: true,
        data: { accessToken }
      });
    } catch (error) {
      logger.error('Refresh token error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  public async logout(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const repository = await this.getRepository();
      
      if (!refreshToken) {
        res.status(400).json({ message: 'Refresh token is required' });
        return;
      }

      // Find user with refresh token and remove it
      const user = await repository.findOne({
        where: { refreshToken }
      });

      if (user) {
        user.refreshToken = '';
        await repository.save(user);
      }

      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  public async googleAuthCallback(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as User;
      const repository = await this.getRepository();
      
      // Generate tokens
      const { accessToken, refreshToken } = this.generateTokens(user);

      // Save refresh token to user
      user.refreshToken = refreshToken;
      await repository.save(user);
      
      // Redirect to frontend with tokens
      res.redirect(
        `${process.env.FRONTEND_URL}/auth/google/success?accessToken=${accessToken}&refreshToken=${refreshToken}`
      );
    } catch (error) {
      logger.error('Google auth callback error:', error);
      res.redirect('/login?error=auth_failed');
    }
  }
} 