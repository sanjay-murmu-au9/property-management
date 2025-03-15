import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { dbConfig } from './config/database';

config();

export const AppDataSource = new DataSource(dbConfig); 