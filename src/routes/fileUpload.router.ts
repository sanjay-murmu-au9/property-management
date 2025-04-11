import { Router } from 'express';
import { FileUploadController, upload } from '../controllers/fileUpload.controller';
import { auth } from '../middlewares/auth.middleware';

const router = Router();
const fileUploadController = new FileUploadController();

// Upload file
router.post('/upload', auth, upload.single('file'), (req, res) => fileUploadController.uploadFile(req, res));

// Get file URL
router.get('/:fileName', auth, (req, res) => fileUploadController.getFile(req, res));

// Delete file
router.delete('/:fileName', auth, (req, res) => fileUploadController.deleteFile(req, res));

export default router; 