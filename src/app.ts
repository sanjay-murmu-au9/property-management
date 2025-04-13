import express from 'express';
import morgan from 'morgan';
import passport from 'passport';
import session from 'express-session';
import routes from './routes';
import './config/passport';

const app = express();

// Middleware
app.use(morgan('dev'));


// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false
  })
);

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api', routes);

export default app;