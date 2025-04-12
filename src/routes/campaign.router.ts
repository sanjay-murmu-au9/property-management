import { Router } from 'express';
import { CampaignController } from '../controllers/campaign.controller';
import multer from 'multer';

const router = Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Create campaign route with file upload support
router.post('/', upload.single('file'), CampaignController.createCampaign);

// Update campaign route with file upload support
router.put('/:id', upload.single('file'), CampaignController.updateCampaign);

export default router;

