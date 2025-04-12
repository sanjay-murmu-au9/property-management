import { Router } from 'express';
import { CampaignController } from '../controllers/campaign.controller';
import multer from 'multer';

const router = Router();
const campaignController = new CampaignController();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Create campaign route with file upload support
router.post('/', upload.single('file'), (req, res) => campaignController.createCampaign(req, res));

export default router;

