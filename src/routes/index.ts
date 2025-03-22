import { Router } from 'express';
import userRoutes from './user.routes';
import authRoutes from './auth.routes';
import contactRoutes from './contact.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/contact', contactRoutes);

export default router;