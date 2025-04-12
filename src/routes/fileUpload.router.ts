import { Router } from 'express';
import { FileUploadController } from '../controllers/fileUpload.controller';
import { auth } from '../middlewares/auth.middleware';

const router = Router();

// Upload a single file
router.post('/upload', auth, FileUploadController.upload.single('file'), FileUploadController.uploadFile);

// Get a file URL
router.get('/:fileName', auth, FileUploadController.getFile);

// Delete a file
router.delete('/:fileName', auth, FileUploadController.deleteFile);

// Get all files for an entity
router.get('/entity/:entityType/:entityId', auth, FileUploadController.getEntityFiles);

export default router; 