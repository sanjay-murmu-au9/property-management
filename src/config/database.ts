import { DataSource } from 'typeorm';
import { Campaign } from '../models/campaign';
import { Contact } from '../models/Contact';
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

// Export final configuration
export const AppDataSource = new DataSource({
  type: 'postgres',
  url: `${process.env.DATABASE_URL}?sslmode=require`,
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [Campaign, Contact],
  subscribers: [],
  migrations: [path.join(__dirname, '..', '..', 'migrations', '*.{js,ts}')],
  migrationsTableName: "migrations_history",
  extra: {
    max: 10 // connection pool max size
  }
});