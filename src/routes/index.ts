import { Router } from 'express';
import userRoutes from './user.routes';
import authRoutes from './auth.routes';
import contactRoutes from './contact.routes';
import campaignRoutes from './campaign.router';
import fileUploadRoutes from './fileUpload.router';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/contact', contactRoutes);
router.use('/campaign', campaignRoutes);
router.use('/files', fileUploadRoutes);

export default router;