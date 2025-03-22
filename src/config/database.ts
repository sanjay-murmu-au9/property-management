import { DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import path from 'path';
import logger from '../utils/logger';

config();

// Check if DATABASE_URL is provided
if (process.env.DATABASE_URL) {
  logger.info('Using DATABASE_URL for connection');
} else {
  // Validate required environment variables if DATABASE_URL is not provided
  const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

  if (missingEnvVars.length > 0) {
    logger.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    process.exit(1);
  }
}

// Create basic configuration
const baseConfig = {
  entities: [path.join(__dirname, '..', 'models', '*.{ts,js}')],
  migrations: [path.join(__dirname, '..', '..', 'migrations', '*.{ts,js}')],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  ssl: true,
  extra: {
    max: 10 // connection pool max size
  }
};

// Export final configuration
export const dbConfig: DataSourceOptions = process.env.DATABASE_URL
  ? {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ...baseConfig
    }
  : {
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ...baseConfig
    };