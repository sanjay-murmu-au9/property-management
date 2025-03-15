# Property Management System Backend

A Node.js backend application for property management built with TypeScript, Express, and MySQL.

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

## Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd property-management
```

2. Install dependencies:
```bash
npm install
```

3. Environment Setup:
   - Copy `.env.example` to `.env`
   - Update the environment variables in `.env` with your configuration

4. Database Setup:
   - Create a MySQL database
   - Update the database configuration in `.env` file
   - Run migrations:
   ```bash
   npm run migration:run
   ```

5. Start the development server:
```bash
npm run dev
```

The server will start on http://localhost:3000 (or the port specified in your .env file)

## Available Scripts

- `npm run dev`: Start the development server with hot-reload
- `npm run build`: Build the TypeScript code
- `npm start`: Start the production server
- `npm run migration:generate`: Generate new database migrations
- `npm run migration:run`: Run database migrations
- `npm run migration:revert`: Revert the last database migration

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Request handlers
├── middlewares/    # Custom middleware functions
├── models/         # Database models
├── routes/         # API routes
├── services/       # Business logic
├── types/          # TypeScript type definitions
├── utils/         # Utility functions
└── index.ts       # Application entry point
```

## API Documentation

The API documentation will be available at `/api-docs` endpoint (coming soon). 