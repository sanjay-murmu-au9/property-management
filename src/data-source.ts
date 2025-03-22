import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { dbConfig } from './config/database';
import path from 'path';

config();

// Function to get proper migrations path based on environment
const getMigrationsPath = () => {
  // In production, ONLY look for JavaScript files, not TypeScript
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

// In production, ensure we only load JavaScript files, not TypeScript
if (process.env.NODE_ENV === 'production') {
  console.log('Running in production mode, loading only JS migration files');
  // This helps prevent TypeORM from trying to load TypeScript files directly
  finalConfig.migrationsTransactionMode = 'each';
  finalConfig.synchronize = false;
}

export const AppDataSource = new DataSource(finalConfig as any);