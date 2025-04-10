import { Router } from 'express';
import { CampaignController } from '../controllers/campaign.controller';
import { Request, Response, NextFunction } from 'express';

const router = Router();
const campaignController = new CampaignController();

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await campaignController.createCampaign(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;

