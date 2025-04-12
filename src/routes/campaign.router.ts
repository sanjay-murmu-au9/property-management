import { Router } from 'express';
import { CampaignController } from '../controllers/campaign.controller';

const router = Router();
const campaignController = new CampaignController();


router.post('/',(req,res) => campaignController.createCampaign(req,res));

export default router;

