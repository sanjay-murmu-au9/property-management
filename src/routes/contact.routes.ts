import { Router, Request, Response, NextFunction } from 'express';
import { ContactController } from '../controllers/contact.controller';

const router = Router();
const contactController = new ContactController();

// Submit contact form route - no validation
router.post('/portfolio/message', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await contactController.submitContact(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;