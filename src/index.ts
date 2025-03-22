import 'reflect-metadata';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { dbConfig } from './config/database';
import routes from './routes';
import logger from './utils/logger';

// Load environment variables
config();

// Initialize Express app
const app = express();

// Production security configurations
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now()
  };
  try {
    res.send(healthcheck);
  } catch (error) {
    healthcheck.message = error instanceof Error ? error.message : 'Error';
    res.status(503).send(healthcheck);
  }
});

// Routes
app.use('/api', routes);

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message
  });
});

// Handle 404
app.use((req: Request, res: Response) => {
  logger.warn(`Route not found: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Initialize TypeORM connection and start server
export const AppDataSource = new DataSource(dbConfig);

const startServer = async () => {
  try {
    logger.info('Starting server initialization...');
    logger.info('Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      CORS_ORIGIN: process.env.CORS_ORIGIN
    });

    // Initialize database connection with retries
    let retries = 5;
    while (retries > 0) {
      try {
        await AppDataSource.initialize();
        logger.info('Database connection established successfully::::::');
        break;
      } catch (error) {
        retries -= 1;
        if (retries === 0) {
          throw error;
        }
        logger.warn(`Failed to connect to database. Retries left: ${retries}`, error);
        // Wait for 5 seconds before retrying
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    const PORT = process.env.PORT || 15558;
    const server = app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT} in ${process.env.NODE_ENV} mode`);
      logger.info(`CORS origin: ${process.env.CORS_ORIGIN}`);
    });

    // Handle server shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM signal received. Closing server...');
      server.close(async () => {
        logger.info('Server closed. Closing database connection...');
        await AppDataSource.destroy();
        logger.info('Database connection closed.');
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    if (error instanceof Error) {
      logger.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    // Exit with error
    process.exit(1);
  }
};

// Start the server
startServer().catch((error) => {
  logger.error('Unhandled server startup error:', error);
  process.exit(1);
}); 