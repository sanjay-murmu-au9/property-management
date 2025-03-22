import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { dbConfig } from './config/database';
import path from 'path';

config();

// Function to get proper migrations path based on environment
const getMigrationsPath = () => {
  // In production, look for compiled JS files in the dist directory
  if (process.env.NODE_ENV === 'production') {
    return path.join(__dirname, '..', 'migrations', '*.js');
  }
  // In development, use the TypeScript files directly
  return path.join(__dirname, '..', 'migrations', '*.{js,ts}');
};

// Override migrations path based on runtime environment
const finalConfig = {
  ...dbConfig,
  migrations: [getMigrationsPath()]
};

export const AppDataSource = new DataSource(finalConfig as any);