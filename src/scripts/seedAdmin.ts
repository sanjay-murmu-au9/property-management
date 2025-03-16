import 'reflect-metadata';
import { config } from 'dotenv';
import bcrypt from 'bcryptjs';
import { DataSource } from 'typeorm';
import { User } from '../models/User';
import { UserRole } from '../types/models';
import { dbConfig } from '../config/database';

// Load environment variables
config();

const seedAdmin = async () => {
  // Initialize database connection
  const AppDataSource = new DataSource(dbConfig);
  
  try {
    await AppDataSource.initialize();
    console.log('Database connection established');

    const userRepository = AppDataSource.getRepository(User);

    // Check if admin already exists
    const existingAdmin = await userRepository.findOne({
      where: { email: 'admin@property.com' }
    });

    if (existingAdmin) {
      console.log('Admin user already exists');
      await AppDataSource.destroy();
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    
    const adminUser = userRepository.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@property.com',
      password: hashedPassword,
      role: UserRole.ADMIN,
      isActive: true
    });

    await userRepository.save(adminUser);
    console.log('Admin user created successfully');

    // Close database connection
    await AppDataSource.destroy();
    
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
};

// Run the seeding
seedAdmin(); 