import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { AppDataSource } from '../index';
import { User } from '../models/User';
import { UserRole } from '../types/models';

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await AppDataSource.getRepository(User).findOne({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email']
    },
    async (_accessToken: string, _refreshToken: string, profile: any, done: any) => {
      try {
        const userRepository = AppDataSource.getRepository(User);
        
        // Check if user already exists
        let user = await userRepository.findOne({
          where: { email: profile.emails?.[0].value }
        });

        if (!user) {
          // Create new user
          user = userRepository.create({
            email: profile.emails?.[0].value,
            firstName: profile.name?.givenName || '',
            lastName: profile.name?.familyName || '',
            password: '', // Empty password for Google auth users
            role: UserRole.TENANT,
            isActive: true
          });

          await userRepository.save(user);
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
); 