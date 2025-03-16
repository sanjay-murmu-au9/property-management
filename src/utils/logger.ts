import { createLogger, format, transports, Logger } from 'winston';

const { combine, timestamp, printf, colorize } = format;

const myFormat = printf((info) => {
  return `${info.timestamp} ${info.level}: ${info.message}`;
});

const logger: Logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp(),
    myFormat
  ),
  transports: [
    new transports.Console({
      format: combine(
        colorize(),
        timestamp(),
        myFormat
      )
    }),
    // Add file transport in production
    ...(process.env.NODE_ENV === 'production' ? [
      new transports.File({ filename: 'error.log', level: 'error' }),
      new transports.File({ filename: 'combined.log' })
    ] : [])
  ]
});

export default logger; 