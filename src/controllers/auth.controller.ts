import { Request, Response } from 'express';
import { AppDataSource } from '../index';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions, Secret, JwtPayload } from 'jsonwebtoken';
import { UserRole } from '../types/models';

interface TokenPayload extends JwtPayload {
  userId: string;
  email?: string;
}

export class AuthController {
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

  private async verifyRefreshToken(token: string): Promise<TokenPayload> {
    try {
      const secret: Secret = process.env.REFRESH_TOKEN_SECRET || 'default_refresh_secret';
      const decoded = jwt.verify(token, secret) as TokenPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token has expired');
      }
      throw new Error('Invalid refresh token');
    }
  }

  public async signup(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName, role } = req.body;
      
      const userRepository = AppDataSource.getRepository(User);
      
      // Check if user already exists
      const existingUser = await userRepository.findOne({ 
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
      const user = userRepository.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || UserRole.TENANT,
        isActive: true
      });
      
      await userRepository.save(user);
      
      // Generate tokens
      const { accessToken, refreshToken } = this.generateTokens(user);

      // Save refresh token to user
      user.refreshToken = refreshToken;
      await userRepository.save(user);
      
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
      console.error('Signup error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  public async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      
      const userRepository = AppDataSource.getRepository(User);
      
      // Find user with password and refresh token
      const user = await userRepository.findOne({
        where: { email },
        select: ['id', 'email', 'password', 'firstName', 'lastName', 'role', 'isActive', 'refreshToken']
      });

      if (!user || !user.isActive) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }
      
      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }
      
      // Generate tokens
      const { accessToken, refreshToken } = this.generateTokens(user);

      // Save refresh token to user
      user.refreshToken = refreshToken;
      await userRepository.save(user);
      
      res.status(200).json({
        message: 'Login successful',
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
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  public async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(401).json({ message: 'Refresh token is required' });
        return;
      }

      // Verify the refresh token
      const decoded = await this.verifyRefreshToken(refreshToken);
      
      const userRepository = AppDataSource.getRepository(User);
      
      // Find user with the refresh token
      const user = await userRepository.findOne({
        where: { 
          id: decoded.userId,
          refreshToken,
          isActive: true
        }
      });

      if (!user) {
        res.status(401).json({ message: 'Invalid refresh token' });
        return;
      }

      // Generate new tokens
      const tokens = this.generateTokens(user);

      // Update refresh token in database
      user.refreshToken = tokens.refreshToken;
      await userRepository.save(user);

      res.json({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({ message: error.message });
        return;
      }
      console.error('Refresh token error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  public async logout(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        res.status(400).json({ message: 'Refresh token is required' });
        return;
      }

      const userRepository = AppDataSource.getRepository(User);

      // Find user with refresh token and remove it
      const user = await userRepository.findOne({
        where: { refreshToken }
      });

      if (user) {
        user.refreshToken = '';
        await userRepository.save(user);
      }

      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  public async googleAuthCallback(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as User;
      
      // Generate tokens
      const { accessToken, refreshToken } = this.generateTokens(user);

      // Save refresh token to user
      const userRepository = AppDataSource.getRepository(User);
      user.refreshToken = refreshToken;
      await userRepository.save(user);
      
      // Redirect to frontend with tokens
      res.redirect(
        `${process.env.FRONTEND_URL}/auth/google/success?accessToken=${accessToken}&refreshToken=${refreshToken}`
      );
    } catch (error) {
      console.error('Google auth callback error:', error);
      res.redirect('/login?error=auth_failed');
    }
  }
} 